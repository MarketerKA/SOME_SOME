import React, { useState } from 'react';
import styles from './MatchList.module.scss';
import { Match } from '../../api';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';
import cx from 'classnames';
import { getHeroIconByIdDirect, getFallbackHeroIcon } from '../../utils/heroImages';
import { getHeroColor as getHeroColorFromUtils } from '../../utils/createDefaultImages';

// Массив цветов для индикаторов героев
const colors = [
  '#FF5252', '#FF4081', '#E040FB', '#7C4DFF', '#536DFE',
  '#448AFF', '#40C4FF', '#18FFFF', '#64FFDA', '#69F0AE',
  '#B2FF59', '#EEFF41', '#FFFF00', '#FFD740', '#FFAB40',
  '#FF6E40', '#8D6E63', '#78909C'
];

// Функция получения цвета для героя
const getHeroColor = getHeroColorFromUtils;

// Функция форматирования длительности матча
const formatDuration = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
};

// Получение аббревиатуры режима игры
const getGameModeAbbreviation = (gameMode: number | string) => {
  // Преобразуем gameMode в строку для работы с записями
  const mode = String(gameMode);
  const gameModeMap: Record<string, string> = {
    '0': 'UNK',
    '1': 'AP',
    '2': 'CM',
    '3': 'RD',
    '4': 'SD',
    '5': 'AR',
    '22': 'TURBO',
    '16': 'CD',
    '18': 'AD'
  };
  
  return gameModeMap[mode] || `Режим ${mode}`;
};

export interface MatchListProps {
  matches?: Match[];
  loading?: boolean;
  error?: string | null;
}

export const MatchList: React.FC<MatchListProps> = ({ matches, loading, error }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const matchesPerPage = 10;
  
  if (loading) {
    return (
      <div className={styles.matchList}>
        <div className={styles.title}>Загрузка матчей...</div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className={styles.matchList}>
        <div className={styles.title}>Ошибка</div>
        <div className={styles.empty}>{error}</div>
      </div>
    );
  }
  
  if (!matches || matches.length === 0) {
    return (
      <div className={styles.matchList}>
        <div className={styles.title}>Последние матчи</div>
        <div className={styles.empty}>Матчи не найдены</div>
      </div>
    );
  }
  
  // Общее количество страниц
  const totalPages = Math.ceil(matches.length / matchesPerPage);
  
  // Получение матчей для текущей страницы
  const getCurrentMatches = () => {
    const startIndex = (currentPage - 1) * matchesPerPage;
    const endIndex = startIndex + matchesPerPage;
    return matches.slice(startIndex, endIndex);
  };
  
  // Обработчик изменения страницы
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };
  
  return (
    <div className={styles.matchList}>
      <div className={styles.title}>
        Последние матчи
        <span className={styles.matchCount}>{matches.length}</span>
      </div>
      <div className={styles.matchesContainer}>
        {getCurrentMatches().map((match) => {
          const isWin = match.win;
          const timeAgo = formatDistanceToNow(new Date(match.time * 1000), { 
            addSuffix: true,
            locale: ru
          });
          
          // Получение цвета для героя
          const heroColor = getHeroColor(match.hero_id);
          
          return (
            <div 
              key={match.id} 
              className={cx(styles.match, isWin ? styles.win : styles.loss)}
            >
              <div className={styles.heroIndicator}>
                <img 
                  src={getHeroIconByIdDirect(match.hero_id)} 
                  alt={`Герой ${match.hero_id}`}
                  onError={(e) => {
                    // Если изображение не загрузилось, используем цветной индикатор
                    (e.target as HTMLImageElement).style.display = 'none';
                    (e.target as HTMLImageElement).parentElement!.style.backgroundColor = heroColor;
                    (e.target as HTMLImageElement).parentElement!.textContent = String(match.hero_id);
                  }}
                />
              </div>
              <div className={styles.matchDetails}>
                <div className={cx(styles.matchResult, isWin ? styles.win : styles.loss)}>
                  {isWin ? 'Победа' : 'Поражение'}
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
                    <span className={styles.value}>{getGameModeAbbreviation(match.game_mode)}</span>
                  </div>
                </div>
              </div>
              <div className={styles.matchTime}>{timeAgo}</div>
            </div>
          );
        })}
      </div>
      
      {/* Пагинация */}
      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button 
            className={cx(styles.pageButton, { [styles.disabled]: currentPage === 1 })}
            onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            &lt;
          </button>
          <div className={styles.pageInfo}>
            {currentPage} из {totalPages}
          </div>
          <button 
            className={cx(styles.pageButton, { [styles.disabled]: currentPage === totalPages })}
            onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            &gt;
          </button>
        </div>
      )}
    </div>
  );
}; 