import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLeads } from '../context/LeadContext';
import { useToast } from '../context/ToastContext';
import StatCard from '../components/ui/StatCard';
import Card from '../components/ui/Card';
import InlineStatus from '../components/ui/InlineStatus';
import Button from '../components/ui/Button';
import styles from './Dashboard.module.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const { leads, loading, migrateLocalData } = useLeads();
  const toast = useToast();
  const [hasLocalData, setHasLocalData] = useState(false);

  useEffect(() => {
    const local = localStorage.getItem('fex_crm_leads');
    if (local && JSON.parse(local).length > 0) {
      setHasLocalData(true);
    }
  }, []);

  const handleMigrate = async () => {
    const count = await migrateLocalData();
    if (count > 0) {
      toast.success(`Successfully migrated ${count} leads to the cloud!`);
      setHasLocalData(false);
    }
  };

  if (loading) return <div className={styles.loading}>Loading Leads...</div>;

  const totalLeads = leads.length;
  const soldLeads = leads.filter(l => l.status === 'Sold').length;
  const pendingLeads = leads.filter(l => l.status === 'Pending').length;
  const lostLeads = leads.filter(l => l.status === 'Lost').length;

  const monthlyPremium = leads
    .filter(l => l.status === 'Sold' && l.premium)
    .reduce((sum, l) => sum + (parseFloat(l.premium.replace(/[^0-9.-]/g, '')) || 0), 0);

  const annualPremium = monthlyPremium * 12;
  const closeRate = (soldLeads + lostLeads) > 0
    ? Math.round((soldLeads / (soldLeads + lostLeads)) * 100)
    : 0;

  const fmt = (v) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(v);

  // Carrier breakdown (sold only)
  const carrierMap = {};
  leads.filter(l => l.status === 'Sold' && l.carrier).forEach(l => {
    carrierMap[l.carrier] = (carrierMap[l.carrier] || 0) + 1;
  });
  const carriers = Object.entries(carrierMap).sort((a, b) => b[1] - a[1]);

  // Follow-ups today
  const today = new Date().toISOString().split('T')[0];
  const followUpsToday = leads.filter(l => l.followUpDate && l.followUpDate <= today && l.status !== 'Sold' && l.status !== 'Lost');

  return (
    <div className={styles.dashboard}>
      {hasLocalData && (
        <div className={styles.migrationBanner}>
          <div className={styles.migrationText}>
            <strong>Sync your data:</strong> We found leads stored locally on this device. Would you like to sync them to your cloud account?
          </div>
          <Button onClick={handleMigrate} variant="secondary" size="small">Sync to Cloud</Button>
        </div>
      )}
      <div className={styles.header}>
        <h2 className={styles.greeting}>Good {getTimeOfDay()}, Agent</h2>
        <Button onClick={() => navigate('/leads/new')}>+ Add New Lead</Button>
      </div>

      {/* KPI Row */}
      <div className={styles.statsGrid}>
        <StatCard label="Total Leads" value={totalLeads} />
        <StatCard label="Sold" value={soldLeads} status="sold" />
        <StatCard label="Pending" value={pendingLeads} status="pending" />
        <StatCard label="Close Rate" value={`${closeRate}%`} status="new" />
        <StatCard label="Monthly Premium" value={fmt(monthlyPremium)} status="sold" />
        <StatCard label="Annual Premium" value={fmt(annualPremium)} status="new" />
      </div>

      <div className={styles.columns}>
        {/* Recent Leads Table */}
        <Card className={styles.tableCard}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>Recent Leads</h3>
            <Button variant="secondary" onClick={() => navigate('/leads')}>View All</Button>
          </div>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Status</th>
                  <th>Carrier</th>
                  <th>Premium</th>
                </tr>
              </thead>
              <tbody>
                {leads.slice(0, 6).map(lead => (
                  <tr key={lead.id} onClick={() => navigate(`/leads/${lead.id}`)} className={styles.row}>
                    <td>
                      <div className={styles.nameCell}>{lead.name || 'Unnamed'}</div>
                      <div className={styles.phoneMeta}>{lead.phone || ''}</div>
                    </td>
                    <td onClick={e => e.stopPropagation()}>
                      <InlineStatus leadId={lead.id} currentStatus={lead.status || 'New'} />
                    </td>
                    <td>{lead.carrier || '—'}</td>
                    <td className={styles.premium}>{lead.premium || '—'}</td>
                  </tr>
                ))}
                {leads.length === 0 && (
                  <tr><td colSpan="4" className={styles.emptyState}>
                    No leads yet. <button className={styles.addLink} onClick={() => navigate('/leads/new')}>Add your first lead →</button>
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Right side panels */}
        <div className={styles.rightCol}>

          {/* Follow-Up Today */}
          <Card className={styles.sideCard}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>
                Follow Up Today
                {followUpsToday.length > 0 && (
                  <span className={styles.badge}>{followUpsToday.length}</span>
                )}
              </h3>
            </div>
            <div className={styles.followUpList}>
              {followUpsToday.length === 0 && (
                <p className={styles.sideEmpty}>No follow-ups due today. ✓</p>
              )}
              {followUpsToday.map(lead => (
                <div key={lead.id} className={styles.followUpItem} onClick={() => navigate(`/leads/${lead.id}`)}>
                  <div className={styles.followUpName}>{lead.name}</div>
                  <div className={styles.followUpMeta}>{lead.phone}</div>
                </div>
              ))}
            </div>
          </Card>

          {/* Carrier Breakdown */}
          <Card className={styles.sideCard}>
            <h3 className={styles.cardTitle}>Carrier Breakdown</h3>
            {carriers.length === 0 && (
              <p className={styles.sideEmpty}>No sold policies yet.</p>
            )}
            {carriers.map(([carrier, count]) => (
              <div key={carrier} className={styles.carrierRow}>
                <span className={styles.carrierName}>{carrier}</span>
                <div className={styles.carrierBar}>
                  <div
                    className={styles.carrierFill}
                    style={{ width: `${(count / soldLeads) * 100}%` }}
                  />
                </div>
                <span className={styles.carrierCount}>{count}</span>
              </div>
            ))}
          </Card>

        </div>
      </div>
    </div>
  );
};

const getTimeOfDay = () => {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
};

export default Dashboard;
