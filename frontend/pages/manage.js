import Head from 'next/head';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Image from 'next/image';
import Layout from '../components/Layout.js';
import { connectors, fetchWaterManagementContract } from '../utils/connectors';
import { useState, useEffect } from 'react';
import { useWeb3React } from '@web3-react/core';

export default function Manage() {
  const [address, setAddress] = useState('');
  const [name, setName] = useState('');
  const [nif, setNif] = useState('');
  const [role, setRole] = useState('');
  const [error, setError] = useState(true);
  const { library, activate, deactivate, active } = useWeb3React();

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const signer = await library.getSigner();
      const waterManagementContract = fetchWaterManagementContract(signer);
      const tx = await waterManagementContract.addEntity(
        address,
        name,
        nif,
        role
      );
      setAddress('');
      setName('');
      setNif('');
      setRole('');
    } catch (error) {
      console.log(error);
    }
  };

  const handleChange = (event) => {
    if (event.target.value == 'company' || event.target.value == 'government') {
      setRole(event.target.value);
    }
  };

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
      <Layout>
        {active ? (
          !error ? (
            <>
              <h1>Register an entity</h1>
              <hr />
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="formCompanyAddress">
                  <Form.Label>Address</Form.Label>
                  <Form.Control
                    required
                    type="text"
                    value={address}
                    onChange={(event) => setAddress(event.target.value)}
                    placeholder="Enter company's address"
                  />
                </Form.Group>
                <Form.Group className="mb-3" controlId="formCompanyName">
                  <Form.Label>Name</Form.Label>
                  <Form.Control
                    required
                    type="text"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Enter company's name"
                  />
                </Form.Group>
                <Form.Group className="mb-3" controlId="formCompanyNIF">
                  <Form.Label>NIF</Form.Label>
                  <Form.Control
                    required
                    type="text"
                    value={nif}
                    onChange={(event) => setNif(event.target.value)}
                    placeholder="Enter company's NIF"
                  />
                  <Form.Text className="text-muted">
                    This is the unique identifier of each company.
                  </Form.Text>
                </Form.Group>
                <Form.Group className="mb-3" controlId="formCompanyRole">
                  <Form.Select
                    required
                    value={role}
                    onChange={handleChange}
                    aria-label="Select role"
                  >
                    <option>Select role...</option>
                    <option value="company">Company</option>
                    <option value="government">Government</option>
                  </Form.Select>
                </Form.Group>
                {active && name && nif && role ? (
                  <Button variant="primary" type="submit">
                    Register
                  </Button>
                ) : (
                  <Button variant="primary" type="submit" disabled>
                    Register
                  </Button>
                )}
              </Form>
            </>
          ) : (
            <p className="error">
              This website is only available for MANAGEMENT roles
            </p>
          )
        ) : (
          <p className="error">Connect your wallet</p>
        )}
      </Layout>
    </div>
  );
}
