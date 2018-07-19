'use strict';

let map = {};

class distributor extends require('./server') {
  constructor() {
    super('distributor', 9000, ['POST/distributes', 'GET/distributes']);
  }

  onCreate(socket) {
    console.log('onCreate', socket.remoteAddress, socket.remotePort);
    this.sendInfo(socket);
  }

  onClose(socket) {
    const key = `${socket.remoteAddress}:${socket.remotePort}`;
    console.log('onClose', socket.remoteAddress, socket.remotePort);
    delete map[key];
    this.sendInfo();
  }

  // Register the new node
  onRead(socket, json) {
    const key = `${socket.remoteAddress}:${socket.remotePort}`;
    console.log('onRead', socket.remoteAddress, socket.remotePort, json);
    if (json.uri == '/distributes' && json.method == 'POST') {
      map[key] = { socket };
      map[key].info = json.params;
      map[key].info.host = socket.remoteAddress;
      this.sendInfo();
    }
  }

  // Send the packet to the specific socket
  write(socket, packet) {
    socket.write(JSON.stringify(packet) + '¶');
  }

  // Sending the information of connected nodes
  sendInfo(socket) {
    const packet = {
      uri: '/distributes',
      method: 'GET',
      key: 0,
      params: []
    };
    for (let n in map) {
      packet.params.push(map[n].info);
    }
    if (socket) { // Send to specific node 
      this.write(socket, packet);
    } else {  // Broadcast to the all nodes
      for (let n in map) {
        this.write(map[n].socket, packet);
      }
    }
  }
}

new distributor();