'use strict';

const http = require('http');
const url = require('url');
const querystring = require('querystring');
const tcpClient = require('./client');

const mapClients = {};
const mapUrls = {};
const mapResponse = {};
const mapRR = {};
let index = 0;

const server = http.createServer((req, res) => {
  const method = req.method;
  const uri = url.parse(req.url, true);
  const pathname = uri.pathname;

  if (['POST', 'PUT'].includes(method)) {
    let body = '';

    req.on('data', data => body += data);
    req.on('end', () => {
      let params;

      if (req.headers['content-type'] == 'application/json') {
        params = JSON.parse(body);
      } else {  // If header is not a json then parse as querystring
        params = querystring.parse(body);
      }

      onRequest(res, method, pathname, params);
    });
  } else {
    onRequest(res, method, pathname, uri.query);
  }
}).listen(8000, () => {
  console.log('listen', server.address());

  // The packet which to deliver to the Distributor
  const packet = {
    uri: '/distributes',
    method: 'POST',
    key: 0,
    params: {
      prot: 8000,
      name: 'gate',
      urls: []
    }
  };
  let isConnectedDistributor = false;

  this.clientDistributor = new tcpClient( // Connect to the Distributor
    '127.0.0.1', 9000
    , options => {  // The event when the connection was completed
      isConnectedDistributor = true;
      this.clientDistributor.write(packet);
    }
    , (options, data) => onDistribute(data) // The event when data was received
    , options => isConnectedDistributor = false // The event when connection closed
    , options => isConnectedDistributor = false // The event when error occurred
  );

  // Re connect to the Distributor
  setInterval(() => {
    if (!isConnectedDistributor) {
      this.clientDistributor.connect();
    }
  }, 3000);
});

function onRequest(res, method, pathname, params) {
  const key = method + pathname;
  const client = mapUrls[key];
  if (client == null) {
    res.writeHead(404);
    res.end();
    return;
  } else {
    params.key = index; // Generate the unique key
    const packet = {
      uri: pathname,
      method,
      params
    };
    mapResponse[index++] = res; // Save the response object by requested
    // Processing as Round Robin
    if (mapRR[key] == null) mapRR[key] = 0;
    mapRR[key]++;
    client[mapRR[key] % client.length].write(packet); // Request to the microservice
  }
}

/**
 * Processing received data from Distributor
 * 
 * @param {*} data 
 */
function onDistribute(data) {
  for (let n in data.params) {
    const node = data.params[n];
    const key = `${node.host}:${node.port}`;
    if (mapClients[key] == null && node.name != 'gate') {
      const client = new tcpClient(node.host, node.port
        , onCreateClient, onReadClient, onEndClient, onErrorClient);
      // Save the information of microservices
      mapClients[key] = {
        client,
        info: node
      };

      // Save the urls of microservices
      for (let m in node.urls) {
        const key = node.urls[m];
        if (mapUrls[key] == null) {
          mapUrls[key] = [];
        }
        mapUrls[key].push(client);
      }
      client.connect();
    }
  }
}

function onCreateClient(options) {
  console.log('onCreateClient');
}

/**
 * The response of microservices
 * 
 * @param {*} options 
 * @param {*} packet 
 */
function onReadClient(options, packet) {
  console.log('onReadClient', packet);
  mapResponse[packet.key].writeHead(200, {
    'Content-Type': 'application/json'
  });
  mapResponse[packet.key].end(JSON.stringify(packet));
  delete mapResponse[packet.key];
}

/**
 * Processing disconnection of microservices
 * 
 * @param {*} options 
 */
function onEndClient(options) {
  const key = `${options.host}:${options.port}`;
  console.log('onEndClient', mapClients[key]);

  for (let n in mapClients[key].info.urls) {
    const node = mapClients[key].info.urls[n];
    delete mapUrls[node];
  }
  delete mapClients[key];
}

function onErrorClient(options) {
  console.log('onErrorClient');
}