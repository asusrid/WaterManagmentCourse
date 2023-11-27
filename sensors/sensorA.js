const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(bodyParser.json());
app.use(cors());

app.listen(4001, () => {
  console.log('Sensor A listening on port 4001...');
});
