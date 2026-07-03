const snowflake = require('snowflake-sdk');
require('dotenv').config({ path: '.env.local' });

const connection = snowflake.createConnection({
  account: process.env.SNOWFLAKE_ACCOUNT,
  username: process.env.SNOWFLAKE_USER,
  password: process.env.SNOWFLAKE_PASSWORD,
  role: process.env.SNOWFLAKE_ROLE,
  warehouse: process.env.SNOWFLAKE_WAREHOUSE,
  database: process.env.SNOWFLAKE_DATABASE,
  schema: process.env.SNOWFLAKE_SCHEMA
});

connection.connect((err, conn) => {
  if (err) {
    console.error('Unable to connect: ' + err.message);
    process.exit(1);
  }
  
  console.log('Connected!');

  conn.execute({
    sqlText: 'SELECT * FROM FCT_DAILY_PRODUCTION LIMIT 1',
    complete: (err1, stmt1, rows1) => {
      if (err1) {
        console.error('Query 1 error:', err1);
        process.exit(1);
      }
      console.log('Rows 1:', rows1);

      conn.execute({
        sqlText: 'SELECT * FROM FCT_HAULAGE_ANALYTICS LIMIT 1',
        complete: (err2, stmt2, rows2) => {
          if (err2) {
            console.error('Query 2 error:', err2);
            process.exit(1);
          }
          console.log('Rows 2:', rows2);
          conn.destroy((err, conn) => {
            console.log('Disconnected');
            process.exit(0);
          });
        }
      });
    }
  });
});
