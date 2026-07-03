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

const fs = require('fs');
const path = require('path');

connection.connect((err, conn) => {
  if (err) {
    console.error('Unable to connect: ' + err.message);
    process.exit(1);
  }
  
  console.log('Connected! Fetching data for mock snapshot...');

  conn.execute({
    sqlText: 'SELECT * FROM FCT_DAILY_PRODUCTION',
    complete: (err1, stmt1, production) => {
      if (err1) {
        console.error('Query 1 error:', err1);
        process.exit(1);
      }

      conn.execute({
        sqlText: 'SELECT * FROM FCT_HAULAGE_ANALYTICS',
        complete: (err2, stmt2, haulage) => {
          if (err2) {
            console.error('Query 2 error:', err2);
            process.exit(1);
          }
          
          const mockData = {
            production,
            haulage,
            meta: {
              fetchedAt: new Date().toISOString(),
              productionCount: production.length,
              haulageCount: haulage.length,
              isMock: true,
            }
          };

          const outDir = path.join(__dirname, 'src', 'data');
          fs.mkdirSync(outDir, { recursive: true });
          fs.writeFileSync(path.join(outDir, 'mockData.json'), JSON.stringify(mockData, null, 2));

          console.log(`Saved ${production.length} production rows and ${haulage.length} haulage rows to src/data/mockData.json`);
          
          conn.destroy((err, conn) => {
            console.log('Disconnected');
            process.exit(0);
          });
        }
      });
    }
  });
});
