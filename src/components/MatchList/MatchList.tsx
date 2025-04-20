import React from 'react';
import { Match } from '../../api';
import styles from './MatchList.module.scss';

interface MatchListProps {
  matches: Match[];
}

export const MatchList: React.FC<MatchListProps> = ({ matches }) => {
  console.log('Рендер компонента MatchList с данными:', matches);
  
  // Функция для форматирования времени из timestamp
  const formatTime = (timestamp: number): string => {
    if (!timestamp) return 'Неизвестно';
    
    try {
      const date = new Date(timestamp * 1000);
      return date.toLocaleDateString('ru-RU');
    } catch (e) {
      console.error('Ошибка форматирования времени:', e);
      return 'Неверный формат';
    }
  };

  // Функция для форматирования длительности матча
  const formatDuration = (seconds: number): string => {
    if (!seconds) return 'Неизвестно';
    
    try {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    } catch (e) {
      console.error('Ошибка форматирования длительности:', e);
      return 'Неверный формат';
    }
  };

  if (!matches || !Array.isArray(matches) || matches.length === 0) {
    return (
      <div className={styles.matchList}>
        <h2>Последние матчи</h2>
        <p className={styles.emptyMatches}>Матчи не найдены</p>
      </div>
    );
  }

  return (
    <div className={styles.matchList}>
      <h2>Последние матчи</h2>
      <div className={styles.matches}>
        {matches.map((match) => (
          <div 
            key={match.id} 
            className={`${styles.matchCard} ${match.win ? styles.win : styles.loss}`}
          >
            <div className={styles.matchHeader}>
              <span className={styles.result}>{match.win ? 'Победа' : 'Поражение'}</span>
              <span className={styles.time}>{formatTime(match.time)}</span>
            </div>
            
            <div className={styles.matchInfo}>
              <div>
                <span className={styles.label}>ID героя:</span>
                <span className={styles.value}>{match.hero_id}</span>
              </div>
              
              <div>
                <span className={styles.label}>Длительность:</span>
                <span className={styles.value}>{formatDuration(match.duration)}</span>
              </div>
              
              <div className={styles.stats}>
                <div className={styles.stat}>
                  <span className={styles.statValue}>{match.kills}</span>
                  <span className={styles.statLabel}>K</span>
                </div>
                <div className={styles.stat}>
                  <span className={styles.statValue}>{match.deaths}</span>
                  <span className={styles.statLabel}>D</span>
                </div>
                <div className={styles.stat}>
                  <span className={styles.statValue}>{match.assists}</span>
                  <span className={styles.statLabel}>A</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}; 