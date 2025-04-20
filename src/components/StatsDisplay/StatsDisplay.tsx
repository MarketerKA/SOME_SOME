import React from 'react';
import styles from './StatsDisplay.module.scss';

interface StatsDisplayProps {
  stats: string;
  loading: boolean;
  error: string | null;
}

export const StatsDisplay: React.FC<StatsDisplayProps> = ({ stats, loading, error }) => {
  if (loading) {
    return (
      <div className={styles.statsDisplay}>
        <div className={styles.loading}>
          <p>Загрузка статистики...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.statsDisplay}>
        <div className={styles.error}>
          <p>Ошибка: {error}</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className={styles.statsDisplay}>
        <div className={styles.empty}>
          <p>Выберите параметры и нажмите "Получить статистику"</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.statsDisplay}>
      <h2>Результаты статистики</h2>
      <div className={styles.statsContent}>
        <pre>{stats}</pre>
      </div>
    </div>
  );
}; 