import React from 'react';
import styles from './LoveIndexLoading.module.css';

const TestLoading = () => {
  return (
    <div className={styles.container}>
      <div className={styles.loadingContent}>
        <h1>测试CSS样式</h1>
        <div className={styles.doctorImageContainer}>
          <img src="/img/image.png" alt="米粒医生" className={styles.doctorImage} />
        </div>
      </div>
    </div>
  );
};

export default TestLoading;