import Head from 'next/head';
import Image from 'next/image';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Table from 'react-bootstrap/Table';
import Layout from '../components/Layout';
import { useWeb3React } from '@web3-react/core';
import { useEffect, useState } from 'react';
import { connectors, fetchWaterManagementContract } from '../utils/connectors';

export default function Govern() {
  const [error, setError] = useState(true);
  const { library, activate, deactivate, active } = useWeb3React();

  const connectWallet = () => {
    activate(connectors.injected);
  };

  const disconnectWallet = () => {
    deactivate();
  };

  useEffect(() => {
    async function checkRole() {
      if (active) {
        const signer = await library.getSigner();
        const waterManagementContract = fetchWaterManagementContract(signer);
        const roleType = await waterManagementContract.checkRole();
        if (roleType == 0) {
          setError(false);
        } else {
          setError(true);
        }
      }
    }

    checkRole();
  }, [active]);

  return (
    <div>
      <Head>
        <title>Water Management</title>
      </Head>
      <div className="header">
        <Image
          src="/WMDLogo.png"
          height={100}
          width={200}
          alt="Water Management Logo"
        />
        {active ? (
          <Button onClick={disconnectWallet} variant="secondary">
            Disconnect
          </Button>
        ) : (
          <Button onClick={connectWallet} variant="success">
            Connect Wallet
          </Button>
        )}
      </div>
    </div>
  );
}
