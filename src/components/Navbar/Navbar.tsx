import React from 'react';
import { NavLink } from 'react-router-dom';
import styles from './Navbar.module.scss';

export const Navbar: React.FC = () => {
  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        <div className={styles.logo}>
          <NavLink to="/" className={styles.logoLink}>
            Ancient Stats
          </NavLink>
        </div>
        
        <div className={styles.navigation}>
          <NavLink 
            to="/" 
            className={({ isActive }) => 
              isActive ? `${styles.navLink} ${styles.active}` : styles.navLink
            }
            end
          >
            Главная
          </NavLink>
          
          <NavLink 
            to="/heroes" 
            className={({ isActive }) => 
              isActive ? `${styles.navLink} ${styles.active}` : styles.navLink
            }
          >
            Герои
          </NavLink>
        </div>
      </div>
    </nav>
  );
}; 