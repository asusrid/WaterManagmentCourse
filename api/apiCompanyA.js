const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { createAlchemyWeb3 } = require('@alch/alchemy-web3');
require('dotenv').config();

const API_URL = process.env.ALCHEMY_MUMBAI_API_KEY_HTTPS;
const PUBLIC_KEY = process.env.PUBLIC_KEY_COMPANY_A;
const PRIVATE_KEY = process.env.PRIVATE_KEY_COMPANY_A;
const WATER_MANAGEMENT_CONTRACT_ADDRESS =
  process.env.WATER_MANAGEMENT_CONTRACT_ADDRESS;
const WATER_MANAGEMENT_ABI = JSON.parse(process.env.WATER_MANAGEMENT_ABI);

const web3 = createAlchemyWeb3(API_URL);
const app = express();
app.use(bodyParser.json());
app.use(cors());

app.post('/sensor', async (req, res) => {
  const { sensorId, siteId, value, timestamp } = req.body.data;

  if (!sensorId || !siteId || !value || !timestamp) {
    return res.status(400).json({ error: 'Please provide all values.' });
  }

  try {
    const waterContract = new web3.eth.Contract(
      WATER_MANAGEMENT_ABI,
      WATER_MANAGEMENT_CONTRACT_ADDRESS
    );
    const nonce = await web3.eth.getTransactionCount(PUBLIC_KEY, 'latest');
    const gasEstimate = await waterContract.methods
      .pushData(sensorId, siteId, value, timestamp)
      .estimateGas({ from: PUBLIC_KEY });

    const tx = {
      from: PUBLIC_KEY,
      to: WATER_MANAGEMENT_CONTRACT_ADDRESS,
      nonce: nonce,
      gas: gasEstimate,
      data: waterContract.methods
        .pushData(sensorId, siteId, value, timestamp)
        .encodeABI(),
    };

    const signPromise = web3.eth.accounts.signTransaction(tx, PRIVATE_KEY);
    signPromise
      .then((signedTx) => {
        web3.eth.sendSignedTransaction(
          signedTx.rawTransaction,
          function (err, hash) {
            if (!err) {
              console.log('The hash of this tx is: ', hash);
            } else {
              console.log('ERROR: ', err);
            }
          }
        );
        res.json({ success: true });
      })
      .catch((err) => {
        console.log('Promise failed: ', err);
      });
  } catch (error) {
    res
      .status(500)
      .json({ error: 'Failed to send tx ', details: error.message });
  }
});

app.listen(5000, () => {
  console.log('API listening on port 5000...');
});
