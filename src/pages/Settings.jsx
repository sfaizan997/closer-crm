import React, { useState, useEffect } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import { useToast } from '../context/ToastContext';
import styles from './Settings.module.css';

const Settings = () => {
  const toast = useToast();
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(t => t === 'light' ? 'dark' : 'light');
  };

  const handleClearData = () => {
    localStorage.removeItem('fex_crm_leads');
    toast.success('All lead data has been cleared');
    setShowClearDialog(false);
    window.location.reload();
  };

  return (
    <div className={styles.container}>
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Appearance</h2>
        <Card>
          <div className={styles.cardContent}>
            <div className={styles.infoRow}>
              <span className={styles.label}>Theme</span>
              <span className={styles.value}>
                <Button variant="secondary" onClick={toggleTheme}>
                  {theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                </Button>
              </span>
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
