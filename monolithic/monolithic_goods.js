const mysql = require('mysql');
const conn = {
  host: 'localhost',
  user: 'micro',
  password: 'service',
  database: 'monolithic',
  multipleStatements: true
};

const redis = require('redis').createClient();

redis.on('error', err => {
  console.log(`Redis error: ${err}`);
});

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
    key: params.key,
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
    connection.query('insert into goods(name, category, price, description) values(?, ?, ?, ?); select LAST_INSERT_ID() as id'
    , [params.name, params.category, params.price, params.description]
    , (err, results, fields) => {
      if (err) {
        response.errorcode = 1;
        response.errormessage = err;
      } else {
        const id = result[1][0].id;
        redis.set(id, JSON.stringify(params));
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
    key: params.key,
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
    key: params.key,
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
      } else {
        redis.del(params.id);
      }
      cb(response);
    });
    connection.end();
  }
}