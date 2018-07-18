const http = require('http');
const url = require('url');
const querystring = require('querystring');

const members = require('./monolithic_members');
const goods = require('./monolithic_goods');
const purchases = require('./monolithic_purchases');

/**
 * Create the HTTP server and response the request
 */
const server = http.createServer((req, res) => {
  const method = req.method;
  const uri = url.parse(req.url, true);
  const pathname = uri.pathname;

  if (method === 'POST' || method === 'PUT') {
    let body = '';

    req.on('data', data => body += data);
    req.on('end', () => {
      let params;
      if (req.headers['content-type'] === 'application/json') {
        params = JSON.parse(body);
      } else {
        params = querystring.parse(body);
      }
      onRequest(res, method, pathname, params);
    });
  } else {
    onRequest(res, method, pathname, uri.query);
  }
}).listen(8000);

/**
 * Divide by modules from request which are managing members, product and purchase
 * 
 * @param {*} res 
 * @param {*} method 
 * @param {*} pathname 
 * @param {*} params 
 */
function onRequest(res, method, pathname, params) {
  switch (pathname) {
    case '/members':
      members.onRequest(res, method, pathname, params, response);
      break;
    case '/goods':
      goods.onRequest(res, method, pathname, params, response);
      break;
    case '/purchases':
      purchases.onRequest(res, method, pathname, params, response);
      break;
    default:
      res.writeHead(404);
      return res.end();
  }
}

/**
 * Response as JSON type to the HTTP header
 * 
 * @param {*} res 
 * @param {*} packet 
 */
function response(res, packet) {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(packet));
}