const https = require('https');

function makeRequest(method, path, data) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'www.yiiart.com',
      port: 443,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 15000,
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (d) => { body += d; });
      res.on('end', () => {
        resolve({ status: res.statusCode, body: body.slice(0, 1000) });
      });
    });

    req.on('error', (e) => reject(e.message));
    req.on('timeout', () => { req.destroy(); reject('TIMEOUT'); });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

(async () => {
  try {
    // Test GET
    console.log('Testing GET /api/seed...');
    const getResult = await makeRequest('GET', '/api/seed', null);
    console.log('GET result:', JSON.stringify(getResult));

    // Test POST (seed)
    console.log('\nTesting POST /api/seed...');
    const postResult = await makeRequest('POST', '/api/seed', { token: 'yiiart-seed-secret' });
    console.log('POST result:', JSON.stringify(postResult));
  } catch (e) {
    console.error('Error:', e);
  }
})();
