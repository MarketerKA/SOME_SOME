import React, { useState } from 'react';
import styles from './StatsSelector.module.scss';

interface StatsSelectorProps {
  onSubmit: (ratingId: string, heroId: string | null, statsType: string) => void;
  userId: number;
}

const STAT_TYPES = ['against', 'raw', 'with', 'xp', 'item', 'xpm', 'gpm'];

export const StatsSelector: React.FC<StatsSelectorProps> = ({ onSubmit, userId }) => {
  const [ratingId, setRatingId] = useState(userId ? userId.toString() : '318334842');
  const [heroId, setHeroId] = useState<string | null>(null);
  const [statsType, setStatsType] = useState(STAT_TYPES[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Отправка формы статистики:', { ratingId, heroId, statsType });
    onSubmit(ratingId, heroId, statsType);
  };

  return (
    <div className={styles.statsSelector}>
      <form onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label htmlFor="rating-id">ID рейтинга:</label>
          <input
            id="rating-id"
            type="text"
            value={ratingId}
            onChange={(e) => setRatingId(e.target.value)}
            required
          />
        </div>
        
        <div className={styles.formGroup}>
          <label htmlFor="hero-id">ID героя (опционально):</label>
          <input
            id="hero-id"
            type="text"
            value={heroId || ''}
            onChange={(e) => setHeroId(e.target.value || null)}
            placeholder="Оставьте пустым для всех героев"
          />
        </div>
        
        <div className={styles.formGroup}>
          <label htmlFor="stats-type">Тип статистики:</label>
          <select
            id="stats-type"
            value={statsType}
            onChange={(e) => setStatsType(e.target.value)}
            required
          >
            {STAT_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
        
        <button type="submit" className={styles.submitButton}>
          Получить статистику
        </button>
      </form>
    </div>
  );
}; 