import { InjectedConnector } from '@web3-react/injected-connector';
import {
  WATER_MANAGEMENT_CONTRACT_ADDRESS,
  WATER_TOKEN_CONTRACT_ADDRESS,
  WATER_MANAGEMENT_ABI,
  WATER_TOKEN_ABI,
} from '../constants';
import { ethers } from 'ethers';

const injected = new InjectedConnector({ supportedChainIds: [80001] });

export const connectors = {
  injected: injected,
};

export const fetchWaterTokenContract = (signer) => {
  const waterTokenContract = new ethers.Contract(
    WATER_TOKEN_CONTRACT_ADDRESS,
    WATER_TOKEN_ABI,
    signer
  );
  return waterTokenContract;
};

export const fetchWaterManagementContract = (signer) => {
  const waterManagementContract = new ethers.Contract(
    WATER_MANAGEMENT_CONTRACT_ADDRESS,
    WATER_MANAGEMENT_ABI,
    signer
  );
  return waterManagementContract;
};
