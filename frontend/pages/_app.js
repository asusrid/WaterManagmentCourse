import { Web3ReactProvider } from '@web3-react/core';
import { ethers } from 'ethers';
import '../styles/global.css';
import 'bootstrap/dist/css/bootstrap.min.css';

function getLibrary(provider) {
  return new ethers.providers.Web3Provider(provider);
}

export default function App({ Component, pageProps }) {
  return (
    <Web3ReactProvider getLibrary={getLibrary}>
      <Component {...pageProps} />
    </Web3ReactProvider>
  );
}
