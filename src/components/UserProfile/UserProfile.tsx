import React from 'react';
import { User } from '../../api';
import styles from './UserProfile.module.scss';

interface UserProfileProps {
  user: User;
}

export const UserProfile: React.FC<UserProfileProps> = ({ user }) => {
  console.log('Рендер компонента UserProfile с данными:', user);

  if (!user || !user.id_) {
    console.warn('Компонент UserProfile: пустые или некорректные данные пользователя', user);
    return (
      <div className={styles.userProfile}>
        <p>Данные пользователя недоступны</p>
      </div>
    );
  }

  return (
    <div className={styles.userProfile}>
      <img 
        src={user.avatar || '/placeholder-avatar.png'} 
        alt={`${user.name} аватар`} 
        className={styles.avatar} 
      />
      
      <div className={styles.userInfo}>
        <h2 className={styles.userName}>{user.name}</h2>
        
        <div className={styles.userDetails}>
          <div className={styles.detail}>
            <span className={styles.label}>ID:</span>
            <span className={styles.value}>{user.id_}</span>
          </div>
          
          <div className={styles.detail}>
            <span className={styles.label}>Steam:</span>
            <a href={`https://steamcommunity.com/profiles/${user.steam}`} target="_blank" rel="noopener noreferrer" className={styles.value}>
              Профиль
            </a>
          </div>
          
          <div className={styles.detail}>
            <span className={styles.label}>Матчи:</span>
            <span className={styles.value}>{user.matches?.length || 0}</span>
          </div>
        </div>
        
        <div className={styles.userRank}>
          Рейтинг: <span className={styles.rankValue}>{user.rank}</span>
        </div>
      </div>
    </div>
  );
}; 