'use strict';

const cluster = require('cluster');
const business = require('../../monolithic/monolithic_goods');

class goods extends require('../server') {
  constructor() {
    super('goods'
      , process.argv[2] ? Number(process.argv[2]) : 9010
      , ['POST/goods', 'GET/goods', 'DELETE/goods']
    );

    // Connect to the Distributor
    this.connectToDistributor('127.0.0.1', 9000, data => {
      console.log('Distributor Notification', data);
    });
  }

  // Call the business logic by request of client
  onRead(socket, data) {
    console.log('onRead', socket.remoteAddress, socket.remotePort, data);
    business.onRequest(socket, data.method, data.uri, data.params, (s, packet) => {
      socket.write(JSON.stringify(packet) + '¶');
    });
  }
}

if (cluster.isMaster) {
  cluster.fork(); // Create the child process

  // When child process died, fork the child again for high availability
  cluster.on('exit', (worker, code, signal) => {
    console.log(`worker ${worker.process.pid} died`);
    cluster.fork();
  });
} else {
  new goods();
}