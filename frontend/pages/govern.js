import Head from 'next/head';
import Image from 'next/image';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Table from 'react-bootstrap/Table';
import Layout from '../components/layout';
import { useWeb3React } from '@web3-react/core';
import { useEffect, useState } from 'react';
import { connectors, fetchWaterManagementContract } from '../utils/connectors';
import { setSingletonsConfig } from '@openzeppelin/test-helpers/src/config/singletons';

export default function Govern() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(true);
  const [address, setAddress] = useState('');
  const [sensorData, setSensorData] = useState([]);
  const [candidateCompanies, setCandidateCompanies] = useState([]);
  const [acceptedCompanies, setAcceptedCompanies] = useState([]);
  const { library, activate, deactivate, active } = useWeb3React();

  const connectWallet = () => {
    activate(connectors.injected);
  };

  const disconnectWallet = () => {
    deactivate();
  };

  const handleChange = async (event) => {
    const companyAddress = event.target.value;
    const signer = await library.getSigner();
    const waterManagementContract = fetchWaterManagementContract(signer);
    const sensorData = await waterManagementContract.pullDataByGovernment(
      companyAddress
    );
    setSensorData(sensorData);
    setAddress(companyAddress);
  };

  const requestData = async (event) => {
    const signer = await library.getSigner();
    const waterManagementContract = fetchWaterManagementContract(signer);
    await waterManagementContract.createRequest(event.target.value);
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

  const translateStatus = (status) => {
    if (status == 0) {
      return 'PENDING';
    }
    if (status == 2) {
      return 'DENIED';
    }
  };

  useEffect(() => {
    async function checkRole() {
      if (active) {
        const signer = await library.getSigner();
        const waterManagementContract = fetchWaterManagementContract(signer);
        const roleType = await waterManagementContract.checkRole();
        console.log(roleType.toNumber());
        if (roleType == 1) {
          setError(false);
        } else {
          setError(true);
        }
      }
    }

    checkRole();
  }, [active]);

  useEffect(() => {
    async function fetchCompanies() {
      setLoading(true);
      const signer = await library.getSigner();
      const waterManagementContract = fetchWaterManagementContract(signer);
      const allCompanies = await waterManagementContract.fetchEntities();
      for (let i = 0; i < allCompanies.length; i++) {
        if (allCompanies[i].nif) {
          let data = {};
          data.company = allCompanies[i];

          const idRequest = (
            await waterManagementContract.checkRequestExists(
              await signer.getAddress(),
              allCompanies[i].entity
            )
          ).toNumber();

          if (!idRequest) {
            data.status = -1;
            setCandidateCompanies((candidateCompanies) => [
              ...candidateCompanies,
              data,
            ]);
          } else {
            const status = await waterManagementContract.fetchRequestStatus(
              idRequest
            );
            if (status == 0 || status == 2) {
              data.status = status;
              setCandidateCompanies((candidateCompanies) => [
                ...candidateCompanies,
                data,
              ]);
            } else {
              data.status = status;
              setAcceptedCompanies((acceptedCompanies) => [
                ...acceptedCompanies,
                data,
              ]);
            }
          }
        }
      }
      setLoading(false);
    }
    if (active && !error) {
      fetchCompanies();
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
      <Layout>
        {active ? (
          !error ? (
            <>
              <h2>Select the company</h2>
              <hr />
              {!loading ? (
                acceptedCompanies.length > 0 ? (
                  <Table striped bordered hover>
                    <thead>
                      <tr>
                        <th>Selected</th>
                        <th>Company</th>
                        <th>NIF</th>
                      </tr>
                    </thead>
                    <tbody>
                      {acceptedCompanies.map((data, index) => (
                        <tr key={index}>
                          <td>
                            <Form.Check
                              type="radio"
                              name="selectedCompany"
                              id={index}
                              value={data.company.entity}
                              onChange={handleChange}
                            />
                          </td>
                          <td>{data.company.name}</td>
                          <td>{data.company.nif}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                ) : (
                  <p>No company has accepted your request</p>
                )
              ) : (
                <p>Loading companies...</p>
              )}
              {!loading ? (
                acceptedCompanies.length > 0 ? (
                  address ? (
                    sensorData.length > 0 ? (
                      <div>
                        <h4>Sensor Data</h4>
                        <hr />
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
                      </div>
                    ) : (
                      <p>This company has not pushed any data yet</p>
                    )
                  ) : (
                    <p>No Company Selected</p>
                  )
                ) : (
                  <></>
                )
              ) : (
                <></>
              )}
              <h2>Request Access to Sensor Data</h2>
              <hr />
              {!loading ? (
                candidateCompanies.length > 0 ? (
                  <Table striped bordered hover>
                    <thead>
                      <tr>
                        <th>Company</th>
                        <th>NIF</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {candidateCompanies.map((data, index) => (
                        <tr key={index}>
                          <td>{data.company.name}</td>
                          <td>{data.company.nif}</td>
                          <td>
                            {data.status == -1 ? (
                              <Button
                                onClick={(event) => requestData(event)}
                                value={data.company.entity}
                                variant="primary"
                              >
                                Request
                              </Button>
                            ) : (
                              translateStatus(data.status)
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                ) : (
                  <p>No companies</p>
                )
              ) : (
                <p>Loading companies...</p>
              )}
            </>
          ) : (
            <p className="error">
              This website is only available for GOVERNMENT roles
            </p>
          )
        ) : (
          <p className="error">Connect your wallet</p>
        )}
      </Layout>
    </div>
  );
}
