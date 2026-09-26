#!/usr/bin/env python3
# WHAT THIS SCRIPT DOES
# Reviews every HTML page in this project using a running Chromium browser.
# It checks layouts at 320, 390, 768, 1024 and 1440 pixels wide to cover
# small phones, larger phones, tablets and desktop screens.
#
# For each page and screen width, it checks for horizontal page overflow,
# broken or unfinished image loads, and links to missing page sections.
# It saves screenshots at mobile and desktop widths plus a results.json
# report, and prints PASS or FAIL for each check in the terminal.
# Reports go into a new temporary folder unless --output specifies a folder.
#
# The script opens a separate browser tab and closes that tab when finished.
# It does not edit the website, submit forms, make payments or follow external
# links. Pages may still load their normal external fonts, images and scripts.
# It is a layout check, not a full accessibility, security or usability audit.
# Run with --help for dependencies, browser setup and command examples.
# Exit codes: 0 = all checks passed, 1 = failed checks, 2 = could not finish.

"""Read-only browser layout audit for this website.

Install dependency: python3 -m pip install websocket-client
Start a separate browser first (keep it running):
  chromium --headless --disable-gpu --user-data-dir=/tmp/echokushu-ui-audit \
    --remote-debugging-port=9222 --remote-allow-origins=http://localhost:9222 about:blank
Run from any directory:
  python3 /path/to/audit.ui.py
  python3 /path/to/audit.ui.py --output /tmp/my-ui-report

Audits local HTML files at five widths without submitting forms or following
external links. Requires network access for externally hosted fonts/icons.
Produces JSON results and desktop/mobile screenshots. Exit 1 means a failed
check; exit 2 means the audit could not run. Does not assess legal compliance,
backend delivery, payments, contrast or the full accessibility experience.
"""
import argparse
import base64
import json
from pathlib import Path
import sys
import tempfile
import time
import urllib.request


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument('--root', type=Path, default=Path(__file__).resolve().parent)
    parser.add_argument('--output', type=Path, help='Report directory (default: a new temporary folder)')
    parser.add_argument('--port', type=int, default=9222)
    args = parser.parse_args()
    import websocket

    root = args.root.resolve()
    pages = sorted(root.rglob('*.html'))
    if not pages:
        raise RuntimeError(f'No HTML pages found in {root}')
    output = args.output or Path(tempfile.mkdtemp(prefix='echokushu-ui-audit-'))
    output.mkdir(parents=True, exist_ok=True)
    endpoint = f'http://localhost:{args.port}'
    request = urllib.request.Request(endpoint + '/json/new?about:blank', method='PUT')
    with urllib.request.urlopen(request, timeout=10) as response:
        target = json.load(response)
    ws = websocket.create_connection(target['webSocketDebuggerUrl'], origin=endpoint, timeout=30)
    counter = 0

    def call(method, params=None):
        nonlocal counter
        counter += 1
        ws.send(json.dumps({'id': counter, 'method': method, 'params': params or {}}))
        while True:
            response = json.loads(ws.recv())
            if response.get('id') == counter:
                if 'error' in response:
                    raise RuntimeError(response['error'])
                return response.get('result', {})

    def evaluate(expression):
        response = call('Runtime.evaluate', {'expression': expression, 'returnByValue': True, 'awaitPromise': True})
        if 'exceptionDetails' in response:
            raise RuntimeError(response['exceptionDetails'])
        return response['result'].get('value')

    checks = []
    try:
        call('Page.enable')
        for page in pages:
            result = call('Page.navigate', {'url': page.as_uri()})
            if result.get('errorText'):
                raise RuntimeError(f'{page.name}: {result["errorText"]}')
            time.sleep(.4)
            evaluate('''async function ready() {
                const images = [...document.images];
                images.forEach(i => i.loading = 'eager');
                await Promise.race([
                    Promise.all(images.map(i => i.complete ? Promise.resolve() : new Promise(resolve => {
                        i.addEventListener('load', resolve, {once: true});
                        i.addEventListener('error', resolve, {once: true});
                    }))), new Promise(resolve => setTimeout(resolve, 5000))
                ]);
                if (document.fonts) await Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 3000))]);
            }; ready()''')
            for width in [320, 390, 768, 1024, 1440]:
                call('Emulation.setDeviceMetricsOverride', {'width': width, 'height': 900, 'deviceScaleFactor': 1, 'mobile': False})
                time.sleep(.1)
                result = evaluate('''(() => ({
                    overflow: document.documentElement.scrollWidth > innerWidth,
                    brokenImages: [...document.images].filter(i => i.complete && !i.naturalWidth).map(i => i.getAttribute('src')),
                    pendingImages: [...document.images].filter(i => !i.complete).map(i => i.getAttribute('src')),
                    badAnchors: [...document.querySelectorAll('a[href^="#"]')].filter(a => a.hash.length > 1 && !document.getElementById(decodeURIComponent(a.hash.slice(1)))).map(a => a.hash)
                }))()''')
                passed = not any(result.values())
                entry = {'page': str(page.relative_to(root)), 'width': width, 'passed': passed, **result}
                checks.append(entry)
                print(f'{"PASS" if passed else "FAIL"}: {entry["page"]} at {width}px', flush=True)
                if width in [390, 1440]:
                    shot = call('Page.captureScreenshot', {'format': 'jpeg', 'quality': 70})
                    name = str(page.relative_to(root)).replace('/', '-') + f'-{width}.jpg'
                    (output / name).write_bytes(base64.b64decode(shot['data']))
    finally:
        (output / 'results.json').write_text(json.dumps(checks, indent=2) + '\n')
        ws.close()
        try:
            urllib.request.urlopen(endpoint + '/json/close/' + target['id'], timeout=5).close()
        except OSError:
            pass
    failed = sum(not entry['passed'] for entry in checks)
    print(f'\n{len(checks)} checks, {failed} failures. Report: {output.resolve()}')
    return 1 if failed else 0


if __name__ == '__main__':
    try:
        sys.exit(main())
    except (ImportError, OSError, RuntimeError) as error:
        print(f'Audit could not finish: {error}\nRun with --help for setup instructions.', file=sys.stderr)
        sys.exit(2)
