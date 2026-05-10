import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import styles from './PageLayout.module.css';

const PageLayout = ({ children }) => {
  const navigate = useNavigate();

  // Global Cmd+K / Ctrl+K shortcut to open Search
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        navigate('/search');
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [navigate]);

  return (
    <div className={styles.layout}>
      <Sidebar />
      <div className={styles.mainContent}>
        <Header />
        <main className={styles.contentArea}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default PageLayout;
