import React from 'react';
import clsx from 'clsx';
import styles from './FormFields.module.css';

export const InputField = ({ label, id, className, ...props }) => {
  return (
    <div className={clsx(styles.fieldWrapper, className)}>
      <label htmlFor={id} className={styles.label}>{label}</label>
      <input id={id} className={styles.input} {...props} />
    </div>
  );
};

export const TextAreaField = ({ label, id, className, ...props }) => {
  return (
    <div className={clsx(styles.fieldWrapper, className)}>
      <label htmlFor={id} className={styles.label}>{label}</label>
      <textarea id={id} className={clsx(styles.input, styles.textarea)} {...props} />
    </div>
  );
};

export const SelectField = ({ label, id, options, className, ...props }) => {
  return (
    <div className={clsx(styles.fieldWrapper, className)}>
      <label htmlFor={id} className={styles.label}>{label}</label>
      <select id={id} className={styles.input} {...props}>
        <option value="" disabled>Select...</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
};
