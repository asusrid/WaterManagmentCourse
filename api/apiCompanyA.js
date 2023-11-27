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

app.listen(5000, () => {
  console.log('API listening on port 5000...');
});
