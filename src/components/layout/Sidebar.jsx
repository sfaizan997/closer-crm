import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, UserPlus, Search, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import styles from './Sidebar.module.css';

const Sidebar = () => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className={styles.sidebar}>
      <div className={styles.brand}>
        <h2>FEX CRM</h2>
      </div>
      <nav className={styles.nav}>
        <NavLink to="/" className={({ isActive }) => isActive ? `${styles.navItem} ${styles.active}` : styles.navItem} end>
          <LayoutDashboard size={16} />
          <span>Dashboard</span>
        </NavLink>
        <NavLink to="/leads" className={({ isActive }) => isActive ? `${styles.navItem} ${styles.active}` : styles.navItem}>
          <Users size={16} />
          <span>All Leads</span>
        </NavLink>
        <NavLink to="/leads/new" className={({ isActive }) => isActive ? `${styles.navItem} ${styles.active}` : styles.navItem}>
          <UserPlus size={16} />
          <span>Add New Lead</span>
        </NavLink>
        <NavLink to="/search" className={({ isActive }) => isActive ? `${styles.navItem} ${styles.active}` : styles.navItem}>
          <Search size={16} />
          <span>Search</span>
          <span className={styles.kbd}>⌘K</span>
        </NavLink>
        <NavLink to="/settings" className={({ isActive }) => isActive ? `${styles.navItem} ${styles.active}` : styles.navItem}>
          <Settings size={16} />
          <span>Settings</span>
        </NavLink>
      </nav>
      <div className={styles.userProfile}>
        <div className={styles.avatar}>{user?.email?.charAt(0).toUpperCase() || 'U'}</div>
        <div className={styles.userInfo}>
          <span className={styles.userName}>{user?.email?.split('@')[0]}</span>
          <span className={styles.userRole}>Agent</span>
        </div>
        <button className={styles.logoutBtn} onClick={handleLogout} title="Log Out">
          <LogOut size={16} />
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
