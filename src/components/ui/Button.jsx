import React from 'react';
import clsx from 'clsx';
import styles from './Button.module.css';

const Button = ({ children, variant = 'primary', className, ...props }) => {
  return (
    <button 
      className={clsx(styles.button, styles[variant], className)} 
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
