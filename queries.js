const { Pool } = require('pg');
const format = require('pg-format');
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
  const { ip } = request.params;
  pool.query('SELECT * FROM ip WHERE ip >>= $1', [ip], (error, results) => {
    if (error) {
      return response.status(400).send(error.message);
    }
    return (results.rowCount === 0 ? 
      response.status(200).send('OK') : 
      response.status(200).send(`IP ${ip} is blacklisted by ${results.rows[0].source}`)
    );
  });
};

const syncData = (ipArray) => {
  (async () => {
    const client = await pool.connect();
    const query = format('INSERT INTO ip_temp (ip, source) VALUES %L ON CONFLICT DO NOTHING', ipArray);
    try {
      await client.query('BEGIN');
      await client.query('CREATE TABLE ip_temp (LIKE ip INCLUDING ALL)');
      await client.query('DROP INDEX ip_temp_ip_idx');
      await client.query(query);
      await client.query('COMMIT');
      await client.query('TRUNCATE ip');
      await client.query('DROP INDEX idx_name');
      await client.query('INSERT INTO ip SELECT * from ip_temp');
      await client.query('CREATE INDEX idx_name ON ip USING GIST(ip inet_ops)');
      await client.query('COMMIT');
      await client.query('DROP TABLE ip_temp');
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
