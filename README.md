# Echo Kushu Ltd Website

Static corporate website for Echo Kushu Ltd, built with HTML, CSS and JavaScript.

## Main pages

- `index.html` - Homepage
- `about.html` - Company profile
- `technology.html` - Technology & Cybersecurity division
- `business.html` - Business Development & Analysis division
- `events.html` - Events, Sustainability & Innovation division
- `projects.html` - Portfolio and developing initiatives
- `contact.html` - Enquiry form

## Run locally

From the project directory:

```bash
python3 -m http.server 4173
```

Open `http://127.0.0.1:4173/`.

## Deployment

The project is configured for GitHub Pages through the `CNAME` file. Publish the repository to its GitHub Pages branch and keep the existing custom-domain DNS configuration.

## Existing integrations

- Enquiries: Formspree
- Website payments: GoCardless
- Customer agreements: local PDF and typed-signature record pages

Do not expose API keys or secrets in frontend files.

## Layout audit

The browser audit script checks all HTML pages at 320, 390, 768, 1024 and 1440 pixels:

```bash
chromium --headless --disable-gpu --no-sandbox \
  --user-data-dir=/tmp/echokushu-ui-audit \
  --remote-debugging-port=9222 \
  --remote-allow-origins=http://localhost:9222 about:blank

python3 audit.ui.py --output /tmp/echokushu-ui-audit-report
```
