import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { UserProfile } from '../../components/UserProfile';
import { MatchList } from '../../components/MatchList';
import { StatsDisplay, StatsType } from '../../components/StatsDisplay/StatsDisplay';
import { fetchUserProfile, fetchAllHeroesStats, StatsType as ApiStatsType } from '../../api';
import { getHeroIconUrl, getFallbackHeroIcon } from '../../utils/heroImages';
import { DEFAULT_RATING_ID, ROUTES } from '../../utils/constants';
import { User, HeroStats, CombinedHeroStats } from '../../types';
import styles from './HomePage.module.scss';
import { useNavigate } from 'react-router-dom';

export const HomePage: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Состояния для разных типов статистики
  const [rawStats, setRawStats] = useState<HeroStats[]>([]);
  const [xpmStats, setXpmStats] = useState<HeroStats[]>([]);
  const [gpmStats, setGpmStats] = useState<HeroStats[]>([]);
  const [combinedStats, setCombinedStats] = useState<CombinedHeroStats[]>([]);
  
  const [statsLoading, setStatsLoading] = useState<boolean>(false);
  const [statsError, setStatsError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Загрузка всех трех типов статистики
  const loadAllStats = useCallback(async (ratingId: string) => {
    setStatsLoading(true);
    setStatsError(null);
    
    try {
      // Параллельная загрузка всех трех типов статистики
      const [rawData, xpmData, gpmData] = await Promise.all([
        fetchAllHeroesStats(ratingId, ApiStatsType.Raw),
        fetchAllHeroesStats(ratingId, ApiStatsType.XPM),
        fetchAllHeroesStats(ratingId, ApiStatsType.GPM)
      ]);
      
      console.log(`Получены данные: raw (${rawData.length}), xpm (${xpmData.length}), gpm (${gpmData.length})`);
      
      // Сохраняем каждый тип статистики в своём состоянии
      setRawStats(rawData);
      setXpmStats(xpmData);
      setGpmStats(gpmData);
      
      // Объединяем данные в один массив для отображения
      const combined = rawData.map(hero => {
        // Находим соответствующие XPM и GPM данные для этого героя
        const xpmHero = xpmData.find(h => h.hero_id === hero.hero_id);
        const gpmHero = gpmData.find(h => h.hero_id === hero.hero_id);
        
        // Создаём объединённую статистику
        return {
          hero_id: hero.hero_id,
          localized_name: hero.localized_name,
          name: hero.name,
          icon: hero.icon,
          raw: {
            presence: hero.presence,
            win_rate: hero.win_rate,
            kda: hero.kda
          },
          xpm: xpmHero?.xpm,
          gpm: gpmHero?.gpm
        };
      });
      
      setCombinedStats(combined);
    } catch (err: any) {
      console.error('Ошибка при загрузке статистики:', err);
      setStatsError(err.message || 'Не удалось загрузить статистику');
    } finally {
      setStatsLoading(false);
    }
  }, []);

  // Обработчик клика по карточке героя
  const handleHeroSelect = useCallback((heroId: number) => {
    navigate(ROUTES.HERO_BY_ID(heroId));
  }, [navigate]);

  // Загрузка данных при монтировании компонента
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Загружаем профиль пользователя
        const userData = await fetchUserProfile();
        setUser(userData);
        
        // Загружаем все типы статистики
        await loadAllStats(DEFAULT_RATING_ID);
      } catch (err: any) {
        console.error('Ошибка при загрузке данных:', err);
        setError(err.message || 'Не удалось загрузить данные');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [loadAllStats]);

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
          <p>Объединенная статистика героев (Raw, XPM, GPM) для рейтинга {DEFAULT_RATING_ID}</p>
        </header>
        
        <main className={styles.content}>
          {userProfileMemo}
          
          {/* Таблица с объединенной статистикой */}
          <div className={styles.combinedStatsSection}>
            <h2>Статистика героев</h2>
            {statsLoading ? (
              <div className={styles.loading}>Загрузка статистики...</div>
            ) : statsError ? (
              <div className={styles.error}>{statsError}</div>
            ) : (
              <>
                <div className={styles.statsDescription}>
                  <p>Ниже представлена объединенная статистика по трем показателям:</p>
                  <ul>
                    <li><strong>Raw</strong> - базовая статистика (присутствие, винрейт, KDA)</li>
                    <li><strong>XPM</strong> - опыт в минуту</li>
                    <li><strong>GPM</strong> - золото в минуту</li>
                  </ul>
                </div>
                
                <div className={styles.heroGrid}>
                  {combinedStats.map(hero => (
                    <div 
                      key={hero.hero_id} 
                      className={styles.heroCard}
                      onClick={() => handleHeroSelect(hero.hero_id)}
                    >
                      <div className={styles.heroHeader}>
                        {hero.icon && (
                          <img
                            src={getHeroIconUrl(hero.icon)}
                            alt={hero.localized_name || `Герой ${hero.hero_id}`}
                            className={styles.heroIcon}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = getFallbackHeroIcon();
                            }}
                          />
                        )}
                        <h3>{hero.localized_name || `Герой ${hero.hero_id}`}</h3>
                      </div>
                      <div className={styles.heroStats}>
                        <div className={styles.statGroup}>
                          <h4>Raw</h4>
                          <div className={styles.statItem}>
                            <span className={styles.statLabel}>Присутствие:</span>
                            <span className={styles.statValue}>{hero.raw?.presence.toFixed(2)}%</span>
                          </div>
                          <div className={styles.statItem}>
                            <span className={styles.statLabel}>Винрейт:</span>
                            <span className={styles.statValue}>{hero.raw?.win_rate.toFixed(2)}%</span>
                          </div>
                          <div className={styles.statItem}>
                            <span className={styles.statLabel}>KDA:</span>
                            <span className={styles.statValue}>{hero.raw?.kda.toFixed(2)}</span>
                          </div>
                        </div>
                        <div className={styles.statGroup}>
                          <h4>XPM/GPM</h4>
                          <div className={styles.statItem}>
                            <span className={styles.statLabel}>XPM:</span>
                            <span className={styles.statValue}>{hero.xpm?.toFixed(0) || 'N/A'}</span>
                          </div>
                          <div className={styles.statItem}>
                            <span className={styles.statLabel}>GPM:</span>
                            <span className={styles.statValue}>{hero.gpm?.toFixed(0) || 'N/A'}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
          
          {matchListMemo}
        </main>
      </div>
    </div>
  );
}; 