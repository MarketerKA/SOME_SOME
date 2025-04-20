import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { UserProfile } from '../../components/UserProfile';
import { MatchList } from '../../components/MatchList';
import { HeroesTable } from '../../components/HeroesTable';
import { fetchUserProfile } from '../../api';
import { User } from '../../types';
import styles from './HomePage.module.scss';

type ActiveTab = 'matches' | 'heroes';

export const HomePage: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>('matches');

  // Загрузка данных при монтировании компонента
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Загружаем профиль пользователя
        const userData = await fetchUserProfile();
        setUser(userData);
      } catch (err: any) {
        console.error('Ошибка при загрузке данных:', err);
        setError(err.message || 'Не удалось загрузить данные');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  // Обработчик переключения вкладок
  const handleTabChange = (tab: ActiveTab) => {
    setActiveTab(tab);
  };

  // Мемоизируем компоненты
  const userProfileMemo = useMemo(() => {
    if (!user) return null;
    return <UserProfile user={user} />;
  }, [user]);

  const matchListMemo = useMemo(() => {
    if (!user?.matches) return null;
    return <MatchList matches={user.matches} />;
  }, [user?.matches]);

  // Рендер при загрузке
  if (loading) {
    return (
      <div className={styles.homePage}>
        <div className={styles.loader}>Загрузка данных...</div>
      </div>
    );
  }

  // Рендер при ошибке
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

  return (
    <div className={styles.homePage}>
      <div className={styles.container}>
        <header className={styles.header}>
          <h1>Статистика Dota 2</h1>
          <p>Общая информация, статистика героев и последние матчи</p>
        </header>
        
        <main className={styles.content}>
          {userProfileMemo}
          
          <div className={styles.tabsContainer}>
            <div className={styles.tabs}>
              <button 
                className={`${styles.tabButton} ${activeTab === 'matches' ? styles.active : ''}`}
                onClick={() => handleTabChange('matches')}
              >
                Последние матчи
              </button>
              <button 
                className={`${styles.tabButton} ${activeTab === 'heroes' ? styles.active : ''}`}
                onClick={() => handleTabChange('heroes')}
              >
                Герои
              </button>
            </div>
            
            <div className={styles.tabContent}>
              {activeTab === 'matches' ? (
                matchListMemo
              ) : (
                <HeroesTable />
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}; 