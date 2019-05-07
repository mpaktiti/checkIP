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

const checkIP = (request, response) => {
  console.time('checkIP');
  const { ip } = request.params;
  pool.query('SELECT * FROM ip WHERE ip >>= $1', [ip], (error, results) => {
    if (error) {
      throw error;
    }
    response.status(200).json(results.rows);
  });
  console.timeEnd('checkIP');
};

const syncData = (ipArray) => {
  (async () => {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');
      await client.query('TRUNCATE ip_inet');
      for (const ip of ipArray) {
        insertText = 'INSERT INTO ip_inet (ip, source) VALUES ($1, $2) ON CONFLICT DO NOTHING';
        insertValues = [ip, 'dummy-source'];
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