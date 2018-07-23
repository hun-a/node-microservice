'use strict';

const business = require('../../monolithic/monolithic_members');

class members extends require('../server') {
  constructor() {
    super('members'
      , process.argv[2] ? Number(process.argv[2]) : 9020
      , ['POST/members', 'GET/members', 'DELETE/members']
    );

    // Connect to the Distributor
    this.connectToDistributor('127.0.0.1', 9000, data => {
      console.log('Distributor Notification', data);
    });
  }

  // Call the business logic by request of client
  onRead(socket, data) {
    console.log('onRead', socket.remoteAddress, socket.remotePort, data);
    business.onRequest(socket, data.method, data.uri, data.params, (s, packet) =>{
      socket.write(JSON.stringify(packet) + '¶');
    });
  }
}

new members();