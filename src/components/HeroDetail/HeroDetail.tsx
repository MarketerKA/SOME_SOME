import React, { useState, useEffect, useCallback } from 'react';
import { getHeroIconUrl, getFallbackHeroIcon } from '../../utils/heroImages';
import { fetchAllHeroesStats, StatsType } from '../../api';
import styles from './HeroDetail.module.scss';

interface HeroProps {
  heroId: number;
  heroData: {
    id: number;
    name: string;
    localized_name: string;
    primary_attr: string;
    img: string;
    icon: string;
    stats?: {
      raw?: {
        presence?: number;
        win_rate?: number;
        kda?: number;
      };
      gpm?: number;
      xpm?: number;
    };
  };
  onClose: () => void;
}

// Функция для преобразования объекта статистики в удобный формат
const transformStatsObject = (statsObj: any, heroId: number): any => {
  if (!statsObj || typeof statsObj !== 'object') {
    console.error('Неверный формат данных статистики:', statsObj);
    return {};
  }
  
  // Проверяем, массив ли это или объект
  if (Array.isArray(statsObj)) {
    console.log(`Получены массив статистики, ищем героя с ID ${heroId}`);
    
    // Фильтруем статистику по hero_id для against и with
    if (statsObj.length > 0 && 'hero_id' in statsObj[0]) {
      return statsObj;
    }
    
    // Для остальных типов просто берем первый элемент если есть
    return statsObj;
  }
  
  // Если это уже объект, возможно с id героев в качестве ключей
  if (typeof statsObj === 'object' && statsObj !== null) {
    if (heroId in statsObj) {
      return statsObj[heroId];
    }
  }
  
  return {};
};

export const HeroDetail: React.FC<HeroProps> = ({ heroId, heroData, onClose }) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [againstStats, setAgainstStats] = useState<any[]>([]);
  const [withStats, setWithStats] = useState<any[]>([]);
  const [itemStats, setItemStats] = useState<any[]>([]);

  // Загрузка детальной статистики героя
  const loadHeroDetailedStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log(`Загрузка статистики для героя ID: ${heroId}`);
      
      // Загружаем все три типа статистики для героя
      const [rawAgainstStats, rawWithStats, rawItemStats] = await Promise.all([
        fetchAllHeroesStats("43", StatsType.Against),
        fetchAllHeroesStats("43", StatsType.With),
        fetchAllHeroesStats("43", StatsType.Item)
      ]);
      
      console.log("Статистика против получена:", rawAgainstStats ? 'да' : 'нет');
      console.log("Статистика с получена:", rawWithStats ? 'да' : 'нет');
      console.log("Статистика предметов получена:", rawItemStats ? 'да' : 'нет');
      
      // Фильтруем данные для конкретного героя
      if (Array.isArray(rawAgainstStats)) {
        // Для against нам нужны все герои, мы их отфильтруем внутри компонента
        setAgainstStats(rawAgainstStats);
      }
      
      if (Array.isArray(rawWithStats)) {
        // Для with нам нужны все герои, мы их отфильтруем внутри компонента
        setWithStats(rawWithStats);
      }
      
      if (Array.isArray(rawItemStats)) {
        // Для предметов фильтруем по hero_id
        const filteredItems = rawItemStats.filter(item => 
          item && typeof item.hero_id === 'number' && item.hero_id === heroId
        );
        setItemStats(filteredItems);
      }
    } catch (err: any) {
      console.error('Ошибка при загрузке детальной статистики:', err);
      setError(`Не удалось загрузить детальную статистику: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [heroId]);

  // Загрузка данных при монтировании компонента
  useEffect(() => {
    loadHeroDetailedStats();
  }, [loadHeroDetailedStats]);

  // Обработчик закрытия модального окна при клике на фон
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Определение атрибута героя для русского текста
  const getAttributeText = (attr: string) => {
    switch (attr) {
      case 'str': return 'Сила';
      case 'agi': return 'Ловкость';
      case 'int': return 'Интеллект';
      case 'all': return 'Универсал';
      default: return attr;
    }
  };

  // Получение отфильтрованной статистики against
  const filteredAgainstStats = againstStats
    .filter(stat => stat && typeof stat.hero_id === 'number' && stat.my_hero_id === heroId)
    .sort((a, b) => b.win_rate - a.win_rate);

  // Получение отфильтрованной статистики with
  const filteredWithStats = withStats
    .filter(stat => stat && typeof stat.hero_id === 'number' && stat.my_hero_id === heroId)
    .sort((a, b) => b.win_rate - a.win_rate);

  // Получение отфильтрованной статистики с предметами
  const filteredItemStats = itemStats
    .filter(stat => stat && typeof stat.hero_id === 'number' && stat.hero_id === heroId)
    .sort((a, b) => b.win_rate - a.win_rate);

  // Рендер индикатора загрузки
  if (loading) {
    return (
      <div className={styles.modalBackdrop} onClick={handleBackdropClick}>
        <div className={styles.modalContent}>
          <div className={styles.modalHeader}>
            <h2>{heroData.localized_name}</h2>
            <button className={styles.closeButton} onClick={onClose}>×</button>
          </div>
          <div className={styles.loading}>Загрузка детальной статистики...</div>
        </div>
      </div>
    );
  }

  // Рендер ошибки
  if (error) {
    return (
      <div className={styles.modalBackdrop} onClick={handleBackdropClick}>
        <div className={styles.modalContent}>
          <div className={styles.modalHeader}>
            <h2>{heroData.localized_name}</h2>
            <button className={styles.closeButton} onClick={onClose}>×</button>
          </div>
          <div className={styles.error}>
            <p>{error}</p>
            <button onClick={loadHeroDetailedStats}>Попробовать снова</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.modalBackdrop} onClick={handleBackdropClick}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2>{heroData.localized_name}</h2>
          <button className={styles.closeButton} onClick={onClose}>×</button>
        </div>
        
        <div className={styles.heroHeader}>
          <div className={styles.heroImage}>
            <img
              src={getHeroIconUrl(heroData.icon)}
              alt={heroData.localized_name}
              className={styles.heroIcon}
              onError={(e) => {
                (e.target as HTMLImageElement).src = getFallbackHeroIcon();
              }}
            />
          </div>
          <div className={styles.heroInfo}>
            <div className={styles.heroType}>
              <span className={styles[heroData.primary_attr]}>
                {getAttributeText(heroData.primary_attr)}
              </span>
            </div>
            <div className={styles.basicStats}>
              <div className={styles.statRow}>
                <div className={styles.statLabel}>Винрейт:</div>
                <div className={styles.statValue}>
                  {typeof heroData.stats?.raw === 'object' && heroData.stats.raw.win_rate !== undefined
                    ? `${(heroData.stats.raw.win_rate * 100).toFixed(2)}%`
                    : 'N/A'}
                </div>
              </div>
              <div className={styles.statRow}>
                <div className={styles.statLabel}>GPM:</div>
                <div className={styles.statValue}>
                  {heroData.stats?.gpm !== undefined ? heroData.stats.gpm.toFixed(0) : 'N/A'}
                </div>
              </div>
              <div className={styles.statRow}>
                <div className={styles.statLabel}>XPM:</div>
                <div className={styles.statValue}>
                  {heroData.stats?.xpm !== undefined ? heroData.stats.xpm.toFixed(0) : 'N/A'}
                </div>
              </div>
              {heroData.stats?.raw?.presence && (
                <div className={styles.statRow}>
                  <div className={styles.statLabel}>Присутствие:</div>
                  <div className={styles.statValue}>
                    {(heroData.stats.raw.presence * 100).toFixed(2)}%
                  </div>
                </div>
              )}
              {heroData.stats?.raw?.kda && (
                <div className={styles.statRow}>
                  <div className={styles.statLabel}>KDA:</div>
                  <div className={styles.statValue}>
                    {heroData.stats.raw.kda.toFixed(2)}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className={styles.detailedStats}>
          <div className={styles.statsTab}>
            <div className={styles.statsGroup}>
              <h3>Наиболее популярные предметы</h3>
              {filteredItemStats.length > 0 ? (
                <ul className={styles.itemsList}>
                  {filteredItemStats.slice(0, 5).map((item, index) => (
                    <li key={index} className={styles.itemRow}>
                      <span className={styles.itemName}>
                        {item.item_name || `Предмет ${item.item_id}`}
                      </span>
                      <span className={styles.itemValue}>
                        {item.win_rate ? `${(item.win_rate * 100).toFixed(2)}% винрейт` : ''}
                        {item.usage ? ` (${(item.usage * 100).toFixed(2)}% использование)` : ''}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className={styles.noData}>Нет данных о предметах</p>
              )}
            </div>
            
            <div className={styles.statsGroup}>
              <h3>Сильнее всего против</h3>
              {filteredAgainstStats.length > 0 ? (
                <ul className={styles.heroesList}>
                  {filteredAgainstStats.slice(0, 5).map((enemy, index) => (
                    <li key={index} className={styles.heroRow}>
                      <span className={styles.heroName}>
                        {enemy.localized_name || `Герой ${enemy.hero_id}`}
                      </span>
                      <span className={styles.winRate}>
                        {(enemy.win_rate * 100).toFixed(2)}% винрейт
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className={styles.noData}>Нет данных о противниках</p>
              )}
            </div>
            
            <div className={styles.statsGroup}>
              <h3>Лучшие союзники</h3>
              {filteredWithStats.length > 0 ? (
                <ul className={styles.heroesList}>
                  {filteredWithStats.slice(0, 5).map((ally, index) => (
                    <li key={index} className={styles.heroRow}>
                      <span className={styles.heroName}>
                        {ally.localized_name || `Герой ${ally.hero_id}`}
                      </span>
                      <span className={styles.winRate}>
                        {(ally.win_rate * 100).toFixed(2)}% винрейт
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className={styles.noData}>Нет данных о союзниках</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 