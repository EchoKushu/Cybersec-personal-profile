const form = document.getElementById('signature-form');
const record = document.getElementById('signature-record');
const status = document.getElementById('status');
form.addEventListener('input', event => {
    if (event.target.id !== 'consent') document.getElementById('consent').checked = false;
    record.hidden = true;
    status.textContent = '';
});
form.addEventListener('submit', (event) => {
    event.preventDefault();
    const fields = ['full-name', 'phone', 'address'].map(id => document.getElementById(id));
    fields.forEach(field => {
        field.value = field.value.trim();
    });
    if (!form.reportValidity()) return;
    const [name, phone, address] = fields.map(field => field.value);
    const recordedAt = new Date().toISOString();
    document.getElementById('record-name').textContent = name;
    document.getElementById('record-phone').textContent = phone;
    document.getElementById('record-address').textContent = address;
    document.getElementById('record-date').textContent = recordedAt;
    record.hidden = false;
    record.setAttribute('tabindex', '-1');
    record.focus();
    const contents = [
        'ECHO KUSHU LTD — Customer signature record',
        'Agreement: ECHO_KUSHU_LTD_Website_Service_Customer_Agreement_FINAL.pdf (7 pages)',
        '', `Full name / typed signature: ${name}`, `Phone: ${phone}`,
        `Address: ${address}`, `Date and time recorded (UTC): ${recordedAt}`, '',
        'I have read and agree to the agreement identified above and intend my typed full name to be my signature.', '',
        'Created on the customer’s device. Not a receipt of submission or a countersignature by ECHO KUSHU LTD.',
        'Keep this record with the original agreement and send both through your agreed contact method.'
    ].join('\n');
    const url = URL.createObjectURL(new Blob([contents], { type: 'text/plain;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'ECHO_KUSHU_customer_signature.txt';
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    status.textContent = 'Signature record prepared and download requested. Nothing has been sent. You can also print or save the record as PDF below.';
});
document.getElementById('print-record').addEventListener('click', () => window.print());
