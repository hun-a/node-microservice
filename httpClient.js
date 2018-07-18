const http = require('http');

const options = {
  host: '127.0.0.1',
  port: 8000,
  path: '/'
};

const req = http.request(options, res => {
  var data = '';
  res.on('data', chunk => {
    data += chunk;
  });
  res.on('end', () => {
    console.log(data);
  });
});

req.end();