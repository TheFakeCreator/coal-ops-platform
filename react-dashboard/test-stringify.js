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
    sqlText: 'SELECT * FROM FCT_DAILY_PRODUCTION LIMIT 5',
    complete: (err1, stmt1, rows1) => {
      if (err1) process.exit(1);

      console.log('Attempting to JSON stringify rows1...');
      try {
        const str = JSON.stringify(rows1);
        console.log('Success, length:', str.length);
        console.log('Str:', str);
      } catch (e) {
        console.error('JSON Stringify error:', e);
      }
      conn.destroy(() => process.exit(0));
    }
  });
});
