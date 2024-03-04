// express stuff, don't worry about this file yet
// we might not even use this for the prototype

import './database.js'
import express from 'express'

const app = express();

const port = 8080;

app.use(express.static("static"));

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});