import React, { useState, useEffect, useCallback } from 'react';
import { getHeroIconUrl, getFallbackHeroIcon } from '../../utils/heroImages';
import { fetchHeroes, fetchAllHeroesStats, StatsType } from '../../api';
import { HeroDetail } from '../HeroDetail';
import styles from './HeroesTable.module.scss';

interface Hero {
  id: number;
  name: string;
  localized_name: string;
  primary_attr: string;
  img: string;
  icon: string;
}

interface HeroStats {
  hero_id: number;
  presence?: number;
  win_rate?: number;
  kda?: number;
  gpm?: number;
  xpm?: number;
}

interface EnhancedHero extends Hero {
  stats: {
    raw?: {
      presence?: number;
      win_rate?: number;
      kda?: number;
    };
    gpm?: number;
    xpm?: number;
  };
}

// Рейтинг по умолчанию
const DEFAULT_RATING_ID = "43";

// Функция для преобразования объекта статистики в удобный формат
const transformStatsObject = (statsObj: any): Record<number, any> => {
  if (!statsObj || typeof statsObj !== 'object') {
    console.error('Неверный формат данных статистики:', statsObj);
    return {};
  }
  
  // Проверяем, массив ли это или объект
  if (Array.isArray(statsObj)) {
    const result: Record<number, any> = {};
    statsObj.forEach(item => {
      if (item && typeof item.hero_id === 'number') {
        result[item.hero_id] = item;
      }
    });
    return result;
  }
  
  // Если это уже объект с id героев в качестве ключей
  return statsObj;
};

export const HeroesTable: React.FC = () => {
  const [heroes, setHeroes] = useState<EnhancedHero[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'ascending' | 'descending';
  }>({
    key: 'win_rate',
    direction: 'descending'
  });
  const [selectedHero, setSelectedHero] = useState<EnhancedHero | null>(null);

  // Функция загрузки героев и их статистики
  const loadHeroesWithStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Загружаем базовую информацию о героях
      const heroesResponse = await fetchHeroes();
      
      if (!heroesResponse || !heroesResponse.heroes || !Array.isArray(heroesResponse.heroes)) {
        throw new Error('Неверный формат данных о героях');
      }
      
      // Загружаем три типа статистики для указанного рейтинга
      const [rawStatsResponse, gpmStatsResponse, xpmStatsResponse] = await Promise.all([
        fetchAllHeroesStats(DEFAULT_RATING_ID, StatsType.Raw),
        fetchAllHeroesStats(DEFAULT_RATING_ID, StatsType.GPM),
        fetchAllHeroesStats(DEFAULT_RATING_ID, StatsType.XPM)
      ]);

      // Проверяем и преобразуем полученные данные в удобный формат
      const rawStats = transformStatsObject(rawStatsResponse);
      const gpmStats = transformStatsObject(gpmStatsResponse);
      const xpmStats = transformStatsObject(xpmStatsResponse);
      
      // Объединяем данные о героях со статистикой
      const enhancedHeroes: EnhancedHero[] = heroesResponse.heroes.map((hero: Hero) => {
        const heroRawStats = rawStats[hero.id] || {};
        
        return {
          ...hero,
          stats: {
            raw: typeof heroRawStats === 'object' 
              ? heroRawStats 
              : { win_rate: heroRawStats },
            gpm: typeof gpmStats[hero.id] === 'object' 
              ? gpmStats[hero.id]?.gpm 
              : gpmStats[hero.id],
            xpm: typeof xpmStats[hero.id] === 'object'
              ? xpmStats[hero.id]?.xpm
              : xpmStats[hero.id]
          }
        };
      });
      
      setHeroes(enhancedHeroes);
    } catch (err: any) {
      console.error('Ошибка при загрузке данных:', err);
      setError(`Не удалось загрузить данные: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  // Загрузка данных при монтировании компонента
  useEffect(() => {
    loadHeroesWithStats();
  }, [loadHeroesWithStats]);

  const sortedHeroes = useCallback(() => {
    const sorter = [...heroes];
    
    sorter.sort((a, b) => {
      let aValue, bValue;

      if (sortConfig.key === 'name') {
        aValue = a.localized_name.toLowerCase();
        bValue = b.localized_name.toLowerCase();
        return sortConfig.direction === 'ascending'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      if (sortConfig.key === 'win_rate') {
        aValue = typeof a.stats?.raw === 'object' && a.stats.raw.win_rate !== undefined
          ? a.stats.raw.win_rate
          : -1;
        bValue = typeof b.stats?.raw === 'object' && b.stats.raw.win_rate !== undefined
          ? b.stats.raw.win_rate
          : -1;
      }
      
      if (sortConfig.key === 'gpm') {
        aValue = a.stats?.gpm !== undefined ? a.stats.gpm : -1;
        bValue = b.stats?.gpm !== undefined ? b.stats.gpm : -1;
      }
      
      if (sortConfig.key === 'xpm') {
        aValue = a.stats?.xpm !== undefined ? a.stats.xpm : -1;
        bValue = b.stats?.xpm !== undefined ? b.stats.xpm : -1;
      }
      
      if (aValue < bValue) {
        return sortConfig.direction === 'ascending' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });
    
    return sorter;
  }, [heroes, sortConfig]);

  const handleSort = (key: string) => {
    let direction: 'ascending' | 'descending' = 'descending';
    if (sortConfig.key === key && sortConfig.direction === 'descending') {
      direction = 'ascending';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key: string) => {
    if (sortConfig.key !== key) {
      return <span className={styles.sortIcon}>⇅</span>;
    }
    return sortConfig.direction === 'ascending' 
      ? <span className={styles.sortIcon}>↑</span> 
      : <span className={styles.sortIcon}>↓</span>;
  };

  // Обработчик клика по герою
  const handleHeroClick = (hero: EnhancedHero) => {
    setSelectedHero(hero);
  };

  // Закрытие модального окна
  const handleCloseModal = () => {
    setSelectedHero(null);
  };

  // Рендер загрузки
  if (loading) {
    return (
      <div className={styles.heroesTable}>
        <div className={styles.loading}>Загрузка данных о героях...</div>
      </div>
    );
  }

  // Рендер ошибки
  if (error) {
    return (
      <div className={styles.heroesTable}>
        <div className={styles.error}>
          <p>{error}</p>
          <button onClick={loadHeroesWithStats}>Попробовать снова</button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.heroesTable}>
      <div className={styles.infoBar}>
        <div className={styles.statInfo}>
          <p>В таблице представлена интегрированная статистика по трем ключевым показателям:</p>
          <ul>
            <li><strong>Винрейт</strong> - процент побед</li>
            <li><strong>XPM</strong> - опыт в минуту</li>
            <li><strong>GPM</strong> - золото в минуту</li>
          </ul>
          <p>Нажмите на заголовок столбца для сортировки или на героя для просмотра детальной статистики</p>
        </div>
      </div>
      
      <div className={styles.heroTable}>
        <table>
          <thead>
            <tr>
              <th onClick={() => handleSort('name')}>
                Герой {getSortIcon('name')}
              </th>
              <th onClick={() => handleSort('win_rate')}>
                Винрейт {getSortIcon('win_rate')}
              </th>
              <th onClick={() => handleSort('gpm')}>
                GPM {getSortIcon('gpm')}
              </th>
              <th onClick={() => handleSort('xpm')}>
                XPM {getSortIcon('xpm')}
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedHeroes().map(hero => (
              <tr 
                key={hero.id} 
                className={styles.heroRow}
                onClick={() => handleHeroClick(hero)}
              >
                <td className={styles.heroCell}>
                  <div className={styles.heroInfo}>
                    <img
                      src={getHeroIconUrl(hero.icon)}
                      alt={hero.localized_name}
                      className={styles.heroIcon}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = getFallbackHeroIcon();
                      }}
                    />
                    <div className={styles.nameContainer}>
                      <span className={styles.heroName}>{hero.localized_name}</span>
                      <span className={styles[hero.primary_attr]}>
                        {hero.primary_attr === 'str' && 'Сила'}
                        {hero.primary_attr === 'agi' && 'Ловкость'}
                        {hero.primary_attr === 'int' && 'Интеллект'}
                        {hero.primary_attr === 'all' && 'Универсал'}
                      </span>
                    </div>
                  </div>
                </td>
                <td className={styles.statCell}>
                  {typeof hero.stats?.raw === 'object' && hero.stats.raw.win_rate !== undefined
                    ? `${(hero.stats.raw.win_rate * 100).toFixed(2)}%`
                    : typeof hero.stats?.raw === 'number'
                      ? `${(hero.stats.raw * 100).toFixed(2)}%`
                      : 'N/A'}
                </td>
                <td className={styles.statCell}>
                  {hero.stats?.gpm !== undefined && hero.stats.gpm !== null
                    ? hero.stats.gpm.toFixed(0)
                    : 'N/A'}
                </td>
                <td className={styles.statCell}>
                  {hero.stats?.xpm !== undefined && hero.stats.xpm !== null
                    ? hero.stats.xpm.toFixed(0) 
                    : 'N/A'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {selectedHero && (
        <HeroDetail 
          heroId={selectedHero.id}
          heroData={selectedHero}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}; 