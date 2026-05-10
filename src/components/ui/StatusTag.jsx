import React from 'react';
import clsx from 'clsx';
import styles from './StatusTag.module.css';

const StatusTag = ({ status, className }) => {
  const normalizedStatus = status.toLowerCase();
  
  return (
    <span className={clsx(styles.tag, styles[normalizedStatus], className)}>
      {status}
    </span>
  );
};

export default StatusTag;
