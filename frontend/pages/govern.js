import Head from 'next/head';
import styles from '../styles/Home.module.css';

export default function Company() {
  return (
    <div className={styles.container}>
      <Head>
        <title>Water Management</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <h2>Govern</h2>
    </div>
  );
}
