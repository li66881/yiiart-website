const https = require('https');

const data = JSON.stringify({
  key: 'NEXTAUTH_SECRET',
  value: 'yiiart-super-secret-key-change-in-production-12345',
  type: 'encrypted',
  decrypted: true
});

const options = {
  hostname: 'api.vercel.com',
  path: '/v10/projects/prj_KP6wU5OrzfxW5LqSRLdbkUPR4XKQ/env',
  method: 'POST',
  headers: {
    'Authorization': 'Bearer vcp_7dT9KPnWTuh3yl6D0F0Z5AFO71KeK8N3i9wOeIJoDN22Xtjnmr3x5Uur',
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data)
  }
};

const req = https.request(options, (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => console.log(body));
});

req.on('error', e => console.error(e));
req.write(data);
req.end();
