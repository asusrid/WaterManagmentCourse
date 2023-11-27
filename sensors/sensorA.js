const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(bodyParser.json());
app.use(cors());

function wait(time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

async function push() {
  while (true) {
    await wait(5000);

    await axios
      .post('http://localhost:5000/sensor', {
        data: {
          sensorId: 'sensorA',
          siteId: 'siteA',
          value: Math.floor(Math.random() * 1500) + 1,
          timestamp: Date.now(),
        },
      })
      .catch((err) => {
        console.log(err.message);
        console.log(err.response.data);
      });

    console.log('This printed after about 5 seconds');
  }
}

app.listen(4001, () => {
  push();
  console.log('Sensor A listening on port 4001...');
});
