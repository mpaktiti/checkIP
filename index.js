const express = require('express');
const db = require('./queries');

const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Welcome to the checkIP API');
});

app.get('/IP/:ip', db.checkIP);

app.listen(port, () => {
  console.log(`Running on port ${port}`);
});

module.exports = app;
