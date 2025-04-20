import React, { useState } from 'react';
import styles from './StatsSelector.module.scss';

interface StatsSelectorProps {
  onSubmit: (ratingId: string, heroId: string | null, statsType: string) => void;
  userId: number;
}

// Список допустимых типов статистики согласно документации API
const STAT_TYPES = ['against', 'raw', 'with', 'xp', 'item', 'xpm', 'gpm'];

// Список допустимых значений rating_id согласно бэкенду
const RATING_VALUES = [
  "11", "12", "13", "14", "15", 
  "21", "22", "23", "24", "25", 
  "31", "32", "33", "34", "35", 
  "41", "42", "43", "44", "45", 
  "51", "52", "53", "54", "55", 
  "61", "62", "63", "64", "65", 
  "71", "72", "73", "74", "75", 
  "81"
];

export const StatsSelector: React.FC<StatsSelectorProps> = ({ onSubmit, userId }) => {
  // Используем первое значение из списка допустимых как дефолтное
  const [ratingId, setRatingId] = useState(RATING_VALUES[0]);
  const [heroId, setHeroId] = useState<string | null>(null);
  const [statsType, setStatsType] = useState(STAT_TYPES[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Отправка формы статистики:', { ratingId, heroId, statsType });
    
    // Проверяем ввод
    if (!RATING_VALUES.includes(ratingId)) {
      alert(`Неверное значение ID рейтинга. Допустимые значения: ${RATING_VALUES.join(', ')}`);
      return;
    }
    
    // Убираем пустые пробелы
    const cleanHeroId = heroId?.trim() || null;
    
    onSubmit(ratingId, cleanHeroId, statsType);
  };

  return (
    <div className={styles.statsSelector}>
      <form onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label htmlFor="rating-id">ID рейтинга:</label>
          <select
            id="rating-id"
            value={ratingId}
            onChange={(e) => setRatingId(e.target.value)}
            required
          >
            {RATING_VALUES.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
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