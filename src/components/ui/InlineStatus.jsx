import React, { useState, useRef, useEffect } from 'react';
import { useLeads } from '../../context/LeadContext';
import { useToast } from '../../context/ToastContext';
import styles from './InlineStatus.module.css';

const STATUS_OPTIONS = ['New', 'Pending', 'Sold', 'Lost'];

const STATUS_COLORS = {
  New:     { bg: '#DBEAFE', color: '#1D4ED8' },
  Sold:    { bg: '#DCFCE7', color: '#166534' },
  Pending: { bg: '#FEF3C7', color: '#92400E' },
  Lost:    { bg: '#FEE2E2', color: '#991B1B' },
};

const InlineStatus = ({ leadId, currentStatus }) => {
  const [open, setOpen] = useState(false);
  const { updateStatus } = useLeads();
  const toast = useToast();
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSelect = async (status) => {
    if (status !== currentStatus) {
      try {
        await updateStatus(leadId, status);
        toast.success(`Status updated to ${status}`);
      } catch (err) {
        toast.error('Failed to update status');
        console.error(err);
      }
    }
    setOpen(false);
  };

  const s = STATUS_COLORS[currentStatus] || STATUS_COLORS['New'];

  return (
    <div className={styles.wrapper} ref={ref}>
      <button
        className={styles.tag}
        style={{ background: s.bg, color: s.color }}
        onClick={(e) => { e.stopPropagation(); setOpen(o => !o); }}
        title="Click to change status"
      >
        {currentStatus}
        <span className={styles.chevron}>▾</span>
      </button>
      {open && (
        <div className={styles.dropdown}>
          {STATUS_OPTIONS.map(opt => {
            const c = STATUS_COLORS[opt];
            return (
              <button
                key={opt}
                className={styles.option}
                style={{ color: c.color }}
                onClick={(e) => { e.stopPropagation(); handleSelect(opt); }}
              >
                <span className={styles.dot} style={{ background: c.color }} />
                {opt}
                {opt === currentStatus && <span className={styles.check}>✓</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default InlineStatus;
