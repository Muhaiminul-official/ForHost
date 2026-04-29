import http from 'http';

const data = JSON.stringify({
  name: 'Test',
  email: 'test@test.com',
  password: 'password',
  studentId: '123',
  bloodGroup: 'A+'
});

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/auth/register',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data)
  }
};

const req = http.request(options, (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => console.log('Response:', res.statusCode, body));
});

req.write(data);
req.end();
