import React, { useState } from 'react';
import styles from './HeroStats.module.scss';
import { fetchHeroStats } from '../../api';
import cx from 'classnames';

interface HeroStatsProps {
  heroId: number;
  heroName?: string;
  ratingId?: string;
}

interface HeroStatsData {
  gpm: number;
  xpm: number;
  win_rate: number;
  presence: number;
  kda: number;
  matches_count: number;
  picks_count: number;
  bans_count: number;
}

export const HeroStats: React.FC<HeroStatsProps> = ({ heroId, heroName, ratingId = '11' }) => {
  const [statsData, setStatsData] = useState<HeroStatsData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [statsType, setStatsType] = useState<string>('raw');

  const loadHeroStats = async (type: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await fetchHeroStats(ratingId, String(heroId), type);
      setStatsData(result);
      setStatsType(type);
    } catch (err: any) {
      console.error('Ошибка при загрузке статистики героя:', err);
      setError(err.message || 'Не удалось загрузить статистику героя');
    } finally {
      setLoading(false);
    }
  };

  // Загружаем статистику при первом рендере
  React.useEffect(() => {
    loadHeroStats(statsType);
  }, [heroId, ratingId]);

  // Функция для формирования процентной полоски
  const renderStatBar = (value: number, maxValue: number, color: string) => {
    const percentage = Math.min(100, (value / maxValue) * 100);
    
    return (
      <div className={styles.barContainer}>
        <div 
          className={cx(styles.progressBar, styles[color])}
          style={{ width: `${percentage}%` }}
        />
      </div>
    );
  };

  if (loading) {
    return (
      <div className={styles.heroStats}>
        <div className={styles.loading}>Загрузка статистики героя...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.heroStats}>
        <div className={styles.error}>{error}</div>
      </div>
    );
  }

  if (!statsData) {
    return (
      <div className={styles.heroStats}>
        <div className={styles.empty}>Нет данных о статистике героя</div>
      </div>
    );
  }

  return (
    <div className={styles.heroStats}>
      <div className={styles.header}>
        <h3 className={styles.heroName}>{heroName || `Герой ${heroId}`}</h3>
        <div className={styles.tabs}>
          <button 
            className={cx(styles.tab, { [styles.active]: statsType === 'raw' })}
            onClick={() => loadHeroStats('raw')}
          >
            Общая
          </button>
          <button 
            className={cx(styles.tab, { [styles.active]: statsType === 'with' })}
            onClick={() => loadHeroStats('with')}
          >
            С героями
          </button>
          <button 
            className={cx(styles.tab, { [styles.active]: statsType === 'against' })}
            onClick={() => loadHeroStats('against')}
          >
            Против героев
          </button>
          <button 
            className={cx(styles.tab, { [styles.active]: statsType === 'item' })}
            onClick={() => loadHeroStats('item')}
          >
            Предметы
          </button>
        </div>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statTitle}>Винрейт</div>
          <div className={styles.statValue}>{(statsData.win_rate || 0).toFixed(2)}%</div>
          {renderStatBar(statsData.win_rate || 0, 100, 'greenBar')}
        </div>
        
        <div className={styles.statCard}>
          <div className={styles.statTitle}>Присутствие</div>
          <div className={styles.statValue}>{(statsData.presence || 0).toFixed(2)}%</div>
          {renderStatBar(statsData.presence || 0, 100, 'redBar')}
        </div>
        
        <div className={styles.statCard}>
          <div className={styles.statTitle}>KDA</div>
          <div className={styles.statValue}>{(statsData.kda || 0).toFixed(2)}</div>
          {renderStatBar(statsData.kda || 0, 10, 'orangeBar')}
        </div>
        
        <div className={styles.statCard}>
          <div className={styles.statTitle}>GPM</div>
          <div className={styles.statValue}>{Math.round(statsData.gpm || 0)}</div>
          {renderStatBar(statsData.gpm || 0, 900, 'goldBar')}
        </div>
        
        <div className={styles.statCard}>
          <div className={styles.statTitle}>XPM</div>
          <div className={styles.statValue}>{Math.round(statsData.xpm || 0)}</div>
          {renderStatBar(statsData.xpm || 0, 900, 'cyanBar')}
        </div>
      </div>

      <div className={styles.additionalStats}>
        <div className={styles.statRow}>
          <span className={styles.statLabel}>Всего матчей:</span>
          <span className={styles.statValue}>{statsData.matches_count || 0}</span>
        </div>
        <div className={styles.statRow}>
          <span className={styles.statLabel}>Пиков:</span>
          <span className={styles.statValue}>{statsData.picks_count || 0}</span>
        </div>
        <div className={styles.statRow}>
          <span className={styles.statLabel}>Банов:</span>
          <span className={styles.statValue}>{statsData.bans_count || 0}</span>
        </div>
      </div>
    </div>
  );
}; 