import React from 'react';
import Card from './Card';
import clsx from 'clsx';
import styles from './StatCard.module.css';

const StatCard = ({ label, value, status = 'default', className }) => {
  return (
    <Card className={clsx(styles.statCard, styles[status], className)}>
      <div className={styles.label}>{label}</div>
      <div className={styles.value}>{value}</div>
    </Card>
  );
};

export default StatCard;
