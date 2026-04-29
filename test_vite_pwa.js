import http from 'http';

http.get('http://localhost:3000/sw.js', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => console.log('STATUS sw.js:', res.statusCode));
}).on('error', err => console.error(err));

http.get('http://localhost:3000/manifest.json', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => console.log('STATUS manifest:', res.statusCode));
}).on('error', err => console.error(err));
