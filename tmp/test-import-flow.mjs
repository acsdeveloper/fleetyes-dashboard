const ONTRACK_BASE = 'https://ontrack-api.agilecyber.com/int/v1';
const USERNAME = 'developer+administrator@agilecyber.com';
const PASSWORD = 'Agilex2025$';

// Step 0: Login
console.log('--- Step 0: Login ---');
const loginRes = await fetch(`${ONTRACK_BASE}/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ identity: USERNAME, password: PASSWORD, remember: false }),
});
if (!loginRes.ok) {
  console.error('Login failed:', loginRes.status, await loginRes.text());
  process.exit(1);
}
const { token } = await loginRes.json();
console.log('Token obtained:', token.substring(0, 20) + '...');

// Step 1: Upload a test CSV file
console.log('\n--- Step 1: Upload file via /files/upload ---');
const csvContent = [
  'block_id,driver_name,plate_number,fleet_name,scheduled_at,estimated_end_date,pickup_code,dropoff_code',
  'TEST001,Test Driver,AB12CDE,Test Fleet,2026-04-05 08:00,2026-04-05 17:00,DEP001,DEP002',
].join('\n');

const fd1 = new FormData();
fd1.append('file', new Blob([csvContent], { type: 'text/csv' }), 'test-import.csv');

const uploadRes = await fetch(`${ONTRACK_BASE}/files/upload`, {
  method: 'POST',
  headers: { Authorization: `Bearer ${token}` },
  // NO Content-Type — browser/Node must set it with boundary
  body: fd1,
});
const uploadText = await uploadRes.text();
console.log('Upload status:', uploadRes.status);
console.log('Upload response:', uploadText);

if (!uploadRes.ok) {
  console.error('\nFAILED at Step 1 — file upload returned', uploadRes.status);
  process.exit(1);
}

const uploadData = JSON.parse(uploadText);
const fileUuid = uploadData.uuid;
if (!fileUuid) {
  console.error('\nFAILED at Step 1 — no uuid in response:', uploadText);
  process.exit(1);
}
console.log('File UUID:', fileUuid);

// Step 2a: Try sending file_uuid as FormData field
console.log('\n--- Step 2 (attempt A): file_uuid as FormData field ---');
const fd2a = new FormData();
fd2a.append('file_uuid', fileUuid);

const places2aRes = await fetch(
  `${ONTRACK_BASE}/orders/process-import-create-missing-places`,
  {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: fd2a,
  }
);
const places2aText = await places2aRes.text();
console.log('Status:', places2aRes.status);
console.log('Response:', places2aText.substring(0, 600));

// Step 2b: Try sending file_uuid as JSON
console.log('\n--- Step 2 (attempt B): file_uuid as JSON body ---');
const places2bRes = await fetch(
  `${ONTRACK_BASE}/orders/process-import-create-missing-places`,
  {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ file_uuid: fileUuid }),
  }
);
const places2bText = await places2bRes.text();
console.log('Status:', places2bRes.status);
console.log('Response:', places2bText.substring(0, 600));

// Step 2c: Try with the actual file again (raw multipart)
console.log('\n--- Step 2 (attempt C): actual file as multipart field ---');
const fd2c = new FormData();
fd2c.append('file', new Blob([csvContent], { type: 'text/csv' }), 'test-import.csv');

const places2cRes = await fetch(
  `${ONTRACK_BASE}/orders/process-import-create-missing-places`,
  {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: fd2c,
  }
);
const places2cText = await places2cRes.text();
console.log('Status:', places2cRes.status);
console.log('Response:', places2cText.substring(0, 600));
