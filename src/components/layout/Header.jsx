import React from 'react';
import { useLocation } from 'react-router-dom';
import styles from './Header.module.css';

const Header = () => {
  const location = useLocation();
  
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/') return 'Dashboard';
    if (path === '/leads') return 'All Leads';
    if (path === '/leads/new') return 'Add New Lead';
    if (path.startsWith('/leads/')) return 'Lead Detail';
    if (path === '/search') return 'Search';
    if (path === '/settings') return 'Settings';
    return 'Dashboard';
  };

  const getBreadcrumbs = () => {
    const title = getPageTitle();
    if (title === 'Dashboard') return null;
    if (title === 'All Leads') return null;
    if (title === 'Settings' || title === 'Search') return null;
    return `All Leads > ${title}`;
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        {breadcrumbs && <div className={styles.breadcrumb}>{breadcrumbs}</div>}
        <h1 className={styles.title}>{getPageTitle()}</h1>
      </div>
      <div className={styles.actions}>
        {/* Action buttons will go here based on context */}
      </div>
    </header>
  );
};

export default Header;
