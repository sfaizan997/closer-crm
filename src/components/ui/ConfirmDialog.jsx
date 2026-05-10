import React from 'react';
import Button from './Button';
import styles from './ConfirmDialog.module.css';

const ConfirmDialog = ({ isOpen, title, message, confirmLabel = 'Delete', onConfirm, onCancel, disabled = false }) => {
  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={disabled ? undefined : onCancel}>
      <div className={styles.dialog} onClick={e => e.stopPropagation()}>
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.message}>{message}</p>
        <div className={styles.actions}>
          <Button variant="secondary" onClick={onCancel} disabled={disabled}>Cancel</Button>
          <Button variant="danger" onClick={onConfirm} disabled={disabled}>{confirmLabel}</Button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
