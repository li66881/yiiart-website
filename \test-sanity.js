const https = require('https');

const options = {
  hostname: 'zlh03v8i.api.sanity.io',
  port: 443,
  path: '/v2024-01-01/data/query/production?query=' + encodeURIComponent('*[_type == "artist"][0..2]'),
  method: 'GET',
  timeout: 10000,
};

const req = https.get(options, (res) => {
  let data = '';
  res.on('data', (d) => { data += d; });
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Response:', data.slice(0, 500));
  });
});

req.on('error', (e) => console.error('ERROR:', e.message));
req.on('timeout', () => { req.destroy(); console.log('TIMEOUT'); });
