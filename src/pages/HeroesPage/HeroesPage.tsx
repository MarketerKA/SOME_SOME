import React, { useState, useEffect } from 'react';
import { HeroGrid } from '../../components/HeroGrid';
import { fetchHeroes } from '../../api';
import styles from './HeroesPage.module.scss';

export const HeroesPage: React.FC = () => {
  const [heroes, setHeroes] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadHeroes = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetchHeroes();
        
        if (!response || !response.heroes || !Array.isArray(response.heroes)) {
          throw new Error('Неверный формат данных');
        }
        
        setHeroes(response.heroes);
      } catch (err: any) {
        console.error('Ошибка при загрузке героев:', err);
        setError(`Не удалось загрузить список героев: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };
    
    loadHeroes();
  }, []);

  return (
    <div className={styles.heroesPage}>
      <div className={styles.container}>
        <h1 className={styles.title}>Герои Dota 2</h1>
        <p className={styles.subtitle}>
          Выберите героя, чтобы посмотреть его статистику по рейтингу, винрейту и другим показателям
        </p>
        
        <HeroGrid heroes={heroes} loading={loading} error={error} />
      </div>
    </div>
  );
}; 