const net = require('net');

const options = {
  host: '127.0.0.1',
  port: 9000
};

const client = net.connect(options, () => {
  console.log('connected');
});

client.on('data', data => {
  console.log(data, data.toString());
});

client.on('end', () => {
  console.log('disconnected');
});

client.on('error', err => {
  console.log(err);
});