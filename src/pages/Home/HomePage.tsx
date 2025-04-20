import React from 'react';
import { Greeting } from '../../components/Greeting';
import styles from './HomePage.module.scss';

export const HomePage: React.FC = () => {
  return (
    <div className={styles.homePage}>
      <Greeting />
    </div>
  );
}; 