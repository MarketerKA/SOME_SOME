import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { UserProfile } from '../../components/UserProfile';
import { MatchList } from '../../components/MatchList';
import { StatsSelector } from '../../components/StatsSelector';
import { StatsDisplay } from '../../components/StatsDisplay';
import { fetchUserProfile, fetchHeroStats, fetchAllHeroesStats, User, Match } from '../../api';
import styles from './HomePage.module.scss';

// Список допустимых значений rating_id - первое значение будет использовано по умолчанию
const DEFAULT_RATING_ID = "11";
// Тип статистики по умолчанию
const DEFAULT_STATS_TYPE = "against";

export const HomePage: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [statsResult, setStatsResult] = useState<any>(null);
  const [statsLoading, setStatsLoading] = useState<boolean>(false);
  const [statsError, setStatsError] = useState<string | null>(null);

  // Функция загрузки статистики - оптимизирована с useCallback
  const loadStats = useCallback(async (ratingId: string, heroId: string | null, statsType: string) => {
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
      
      // Для отладки, показываем только часть данных в консоли
      console.log('Получены данные статистики:', 
                 typeof result === 'string' 
                   ? 'Строка длиной ' + result.length
                   : 'Объект с ' + Object.keys(result).length + ' ключами');
      
      // Сохраняем результат напрямую, без преобразования, компонент StatsDisplay 
      // сам правильно обработает данные
      setStatsResult(result);
    } catch (err: any) {
      console.error('Ошибка при загрузке статистики:', err);
      setStatsError(err.message || 'Не удалось загрузить статистику');
    } finally {
      setStatsLoading(false);
    }
  }, []);

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
        // Используем правильное значение rating_id из списка допустимых значений
        await loadStats(DEFAULT_RATING_ID, null, DEFAULT_STATS_TYPE);
      } catch (err: any) {
        console.error('Ошибка при загрузке данных пользователя:', err);
        setError(`Не удалось загрузить данные пользователя: ${err.message || 'Неизвестная ошибка'}`);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [loadStats]);

  // Функция обработки отправки формы статистики - оптимизирована с useCallback
  const handleStatsSubmit = useCallback((ratingId: string, heroId: string | null, statsType: string) => {
    loadStats(ratingId, heroId, statsType);
  }, [loadStats]);

  // Мемоизируем компоненты, чтобы избежать ненужных перерисовок
  const userProfileMemo = useMemo(() => {
    if (!user) return null;
    return <UserProfile user={user} />;
  }, [user]);

  const matchListMemo = useMemo(() => {
    if (!user?.matches) return null;
    return <MatchList matches={user.matches} />;
  }, [user?.matches]);

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
        
        {userProfileMemo}
        
        <div className={styles.statsSection}>
          <h2>Получить статистику героев</h2>
          <StatsSelector onSubmit={handleStatsSubmit} userId={user.id_} />
          <StatsDisplay 
            stats={statsResult} 
            loading={statsLoading} 
            error={statsError} 
          />
        </div>
        
        {matchListMemo}
      </div>
    </div>
  );
}; 