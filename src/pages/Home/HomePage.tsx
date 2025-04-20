import React, { useEffect, useState } from 'react';
import { UserProfile } from '../../components/UserProfile';
import { MatchList } from '../../components/MatchList';
import { StatsSelector } from '../../components/StatsSelector';
import { StatsDisplay } from '../../components/StatsDisplay';
import { fetchUserProfile, fetchHeroStats, fetchAllHeroesStats, User, Match } from '../../api';
import styles from './HomePage.module.scss';

export const HomePage: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [statsResult, setStatsResult] = useState<string>('');
  const [statsLoading, setStatsLoading] = useState<boolean>(false);
  const [statsError, setStatsError] = useState<string | null>(null);

  // Функция загрузки статистики
  const loadStats = async (ratingId: string, heroId: string | null, statsType: string) => {
    setStatsLoading(true);
    setStatsError(null);
    
    try {
      console.log('Загрузка статистики...', { ratingId, heroId, statsType });
      let result;
      
      if (heroId) {
        // Получаем статистику для конкретного героя
        result = await fetchHeroStats(ratingId, heroId, statsType);
      } else {
        // Получаем статистику для всех героев
        result = await fetchAllHeroesStats(ratingId, statsType);
      }
      
      console.log('Получены данные статистики (частичные):', 
                  typeof result === 'string' 
                    ? result.substring(0, 100) 
                    : JSON.stringify(result).substring(0, 100) + '...');
      
      // Преобразуем результат в строку для отображения
      setStatsResult(typeof result === 'string' ? result : JSON.stringify(result, null, 2));
    } catch (err) {
      console.error('Ошибка при загрузке статистики:', err);
      setStatsError('Не удалось загрузить статистику');
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    const loadUserData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        console.log('Загрузка данных пользователя...');
        const userData = await fetchUserProfile();
        console.log('Получены данные пользователя с ID:', userData.id_);
        
        if (!userData || !userData.id_) {
          throw new Error('Данные пользователя пусты или имеют неверный формат');
        }
        
        setUser(userData);
        
        // Загружаем статистику по умолчанию после загрузки профиля
        await loadStats(userData.id_.toString(), null, 'against');
      } catch (err: any) {
        console.error('Ошибка при загрузке данных пользователя:', err);
        setError(`Не удалось загрузить данные пользователя: ${err.message || 'Неизвестная ошибка'}`);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, []);

  const handleStatsSubmit = (ratingId: string, heroId: string | null, statsType: string) => {
    loadStats(ratingId, heroId, statsType);
  };

  console.log('Рендер компонента HomePage:', { user, loading, error });

  if (loading) {
    return (
      <div className={styles.homePage}>
        <div className={styles.loader}>Загрузка данных...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.homePage}>
        <div className={styles.error}>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Попробовать снова</button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className={styles.homePage}>
        <div className={styles.error}>
          <p>Не удалось получить данные пользователя</p>
          <button onClick={() => window.location.reload()}>Попробовать снова</button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.homePage}>
      <div className={styles.container}>
        <h1 className={styles.title}>Dota 2 Статистика</h1>
        
        <UserProfile user={user} />
        
        <div className={styles.statsSection}>
          <h2>Получить статистику героев</h2>
          <StatsSelector onSubmit={handleStatsSubmit} userId={user.id_} />
          <StatsDisplay 
            stats={statsResult} 
            loading={statsLoading} 
            error={statsError} 
          />
        </div>
        
        <MatchList matches={user.matches} />
      </div>
    </div>
  );
}; 