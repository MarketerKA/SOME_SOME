import React from 'react';
import styles from './Greeting.module.scss';

interface GreetingProps {
  text?: string;
}

export const Greeting: React.FC<GreetingProps> = ({ text = 'Привет мир' }) => {
  return (
    <div className={styles.greeting}>
      <h1>{text}</h1>
    </div>
  );
}; 