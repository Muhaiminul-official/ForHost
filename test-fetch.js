import http from 'http';

http.get('http://localhost:3000/api/requests', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log('STATUS:', res.statusCode, 'DATA:', data));
}).on('error', err => console.error(err));
