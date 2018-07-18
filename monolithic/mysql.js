const mysql = require('mysql');
const conn = {
  host: 'localhost',
  user: 'micro',
  password: 'service',
  database: 'monolithic'
};

const connection = mysql.createConnection(conn);
connection.connect();
connection.query('select * from members', (err, result, fields) => {
  if (err) throw new Error(err);
  console.log(result, fields);
});
connection.end();