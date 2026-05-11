import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, ArrowUpDown, ArrowUp, ArrowDown, Trash2, Users } from 'lucide-react';
import Card from '../components/ui/Card';
import InlineStatus from '../components/ui/InlineStatus';
import Button from '../components/ui/Button';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import { SelectField, InputField } from '../components/ui/FormFields';
import { useLeads } from '../context/LeadContext';
import { useToast } from '../context/ToastContext';
import styles from './AllLeads.module.css';

const SortIcon = ({ field, sortField, sortDir }) => {
  if (sortField !== field) return <ArrowUpDown size={13} className={styles.sortIconInactive} />;
  return sortDir === 'asc' ? <ArrowUp size={13} /> : <ArrowDown size={13} />;
};

const AllLeads = () => {
  const navigate = useNavigate();
  const { leads, deleteLead } = useLeads();
  const toast = useToast();

  const [statusFilter, setStatusFilter] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState('createdAt');
  const [sortDir, setSortDir] = useState('desc');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const filteredLeads = useMemo(() => {
    let result = leads.filter(lead => {
      const matchesStatus = statusFilter ? lead.status === statusFilter : true;
      const matchesSource = sourceFilter ? lead.leadSource === sourceFilter : true;
      const matchesSearch = search
        ? lead.name?.toLowerCase().includes(search.toLowerCase()) ||
          lead.phone?.toLowerCase().includes(search.toLowerCase())
        : true;
      return matchesStatus && matchesSource && matchesSearch;
    });

    result.sort((a, b) => {
      let aVal = a[sortField] || '';
      let bVal = b[sortField] || '';
      if (sortField === 'premium') {
        aVal = parseFloat(String(aVal).replace(/[^0-9.-]/g, '')) || 0;
        bVal = parseFloat(String(bVal).replace(/[^0-9.-]/g, '')) || 0;
      }
      if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return result;
  }, [leads, statusFilter, sourceFilter, search, sortField, sortDir]);

  const handleExportCSV = () => {
    const headers = ['Name', 'Phone', 'Email', 'Status', 'Carrier', 'Premium', 'Coverage', 'Draft Date', 'Lead Source', 'Follow Up Date', 'DOB', 'Smoker'];
    const rows = filteredLeads.map(l => [
      l.name, l.phone, l.email, l.status, l.carrier, l.premium,
      l.coverage, l.draftDate, l.leadSource, l.followUpDate, l.dob, l.smoker
    ]);
    const csv = [headers, ...rows]
      .map(row => row.map(v => `"${(v || '').replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fex_leads_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${filteredLeads.length} leads to CSV`);
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    
    deleteLead(deleteTarget.id).catch(err => {
      toast.error('Failed to delete lead');
      console.error(err);
    });
    
    toast.success(`Lead "${deleteTarget.name}" deleted`);
    setDeleteTarget(null);
    setIsDeleting(false);
  };

  const uniqueSources = [...new Set(leads.map(l => l.leadSource).filter(Boolean))];

  return (
    <div className={styles.container}>
      <div className={styles.filtersRow}>
        <div className={styles.filtersLeft}>
          <InputField
            label="Search"
            id="search"
            placeholder="Name or phone..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className={styles.searchField}
          />
          <SelectField
            label="Status"
            id="statusFilter"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            options={[
              { label: 'All Statuses', value: '' },
              { label: 'New', value: 'New' },
              { label: 'Pending', value: 'Pending' },
              { label: 'Sold', value: 'Sold' },
              { label: 'Lost', value: 'Lost' },
            ]}
          />
          <SelectField
            label="Lead Source"
            id="sourceFilter"
            value={sourceFilter}
            onChange={e => setSourceFilter(e.target.value)}
            options={[
              { label: 'All Sources', value: '' },
              ...uniqueSources.map(s => ({ label: s, value: s })),
            ]}
          />
        </div>
        <div className={styles.rightActions}>
          <Button variant="secondary" onClick={handleExportCSV}>
            <Download size={14} /> Export CSV
          </Button>
          <Button onClick={() => navigate('/leads/new')}>+ Add New Lead</Button>
        </div>
      </div>

      <Card className={styles.tableCard}>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.sortable} onClick={() => handleSort('name')}>
                  Name <SortIcon field="name" sortField={sortField} sortDir={sortDir} />
                </th>
                <th>Phone</th>
                <th>Status</th>
                <th>Carrier</th>
                <th className={styles.sortable} onClick={() => handleSort('premium')}>
                  Premium <SortIcon field="premium" sortField={sortField} sortDir={sortDir} />
                </th>
                <th>Source</th>
                <th>Follow Up</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeads.map(lead => (
                <tr
                  key={lead.id}
                  onClick={() => navigate(`/leads/${lead.id}`)}
                  className={styles.row}
                >
                  <td className={styles.nameCell}>{lead.name || 'Unnamed Lead'}</td>
                  <td className={styles.mono}>{lead.phone || '—'}</td>
                  <td onClick={e => e.stopPropagation()}>
                    <InlineStatus leadId={lead.id} currentStatus={lead.status || 'New'} />
                  </td>
                  <td>{lead.carrier || '—'}</td>
                  <td className={styles.mono}>{lead.premium || '—'}</td>
                  <td>
                    {lead.leadSource
                      ? <span className={styles.sourceBadge}>{lead.leadSource}</span>
                      : '—'}
                  </td>
                  <td>
                    {lead.followUpDate
                      ? <span className={lead.followUpDate <= new Date().toISOString().split('T')[0] ? styles.followUpDue : styles.followUp}>
                          {lead.followUpDate}
                        </span>
                      : '—'}
                  </td>
                  <td onClick={e => e.stopPropagation()}>
                    <div className={styles.actionBtns}>
                      <Button variant="secondary" className={styles.actionBtn}
                        onClick={() => navigate(`/leads/${lead.id}`)}>Edit</Button>
                      <button
                        className={styles.deleteBtn}
                        onClick={() => setDeleteTarget(lead)}
                        title="Delete lead"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredLeads.length === 0 && (
                <tr>
                  <td colSpan="8" className={styles.emptyState}>
                    <div className={styles.emptyContent}>
                      <Users size={32} />
                      <p>No leads match your filters.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className={styles.pagination}>
          <span className={styles.pageInfo}>
            Showing <strong>{filteredLeads.length}</strong> of <strong>{leads.length}</strong> leads
          </span>
        </div>
      </Card>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete Lead"
        message={`Are you sure you want to permanently delete "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmLabel={isDeleting ? "Deleting..." : "Delete Lead"}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        disabled={isDeleting}
      />
    </div>
  );
};

export default AllLeads;
