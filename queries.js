const { Pool } = require('pg');
const config = require('./config.json');

// Read connection parameters from config.json
const pool = new Pool({
  user: config.user,
  host: config.host,
  database: config.database,
  password: config.password,
  port: config.port
});

const now = new Date();

const checkIP = (request, response) => {
  const { ip } = request.params;
  pool.query('SELECT * FROM ip WHERE ip >>= $1', [ip], (error, results) => {
    if (error) {
      return response.status(400).send(error.message);
    }
    return (results.rowCount === 0 ? response.status(200).send('OK') : response.status(200).json(results.rows));
  });
};

const syncData = (ipArray) => {
  (async () => {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');
      await client.query('TRUNCATE ip_inet');
      for (let i = 0; i < ipArray.length; i++) {
        insertText = 'INSERT INTO ip_inet (ip, source, last_upd) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING';
        insertValues = [ipArray[i][0], ipArray[i][1], now];
        await client.query(insertText, insertValues);
      }
      await client.query('COMMIT');
      await client.query('TRUNCATE ip');
      await client.query('INSERT INTO ip SELECT * from ip_inet');
      await client.query('COMMIT');
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  })().catch(e => console.error(e.stack));
};

module.exports = {
  checkIP,
  syncData
};
