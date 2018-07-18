const mysql = require('mysql');
const conn = {
  host: 'localhost',
  user: 'micro',
  password: 'service',
  database: 'monolithic'
};

/**
 * Divide by each functions of goods
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
    case 'DELETE':
      return unregister(method, pathname, params, response => {
        process.nextTick(cb, res, response);
      });
    default:
      return process.nextTick(cb, res, null);
  }
};

/**
 * The function of register the goods
 * 
 * @param {*} method 
 * @param {*} pathname 
 * @param {*} params 
 * @param {*} cb 
 */
function register(method, pathname, params, cb) {
  const response = {
    errorcode: 0,
    errormessage: 'success'
  };

  if (params.name == null || params.category == null || params.price == null || params.description == null) {
    response.errorcode = 1;
    response.errormessage = 'Invalid Parameters';
    cb(response);
  } else {
    const connection = mysql.createConnection(conn);
    connection.connect();
    connection.query('insert into goods(name, category, price, description) values(?, ?, ?, ?)'
    , [params.name, params.category, params.price, params.description]
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
 * The function of inquiry the goods
 * 
 * @param {*} method 
 * @param {*} pathname 
 * @param {*} params 
 * @param {*} cb 
 */
function inquiry(method, pathname, params, cb) {
  const response = {
    errorcode: 0,
    errormessage: 'success'
  };

  const connection = mysql.createConnection(conn);
  connection.connect();
  connection.query('select * from goods', (err, results, fields) => {
    if (err || results.length === 0) {
      response.errorcode = 1;
      response.errormessage = err ? err : 'no data';
    } else {
      response.errormessage = results;
    }
    cb(response);
  });
  connection.end();
}

/**
 * The function of unregister the goods
 * 
 * @param {*} method 
 * @param {*} pathname 
 * @param {*} params 
 * @param {*} cb 
 */
function unregister(method, pathname, params, cb) {
  const response = {
    errorcode: 0,
    errormessage: 'success'
  };

  if (params.id == null) {
    response.errorcode = 1;
    response.errormessage = 'Invalid Parameters';
    cb(response);
  } else {
    const connection = mysql.createConnection(conn);
    connection.connect();
    connection.query('delete from goods where id = ?', [params.id]
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