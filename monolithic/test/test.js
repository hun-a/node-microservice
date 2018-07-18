const http = require('http');
const mysql = require('mysql');
const fs = require('fs');
const path = require('path');
const sqlFile = path.join(__dirname, '../', 'sql.sql');
const conn = {
  host: 'localhost',
  user: 'micro',
  password: 'service',
  database: 'monolithic'
};

async function init() {
  return new Promise(resolve => {
    fs.readFile(sqlFile, (error, data) => {
      if (error) {
        throw new Error(error);
      } else {
        const ddl = data.toString().split('\n\n');
        const connection = mysql.createConnection(conn);
        connection.connect();
        const lastIndex = ddl.length - 1;
        ddl.forEach(d => {
          connection.query(d, err => {
            if (err) {
              throw new Error(err);
            }
            if (ddl[lastIndex] === d) {
              connection.end();
              resolve();  
            }
          });
        });
      }
    });
  });
}

const options = {
  host: '127.0.0.1',
  port: 8000,
  headers: {
    'Content-Type': 'application/json'
  }
};

function request(cb, params) {
  const req = http.request(options, res => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      console.log(options, data);
      cb();
    });
  });

  if (params) {
    req.write(JSON.stringify(params));
  }

  req.end();
}

/**
 * Test for API of management for goods
 */
function goods(callback) {
  goods_post(() => {
    goods_get(() => {
      goods_delete(callback);
    });
  });

  function goods_post(cb) {
    options.method = 'POST',
    options.path = '/goods';
    request(cb, {
      name: 'test Goods',
      category: 'tests',
      price: 1000,
      description: 'test'
    });
  }

  function goods_get(cb) {
    options.method = 'GET';
    options.path = '/goods';
    request(cb);
  }

  function goods_delete(cb) {
    options.method = 'DELETE';
    options.path = '/goods?id=1';
    request(cb);
  }
}

/**
 * Test for API of management for members
 */
function members(callback) {
  members_post(() => {
    members_get(() => {
      members_delete(callback);
    });
  });

  function members_post(cb) {
    options.method = 'POST';
    options.path = '/members';
    request(cb, {
      username: 'test_account',
      password: '1234',
      passwordConfirm: '1234'
    });
  }

  function members_get(cb) {
    options.method = 'GET';
    options.path = '/members?username=test_account&password=1234';
    request(cb);
  }

  function members_delete(cb) {
    options.method = 'DELETE';
    options.path = '/members?username=test_account';
    request(cb);
  }
}

/**
 * Test for API of management for purchases
 */
function purchases(callback) {
  purchases_post(() => {
    purchases_get(() => {
      callback();
    });
  });

  function purchases_post(cb) {
    options.method = 'POST';
    options.path = '/purchases';
    request(cb, {
      userid: 1,
      goodsid: 1
    });
  }

  function purchases_get(cb) {
    options.method = 'GET';
    options.path = '/purchases?userid=1';
    request(cb);
  }
}

init()
  .then(() => {
    console.log('================================ members ================================');
    members(() => {
      console.log('================================ goods ================================');
      goods(() => {
        console.log('================================ purchases ================================');
          purchases(() => console.log('done'));
        });
      });
    })
  .catch(err => {
    console.log(err);
  });