const mysql = require('mysql');
const conn = {
  host: 'localhost',
  user: 'micro',
  password: 'service',
  database: 'monolithic'
};

/**
 * Divide by each functions of members
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
 * The function of register the members
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

  if (params.username == null || params.password == null) {
    response.errorcode = 1;
    response.errormessage = 'Invalid Parameters';
    cb(response);
  } else {
    const connection = mysql.createConnection(conn);
    connection.connect();
    connection.query('insert into members(username, password) values (?, password(?))'
    , [params.username, params.password]
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
 * The function of inquiry the members
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

  if (params.username == null || params.password == null) {
    response.errorcode = 1;
    response.errormessage = 'Invalid Parameters'
    cb(response);
  } else {
    const connection = mysql.createConnection(conn);
    connection.connect();
    connection.query('select id from members where username = ? and password = password(?)'
    , [params.username, params.password]
    , (err, results, fields) => {
      if (err || results.length === 0) {
        response.errorcode = 1;
        response.errormessage = err ? err : 'Invalid password';
      } else {
        response.userid = results[0].id;
      }
      cb(response);
    });
    connection.end();
  }
}

/**
 * The function of unregister the members
 * 
 * @param {*} method 
 * @param {*} pathname 
 * @param {*} params 
 * @param {*} cb 
 */
function unregister(method, pathname, params, cb) {
  const response = {
    key: params.key,
    errorcode: 0,
    errormessage: 'success'
  };

  if (params.username == null) {
    response.errorcode = 1;
    response.errormessage = 'Invalid Parameters';
    cb(response);
  } else {
    const connection = mysql.createConnection(conn);
    connection.connect();
    connection.query('delete from members where username = ?'
    , [params.username], (err, results, fields) => {
      if (err) {
        response.errorcode = 1;
        response.errormessage = err;
      }
      cb(response);
    });
    connection.end();
  }
}