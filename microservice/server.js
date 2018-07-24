'use strict';

const net = require('net');
const tcpClient = require('./client');

class tcpServer {
  constructor(name, port, urls) {
    this.logTcpClient = null;
    // The information of server status
    this.context = {
      name, port, urls
    };
    this.merge = {};
    this.server = net.createServer(socket => {
      // The event when client is connected
      this.onCreate(socket);
      socket.on('error', exception => this.onClose(socket));
      socket.on('close', () => this.onClose(socket));
      socket.on('data', data => {
        const key = `${socket.remoteAddress}:${socket.remotePort}`;
        const sz = this.merge[key] ? this.merge[key] + data.toString() : data.toString();
        const arr = sz.split('¶');
        for (let n in arr) {
          if (sz.charAt(sz.length - 1) != '¶' && n == arr.length - 1) {
            this.merge[key] = arr[n];
            break;
          } else if (arr[n] == '') {
            break;
          } else {
            this.writeLog(arr[n]);
            this.onRead(socket, JSON.parse(arr[n]));
          }
        }
      });
    });

    this.server.on('error', err => console.log(err));
    this.server.listen(port, () => console.log(this.server.address()));
  }

  onCreate(socket) {
    console.log('onCreate', socket.remoteAddress, socket.remotePort);
  }

  onClose(socket) {
    console.log('onClose', socket.remoteAddress, socket.remotePort);
  }

  // The method for Connect to the Distributor
  connectToDistributor(host, port, onNoti) {
    // The packet to be delivered to Distributor
    const packet = {
      uri: '/distributes',
      method: 'POST',
      key: 0,
      params: this.context
    };
    let isConnectedDistributor = false;

    this.clientDistributor = new tcpClient(
      host
    , port
    , options => {  // The event when server connected to Distributor
      isConnectedDistributor = true;
      this.clientDistributor.write(packet);
    }
    , (options, data) => { // The event when received data from Distributor
      // Conntect to the log of microservice
      if (this.logTcpClient == null && this.context.name != 'logs') { // Log API is not have to connect to the logs
        for (let n in data.params) {
          const ms = data.params[n];
          if (ms.name === 'logs') {
            this.connectToLog(ms.host, ms.port);
            break;
          }
        }
      }

      onNoti(data);
    }
    , options => isConnectedDistributor = false // The event when disconnected from Distributor
    , options => isConnectedDistributor = false // The event when occurred error between Distributor
    );

    // Retrying connect to the Distributor
    setInterval(() => {
      if (!isConnectedDistributor) {
        this.clientDistributor.connect();
      }
    }, 3000);
  }

  connectToLog(host, port) {
    this.logTcpClient = new tcpClient(
      host, port
      , options => {}
      , options => this.logTcpClient = null
      , options => this.logTcpClient = null
    );
    this.logTcpClient.connect();
  }

  writeLog(log) {
    if (this.logTcpClient) {
      const packet = {
        uri: '/logs',
        method: 'POST',
        key: 0,
        params: log
      };
      this.logTcpClient.write(packet);
    } else {
      console.log(log);
    }
  }
}

module.exports = tcpServer;