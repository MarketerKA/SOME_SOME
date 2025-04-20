import React, { useState } from 'react';
import { Match } from '../../api';
import styles from './MatchList.module.scss';

interface MatchListProps {
  matches: Match[];
}

export const MatchList: React.FC<MatchListProps> = ({ matches }) => {
  // Состояние для пагинации
  const [currentPage, setCurrentPage] = useState(1);
  const matchesPerPage = 10;
  
  // Расчет общего количества страниц
  const totalPages = Math.ceil((matches?.length || 0) / matchesPerPage);
  
  // Получение текущих матчей для отображения
  const getCurrentMatches = () => {
    const startIndex = (currentPage - 1) * matchesPerPage;
    const endIndex = startIndex + matchesPerPage;
    return matches?.slice(startIndex, endIndex) || [];
  };
  
  // Функция для переключения страниц
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Функция форматирования времени
  const formatTime = (timestamp: number) => {
    if (!timestamp) return 'Неизвестно';
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Функция форматирования длительности матча
  const formatDuration = (seconds: number) => {
    if (!seconds) return '00:00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Функция получения URL для иконки героя
  const getHeroIconUrl = (heroId: number) => {
    // Здесь можно было бы подключить настоящие изображения героев
    return `https://api.opendota.com/apps/dota2/images/dota_react/heroes/icons/${heroId}.png?`;
  };

  if (!matches || matches.length === 0) {
    return (
      <div className={styles.matchList}>
        <div className={styles.title}>Последние матчи</div>
        <div className={styles.empty}>
          Нет данных о матчах
        </div>
      </div>
    );
  }

  // Получаем текущие матчи для отображения
  const currentMatches = getCurrentMatches();

  return (
    <div className={styles.matchList}>
      <div className={styles.title}>
        Последние матчи 
        <span className={styles.matchCount}>
          ({matches.length} всего)
        </span>
      </div>
      
      <div className={styles.matchesContainer}>
        {currentMatches.map((match) => (
          <div 
            key={match.id} 
            className={`${styles.match} ${match.win ? styles.win : styles.loss}`}
          >
            <img 
              src={getHeroIconUrl(match.hero_id)} 
              alt={`Герой ${match.hero_id}`} 
              className={styles.heroIcon}
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/48?text=Hero';
              }}
            />
            
            <div className={styles.matchDetails}>
              <div className={`${styles.matchResult} ${match.win ? styles.win : styles.loss}`}>
                {match.win ? 'Победа' : 'Поражение'}
              </div>
              
              <div className={styles.matchInfo}>
                <div className={styles.stat}>
                  <span className={styles.label}>KDA:</span>
                  <span className={styles.value}>{match.kills}/{match.deaths}/{match.assists}</span>
                </div>
                
                <div className={styles.stat}>
                  <span className={styles.label}>Длительность:</span>
                  <span className={styles.value}>{formatDuration(match.duration)}</span>
                </div>
                
                <div className={styles.stat}>
                  <span className={styles.label}>Режим:</span>
                  <span className={styles.value}>{match.game_mode}</span>
                </div>
              </div>
            </div>
            
            <div className={styles.matchTime}>
              {formatTime(match.time)}
            </div>
          </div>
        ))}
      </div>
      
      {/* Пагинация */}
      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button 
            className={`${styles.pageButton} ${currentPage === 1 ? styles.disabled : ''}`}
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            &lt;
          </button>
          
          <div className={styles.pageInfo}>
            {currentPage} из {totalPages}
          </div>
          
          <button 
            className={`${styles.pageButton} ${currentPage === totalPages ? styles.disabled : ''}`}
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            &gt;
          </button>
        </div>
      )}
    </div>
  );
}; 