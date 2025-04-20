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
      <div className={styles.avatarContainer}>
        {user.avatar ? (
          <img 
            src={user.avatar} 
            alt={`${user.name} avatar`} 
            className={styles.avatar}
            onError={(e) => {
              console.error('Ошибка загрузки аватара:', e);
              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/120?text=No+Avatar';
            }}
          />
        ) : (
          <div className={styles.noAvatar}>Нет аватара</div>
        )}
      </div>
      
      <div className={styles.info}>
        <h1 className={styles.name}>{user.name || 'Неизвестный игрок'}</h1>
        
        <div className={styles.details}>
          <div className={styles.detail}>
            <span className={styles.label}>ID:</span>
            <span className={styles.value}>{user.id_}</span>
          </div>
          
          <div className={styles.detail}>
            <span className={styles.label}>Ранг:</span>
            <span className={styles.value}>{user.rank || 'Не указан'}</span>
          </div>
          
          <div className={styles.detail}>
            <span className={styles.label}>Steam:</span>
            {user.steam ? (
              <a 
                href={user.steam} 
                target="_blank" 
                rel="noopener noreferrer" 
                className={styles.steamLink}
              >
                Профиль Steam
              </a>
            ) : (
              <span className={styles.value}>Не указан</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}; 