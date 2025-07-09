import React from 'react';
import styles from './Dashboard.module.css';
import FileUpload from './FileUpload';

const Dashboard: React.FC = () => {
  return (
    <div className={styles.container}>
      <h1>PortScope Dashboard</h1>
      <FileUpload />
    </div>
  );
};

export default Dashboard;