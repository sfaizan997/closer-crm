import React, { useState } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import { useToast } from '../context/ToastContext';
import styles from './Settings.module.css';

const Settings = () => {
  const toast = useToast();
  const [showClearDialog, setShowClearDialog] = useState(false);

  const handleClearData = () => {
    localStorage.removeItem('fex_crm_leads');
    toast.success('All lead data has been cleared');
    setShowClearDialog(false);
    // Reload to reset context state
    window.location.reload();
  };

  return (
    <div className={styles.container}>
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Agent Profile</h2>
        <Card>
          <div className={styles.cardContent}>
            <div className={styles.infoRow}>
              <span className={styles.label}>Name</span>
              <span className={styles.value}>John Smith</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>Role</span>
              <span className={styles.value}>Agent</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>License Number</span>
              <span className={styles.value}>TX-987654321</span>
            </div>
          </div>
        </Card>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Application Info</h2>
        <Card>
          <div className={styles.cardContent}>
            <div className={styles.infoRow}>
              <span className={styles.label}>Version</span>
              <span className={styles.value}>1.0.0</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>Storage Type</span>
              <span className={styles.value}>Local (Browser)</span>
            </div>
          </div>
        </Card>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle} style={{ color: '#b91c1c' }}>Danger Zone</h2>
        <Card className={styles.dangerZone}>
          <div className={styles.cardContent}>
            <p className={styles.dangerText}>
              Clearing all data will permanently delete every lead and note currently stored on this device.
            </p>
            <div>
              <Button variant="danger" onClick={() => setShowClearDialog(true)}>
                Clear All Lead Data
              </Button>
            </div>
          </div>
        </Card>
      </div>

      <ConfirmDialog
        isOpen={showClearDialog}
        title="Clear All Data"
        message="Are you sure you want to delete all leads? This action cannot be undone."
        confirmLabel="Yes, Clear Everything"
        onConfirm={handleClearData}
        onCancel={() => setShowClearDialog(false)}
      />
    </div>
  );
};

export default Settings;
