import snowflake from 'snowflake-sdk';

declare global {
  var _snowflakeConn: snowflake.Connection | undefined;
  var _snowflakeConnected: boolean | undefined;
}

const config = {
  account: process.env.SNOWFLAKE_ACCOUNT || '',
  username: process.env.SNOWFLAKE_USER || '',
  password: process.env.SNOWFLAKE_PASSWORD || '',
  role: process.env.SNOWFLAKE_ROLE || '',
  warehouse: process.env.SNOWFLAKE_WAREHOUSE || '',
  database: process.env.SNOWFLAKE_DATABASE || '',
  schema: process.env.SNOWFLAKE_SCHEMA || ''
};

export async function getSnowflakeConnection(): Promise<snowflake.Connection> {
  let connection: snowflake.Connection;

  if (process.env.NODE_ENV === 'development') {
    if (!global._snowflakeConn) {
      global._snowflakeConn = snowflake.createConnection(config);
      global._snowflakeConnected = false;
    }
    connection = global._snowflakeConn;
  } else {
    connection = snowflake.createConnection(config);
  }

  return new Promise((resolve, reject) => {
    // If it's already connected in global state, just return it
    if (process.env.NODE_ENV === 'development' && global._snowflakeConnected) {
      if (connection.isUp()) {
        return resolve(connection);
      } else {
        global._snowflakeConnected = false; // Reset if it went down
      }
    }

    connection.connect((err, conn) => {
      if (err) {
        return reject(err);
      }
      if (process.env.NODE_ENV === 'development') {
        global._snowflakeConnected = true;
      }
      resolve(conn);
    });
  });
}

export function executeQuery(conn: snowflake.Connection, sqlText: string): Promise<any[]> {
  return new Promise((resolve, reject) => {
    conn.execute({
      sqlText,
      complete: (err, stmt, rows) => {
        if (err) return reject(err);
        resolve(rows as any[]);
      }
    });
  });
}
