import React, { useState, useEffect, useRef } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import { useLeads } from '../context/LeadContext';
import { useToast } from '../context/ToastContext';
import styles from './Settings.module.css';

const Settings = () => {
  const toast = useToast();
  const { leads, bulkAddLeads } = useLeads();
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const fileInputRef = useRef(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(t => t === 'light' ? 'dark' : 'light');
  };

  const handleDownloadBackup = () => {
    const data = JSON.stringify(leads, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fex_crm_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Backup file downloaded successfully');
  };

  const handleRestoreBackup = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const importedLeads = JSON.parse(event.target.result);
        if (!Array.isArray(importedLeads)) {
          throw new Error('Invalid backup file format');
        }
        
        const count = await bulkAddLeads(importedLeads);
        toast.success(`Successfully restored ${count} leads from backup!`);
      } catch (err) {
        toast.error('Failed to restore backup: ' + err.message);
        console.error(err);
      }
    };
    reader.readAsText(file);
    // Reset file input
    e.target.value = '';
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
        <h2 className={styles.sectionTitle}>Data Management</h2>
        <Card>
          <div className={styles.cardContent}>
            <div className={styles.infoRow}>
              <span className={styles.label}>Export Data</span>
              <span className={styles.value}>
                <Button variant="secondary" onClick={handleDownloadBackup}>
                  Download JSON Backup
                </Button>
              </span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>Import Data</span>
              <span className={styles.value}>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleRestoreBackup}
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                />
                <Button variant="secondary" onClick={() => fileInputRef.current.click()}>
                  Upload Backup File
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
              <span className={styles.value}>Cloud Sync + Offline Cache</span>
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
