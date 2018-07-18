const mysql = require('mysql');
const conn = {
  host: 'localhost',
  user: 'micro',
  password: 'service',
  database: 'monolithic'
};

/**
 * Divide by each functions of perchases
 * 
 * @param {*} res 
 * @param {*} method 
 * @param {*} pathname 
 * @param {*} params 
 * @param {*} cb 
 */
exports.onRequest = function(res, method, pathname, params, cb) {
  switch (method) {
    case 'POST':
      return register(method, pathname, params, response => {
        process.nextTick(cb, res, response);
      });
    case 'GET':
      return inquiry(method, pathname, params, response => {
        process.nextTick(cb, res, response);
      });
    default:
      return process.nextTick(cb, res, null);
  }
}

/**
 * The function of register the purchases
 * 
 * @param {*} method 
 * @param {*} pathname 
 * @param {*} params 
 * @param {*} cb 
 */
function register(method, pathname, params, cb) {
  const response = {
    key: params.key,
    errorcode: 0,
    errormessage: 'success'
  };

  if (params.userid == null || params.goodsid == null) {
    response.errorcode = 1;
    response.errormessage = 'Invalid Parameters';
    cb(response);
  } else {
    const connection = mysql.createConnection(conn);
    connection.connect();
    connection.query('insert into purchases(userid, goodsid) values (?, ?)'
    , [params.userid, params.goodsid]
    , (err, results, fields) => {
      if (err) {
        response.errorcode = 1;
        response.errormessage = err;
      }
      cb(response);
    });
    connection.end();
  }
}

/**
 *  The function of inquiry the purchsases
 * 
 * @param {*} method 
 * @param {*} pathname 
 * @param {*} params 
 * @param {*} cb 
 */
function inquiry(method, pathname, params, cb) {
  const response = {
    key: params.key,
    errorcode: 0,
    errormessage: 'success'
  };

  if (params.userid == null) {
    response.errorcode = 1;
    response.errormessage = 'Invalid Parameters';
    cb(response);
  } else {
    const connection = mysql.createConnection(conn);
    connection.connect();
    connection.query('select id, goodsid, date from purchases where userid = ?'
    , [params.userid]
    , (err, results, fields) => {
      if (err) {
        response.errorcode = 1;
        response.errormessage = err;
      } else {
        response.results = results;
      }
      cb(response);
    });
    connection.end();
  }
}