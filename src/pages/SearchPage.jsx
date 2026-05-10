import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLeads } from '../context/LeadContext';
import StatusTag from '../components/ui/StatusTag';
import styles from './SearchPage.module.css';

const SearchPage = () => {
  const { leads } = useLeads();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  const results = query.trim()
    ? leads.filter(lead => {
        const q = query.toLowerCase();
        return (
          lead.name?.toLowerCase().includes(q) ||
          lead.phone?.toLowerCase().includes(q) ||
          lead.email?.toLowerCase().includes(q) ||
          lead.carrier?.toLowerCase().includes(q) ||
          lead.beneficiary?.toLowerCase().includes(q) ||
          lead.doctorName?.toLowerCase().includes(q) ||
          lead.status?.toLowerCase().includes(q)
        );
      })
    : [];

  return (
    <div className={styles.container}>
      <div className={styles.searchBar}>
        <input
          autoFocus
          className={styles.input}
          placeholder="Search by name, phone, email, carrier, doctor..."
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
        {query && (
          <button className={styles.clear} onClick={() => setQuery('')}>✕</button>
        )}
      </div>

      {query && results.length === 0 && (
        <div className={styles.empty}>No results found for "<strong>{query}</strong>"</div>
      )}

      {results.length > 0 && (
        <div className={styles.resultCount}>{results.length} result{results.length !== 1 ? 's' : ''} for "{query}"</div>
      )}

      <div className={styles.results}>
        {results.map(lead => (
          <div
            key={lead.id}
            className={styles.resultRow}
            onClick={() => navigate(`/leads/${lead.id}`)}
          >
            <div className={styles.rowLeft}>
              <span className={styles.name}>{lead.name || 'Unnamed Lead'}</span>
              <span className={styles.meta}>{lead.phone} {lead.email ? `· ${lead.email}` : ''}</span>
            </div>
            <div className={styles.rowRight}>
              {lead.carrier && <span className={styles.carrier}>{lead.carrier}</span>}
              <StatusTag status={lead.status || 'New'} />
            </div>
          </div>
        ))}
      </div>

      {!query && (
        <div className={styles.hint}>
          Start typing to search across all your leads.
        </div>
      )}
    </div>
  );
};

export default SearchPage;
