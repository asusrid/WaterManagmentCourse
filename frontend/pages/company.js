import Head from 'next/head';
import Image from 'next/image';
import Dynamic from 'next/dynamic';
import Button from 'react-bootstrap/Button';
import Table from 'react-bootstrap/Table';
import Form from 'react-bootstrap/Form';
import { useWeb3React } from '@web3-react/core';
import { useEffect, useState } from 'react';
import {
  connectors,
  fetchWaterManagementContract,
  fetchWaterTokenContract,
} from '../utils/connectors';
import Layout from '../components/layout';
import styles from '../styles/company.module.css';

export default function Company() {
  const [sensorId, setSensorId] = useState('');
  const [siteId, setSiteId] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [benchmark, setBenchmark] = useState('');
  const [name, setName] = useState('');
  const [saved, setSaved] = useState('');
  const [balance, setBalance] = useState('');
  const [error, setError] = useState(true);
  const [requests, setRequests] = useState([]);
  const [sensorData, setSensorData] = useState([]);
  const [location, setLocation] = useState({});
  const [loadingRequests, setLoadingRequests] = useState(false);
  const { account, library, activate, deactivate, active } = useWeb3React();

  const Map = Dynamic(
    () => {
      return import('../components/map');
    },
    { ssr: false }
  );

  const connectWallet = () => {
    activate(connectors.injected);
  };

  const disconnectWallet = () => {
    deactivate();
  };

  const handleRegisterSensor = async (event) => {
    try {
      event.preventDefault();
      const signer = await library.getSigner();
      const waterManagementContract = fetchWaterManagementContract(signer);
      await waterManagementContract.registerSensor(sensorId);
      setSensorId('');
    } catch (error) {
      console.log(error);
    }
  };

  const handleRegisterSite = async (event) => {
    try {
      event.preventDefault();
      const signer = await library.getSigner();
      const waterManagementContract = fetchWaterManagementContract(signer);
      await waterManagementContract.registerSite(
        siteId,
        latitute,
        longitude,
        benchmark
      );
      setSiteId('');
      setLatitude('');
      setLongitude('');
      setBenchmark('');
    } catch (error) {
      console.log(error);
    }
  };

  const answerRequest = async (event) => {
    try {
      const data = event.target.value.split(',');
      const signer = await library.getSigner();
      const waterManagementContract = fetchWaterManagementContract(signer);
      await waterManagementContract.answerRequest(data[0], data[1]);
    } catch (error) {
      console.log(error);
    }
  };

  const translateStatus = (status) => {
    if (status == 1) {
      return 'APPROVED';
    }
    if (status == 2) {
      return 'DENIED';
    }
  };

  const getMyDate = (date) => {
    var myDate = new Date(parseInt(date));
    return (
      myDate.getDate() +
      '/' +
      (myDate.getMonth() + 1) +
      '/' +
      myDate.getFullYear()
    );
  };

  useEffect(() => {
    async function checkRole() {
      if (active) {
        const signer = await library.getSigner();
        const waterManagementContract = fetchWaterManagementContract(signer);
        const roleType = await waterManagementContract.checkRole();
        console.log(roleType.toNumber());
        if (roleType == 2) {
          setError(false);
        } else {
          setError(true);
        }
      }
    }

    checkRole();
  }, [active]);

  useEffect(() => {
    async function fetchRequests() {
      try {
        setLoadingRequests(true);
        const signer = await library.getSigner();
        const waterManagementContract = fetchWaterManagementContract(signer);
        const allRequests = await waterManagementContract.fetchRequests();
        for (let i = 0; i < allRequests.length; i++) {
          let data = {};
          const govData = await waterManagementContract.fetchEntityData(
            allRequests[i].gov
          );
          data.gov = govData;
          data.reqId = allRequests[i].id.toString();
          data.status = allRequests[i].status;
          console.log(data);
          setRequests((requests) => [...requests, data]);
        }
        setLoadingRequests(false);
      } catch (error) {
        console.log(error);
      }
    }
    async function fetchData() {
      try {
        const signer = await library.getSigner();
        const waterManagementContract = fetchWaterManagementContract(signer);
        const waterTokenContract = fetchWaterTokenContract(signer);
        fetchSensors(waterManagementContract);
        fetchLocations(waterManagementContract);
        fetchWaterSaved(waterManagementContract, waterTokenContract);
      } catch (error) {
        console.log(error);
      }
    }
    async function fetchSensors(contract) {
      try {
        const data = await contract.pullDataByCompany();
        setSensorData(data);
      } catch (error) {
        console.log(error);
      }
    }
    async function fetchLocations(contract) {
      try {
        const sites = await contract.fetchSites();
        let location = {};
        for (let i = 0; i < sites.length; i++) {
          if (sites[i].siteId in location) {
            continue;
          } else {
            location[sites[i].siteId] = [sites[i].latitude, sites[i].longitude];
          }
        }
        setLocation(location);
      } catch (error) {
        console.log(error);
      }
    }
    async function fetchWaterSaved(waterContract, tokenContract) {
      try {
        const entityData = await waterContract.fetchEntityData(account);
        const saved = await waterContract.fetchSaved();
        const tokens = await tokenContract.balanceOf(account);
        setName(entityData[1]);
        setSaved(saved.toNumber());
        setBalance(tokens.toNumber());
      } catch (error) {
        console.log(error);
      }
    }
    if (active && !error) {
      fetchRequests();
      fetchData();
    }
  }, [error]);

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
      {active ? (
        !error ? (
          <>
            <Layout>
              <div className={styles.data}>
                <h2 className={styles.name}>Hello, {name}!</h2>
                <h5 className={styles.name}>
                  You have minted {balance} tokens
                </h5>
                <h5 className={styles.name}>
                  Currently, you have {saved} liters saved
                </h5>
              </div>
            </Layout>
            <div className={styles.map_sensor}>
              <div style={{ width: '45%' }}>
                <h2>Site location</h2>
                <hr />
                <Map location={location} />
              </div>
              <div style={{ width: '45%' }}>
                <h2>Sensor data</h2>
                <hr />
                {sensorData.length > 0 ? (
                  <Table striped bordered hover>
                    <thead>
                      <tr>
                        <th>Sensor ID</th>
                        <th>Site ID</th>
                        <th>Value</th>
                        <th>Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sensorData.map((data, index) => (
                        <tr key={index}>
                          <td>{data[0]}</td>
                          <td>{data[1]}</td>
                          <td>{data[2].toNumber()}</td>
                          <td>{getMyDate(data[3].toNumber())}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                ) : (
                  <p>You have not pushed any data yet</p>
                )}
              </div>
            </div>
            <div className={styles.reqs_forms}>
              <div style={{ width: '45%' }}>
                <h2>Requests</h2>
                <hr />
                {!loadingRequests ? (
                  requests.length > 0 ? (
                    <Table striped bordered hover>
                      <thead>
                        <tr>
                          <th>Company</th>
                          <th>NIF</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {requests.map((req, index) => (
                          <tr key={index}>
                            <td>{req.gov[1]}</td>
                            <td>{req.gov[2]}</td>
                            {req.status == 0 ? (
                              <td>
                                <div className={styles.actions}>
                                  <Button
                                    value={[req.reqId, 'approved']}
                                    onClick={(event) => answerRequest(event)}
                                    variant="success"
                                  >
                                    Approve
                                  </Button>
                                  <Button
                                    value={[req.reqId, 'denied']}
                                    onClick={(event) => answerRequest(event)}
                                    variant="danger"
                                  >
                                    Deny
                                  </Button>
                                </div>
                              </td>
                            ) : (
                              <td>{translateStatus(req.status)}</td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  ) : (
                    <p>No requests</p>
                  )
                ) : (
                  <p>Loading requests...</p>
                )}
              </div>
              <div style={{ width: '45%' }}>
                <h2>Register</h2>
                <hr />
                <div className={styles.forms}>
                  <Form
                    className={styles.sensor_form}
                    onSubmit={handleRegisterSensor}
                  >
                    <h5>Sensor</h5>
                    <Form.Group className="mb-3" controlId="formRegisterSensor">
                      <Form.Control
                        required
                        className={styles.inputs}
                        type="text"
                        value={sensorId}
                        onChange={(event) => setSensorId(event.target.value)}
                        placeholder="Enter sensor ID"
                      />
                    </Form.Group>
                    <Button variant="primary" type="submit">
                      Register
                    </Button>
                  </Form>
                  <Form
                    className={styles.sensor_form}
                    onSubmit={handleRegisterSite}
                  >
                    <h5>Site</h5>
                    <Form.Group className="mb-3" controlId="formRegisterSite">
                      <Form.Label>Site ID</Form.Label>
                      <Form.Control
                        required
                        className={styles.inputs}
                        type="text"
                        value={siteId}
                        onChange={(event) => setSiteId(event.target.value)}
                        placeholder="Enter site ID"
                      />
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="formRegisterLat">
                      <Form.Label>Latitude</Form.Label>
                      <Form.Control
                        required
                        className={styles.inputs}
                        type="text"
                        value={latitude}
                        onChange={(event) => setLatitute(event.target.value)}
                        placeholder="Enter latitude"
                      />
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="formRegisterLong">
                      <Form.Label>Longitude</Form.Label>
                      <Form.Control
                        required
                        className={styles.inputs}
                        type="text"
                        value={longitude}
                        onChange={(event) => setLongitude(event.target.value)}
                        placeholder="Enter longitude"
                      />
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="formRegisterBench">
                      <Form.Label>Benchmark</Form.Label>
                      <Form.Control
                        required
                        className={styles.inputs}
                        type="text"
                        value={benchmark}
                        onChange={(event) => setBenchmark(event.target.value)}
                        placeholder="Enter benchmark"
                      />
                    </Form.Group>
                    <Button variant="primary" type="submit">
                      Register
                    </Button>
                  </Form>
                </div>
              </div>
            </div>
          </>
        ) : (
          <p className="error">
            This website is only available for COMPANY roles
          </p>
        )
      ) : (
        <p className="error">Connect your wallet</p>
      )}
    </div>
  );
}
