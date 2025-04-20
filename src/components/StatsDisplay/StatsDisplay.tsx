import React, { useState, ReactElement, useEffect, useCallback, useMemo } from 'react';
import styles from './StatsDisplay.module.scss';
import { getHeroIconUrl, getFallbackHeroIcon } from '../../utils/heroImages';
import cx from 'classnames';
import { fetchAllHeroesStats } from '../../api';
import { STATS_TYPE, DEFAULT_RATING_ID } from '../../utils/constants';

// Константы
const ITEMS_PER_PAGE = 10;

// Типы статистики
export enum StatsType {
  Raw = 'raw',
  XPM = 'xpm',
  GPM = 'gpm',
  HERO_STATS = 'hero_stats'
}

// Типы данных
export interface HeroStatItem {
  hero_id?: number;
  heroId: number;
  id?: number;
  icon?: string;
  localized_name?: string;
  localizedName?: string;
  name?: string;
  heroName?: string;
  presence?: number;
  pick_rate?: number;
  win_rate?: number;
  winRate: number;
  win_percent?: number;
  matches: number;
  wins: number;
  kda: number;
  kills: number;
  deaths: number;
  assists: number;
  gpm: number;
  xpm: number;
}

// Интерфейс для детальной статистики героя
interface HeroDetailsStats {
  heroId: number;
  heroName: string;
  matches: number;
  wins: number;
  losses: number;
  winRate: number;
  kda: {
    kills: number;
    deaths: number;
    assists: number;
    ratio: number;
  };
  averages: {
    gpm: number;
    xpm: number;
    lastHits: number;
    denies: number;
    heroDamage: number;
    towerDamage: number;
    duration: number;
  };
  itemUsage: Array<{
    itemId: number;
    itemName: string;
    count: number;
    winRate: number;
  }>;
}

export interface StatsDisplayProps {
  stats?: unknown;
  loading?: boolean;
  error?: string | null;
  initialStatsType?: StatsType;
  ratingId?: string;
  onHeroSelect?: (heroId: number) => void;
}

// Типы статистических столбцов
enum StatColumnType {
  Presence = 'presence',
  WinRate = 'win_rate',
  KDA = 'kda',
  GPM = 'gpm',
  XPM = 'xpm'
}

// Цвета для графиков
enum BarColor {
  Red = 'redBar',
  Green = 'greenBar',
  Orange = 'orangeBar',
  Gold = 'goldBar',
  Cyan = 'cyanBar'
}

// Добавляем функцию formatDuration
const formatDuration = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
};

// Функция для парсинга данных статистики
export const parseStatsData = (stats: any): HeroStatItem[] => {
  if (!stats) return [];
  
  try {
    // Если stats уже является массивом объектов с нужными полями
    if (Array.isArray(stats) && stats.length > 0 && 'hero_id' in stats[0]) {
      return stats.map(item => ({
        heroId: item.hero_id || 0,
        hero_id: item.hero_id,
        id: item.id,
        icon: item.icon,
        localizedName: item.localized_name,
        localized_name: item.localized_name,
        heroName: item.name || '',
        name: item.name || '',
        matches: item.matches || 0,
        wins: item.wins || 0,
        presence: item.presence || item.pick_rate || 0,
        winRate: item.win_rate || item.win_percent || 0,
        win_rate: item.win_rate || item.win_percent || 0,
        kda: item.kda || 0,
        kills: item.kills || 0,
        deaths: item.deaths || 0, 
        assists: item.assists || 0,
        gpm: item.gpm || 0,
        xpm: item.xpm || 0
      }));
    }
    
    // Если stats - это объект с вложенными данными
    if (typeof stats === 'object' && stats !== null) {
      // Попытка найти массив данных в объекте
      for (const key in stats) {
        if (Array.isArray(stats[key]) && stats[key].length > 0) {
          return parseStatsData(stats[key]);
        }
      }
    }
    
    // Если формат данных неизвестен, возвращаем пустой массив
    console.error('Неизвестный формат данных:', stats);
    return [];
  } catch (error) {
    console.error('Ошибка при обработке данных статистики:', error);
    return [];
  }
};

// Компонент для отображения детальной статистики героя
const HeroStats: React.FC<{
  heroId: number;
  stats: any;
  onClose: () => void;
}> = ({ heroId, stats, onClose }) => {
  const [heroDetails, setHeroDetails] = useState<HeroDetailsStats | null>(null);
  const [loadingDetails, setLoadingDetails] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Имитация загрузки данных о герое
    const fetchHeroDetails = async () => {
      try {
        setLoadingDetails(true);
        // В реальном приложении здесь будет API запрос
        // Создаем демо-данные на основе имеющейся статистики
        const parsedStats = parseStatsData(stats);
        const heroData = parsedStats.find(hero => hero.heroId === heroId);
        
        if (!heroData) {
          throw new Error('Данные о герое не найдены');
        }
        
        // Создаем расширенные данные о герое
        setTimeout(() => {
          const wins = heroData.wins || 0;
          const matches = heroData.matches || 0;
          const losses = matches - wins;
          
          const detailedStats: HeroDetailsStats = {
            heroId: heroData.heroId,
            heroName: heroData.name,
            matches: matches,
            wins: wins,
            losses: losses,
            winRate: heroData.winRate,
            kda: {
              kills: heroData.kills || 0,
              deaths: heroData.deaths || 0,
              assists: heroData.assists || 0,
              ratio: heroData.kda || 0,
            },
            averages: {
              gpm: heroData.gpm || 0,
              xpm: heroData.xpm || 0,
              lastHits: Math.round(Math.random() * 300 + 200),
              denies: Math.round(Math.random() * 50 + 10),
              heroDamage: Math.round(Math.random() * 20000 + 10000),
              towerDamage: Math.round(Math.random() * 5000 + 1000),
              duration: Math.round(Math.random() * 1500 + 1200),
            },
            itemUsage: Array(5).fill(0).map((_, i) => ({
              itemId: 100 + i,
              itemName: `Предмет ${i + 1}`,
              count: Math.round(Math.random() * matches),
              winRate: Math.round(Math.random() * 100),
            })),
          };
          
          setHeroDetails(detailedStats);
          setLoadingDetails(false);
        }, 500);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ошибка при загрузке данных');
        setLoadingDetails(false);
      }
    };

    fetchHeroDetails();
  }, [heroId, stats]);

  if (loadingDetails) {
    return (
      <div className={styles.heroStatsContainer}>
        <div className={styles.heroStatsHeader}>
          <h3>Загрузка статистики героя...</h3>
          <button className={styles.closeButton} onClick={onClose}>×</button>
        </div>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
        </div>
      </div>
    );
  }

  if (error || !heroDetails) {
    return (
      <div className={styles.heroStatsContainer}>
        <div className={styles.heroStatsHeader}>
          <h3>Ошибка</h3>
          <button className={styles.closeButton} onClick={onClose}>×</button>
        </div>
        <div className={styles.error}>
          {error || 'Данные о герое не найдены'}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.heroStatsContainer}>
      <div className={styles.heroStatsHeader}>
        <h3>{heroDetails.heroName} - Детальная статистика</h3>
        <button className={styles.closeButton} onClick={onClose}>×</button>
      </div>
      
      <div className={styles.heroStatsSummary}>
        <div className={styles.statsBlock}>
          <h4>Общая информация</h4>
          <table>
            <tbody>
              <tr>
                <td>Матчей:</td>
                <td>{heroDetails.matches}</td>
              </tr>
              <tr>
                <td>Победы:</td>
                <td>{heroDetails.wins}</td>
              </tr>
              <tr>
                <td>Поражения:</td>
                <td>{heroDetails.losses}</td>
              </tr>
              <tr>
                <td>Процент побед:</td>
                <td>{heroDetails.winRate.toFixed(2)}%</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div className={styles.statsBlock}>
          <h4>KDA</h4>
          <table>
            <tbody>
              <tr>
                <td>Убийства:</td>
                <td>{heroDetails.kda.kills.toFixed(1)}</td>
              </tr>
              <tr>
                <td>Смерти:</td>
                <td>{heroDetails.kda.deaths.toFixed(1)}</td>
              </tr>
              <tr>
                <td>Помощь:</td>
                <td>{heroDetails.kda.assists.toFixed(1)}</td>
              </tr>
              <tr>
                <td>KDA отношение:</td>
                <td>{heroDetails.kda.ratio.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div className={styles.statsBlock}>
          <h4>Средние показатели</h4>
          <table>
            <tbody>
              <tr>
                <td>GPM:</td>
                <td>{heroDetails.averages.gpm.toFixed(0)}</td>
              </tr>
              <tr>
                <td>XPM:</td>
                <td>{heroDetails.averages.xpm.toFixed(0)}</td>
              </tr>
              <tr>
                <td>Last Hits:</td>
                <td>{heroDetails.averages.lastHits}</td>
              </tr>
              <tr>
                <td>Denies:</td>
                <td>{heroDetails.averages.denies}</td>
              </tr>
              <tr>
                <td>Урон по героям:</td>
                <td>{heroDetails.averages.heroDamage}</td>
              </tr>
              <tr>
                <td>Урон по строениям:</td>
                <td>{heroDetails.averages.towerDamage}</td>
              </tr>
              <tr>
                <td>Средняя длительность:</td>
                <td>{formatDuration(heroDetails.averages.duration)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      <div className={styles.itemsUsage}>
        <h4>Самые популярные предметы</h4>
        <table>
          <thead>
            <tr>
              <th>Предмет</th>
              <th>Использований</th>
              <th>Процент побед</th>
            </tr>
          </thead>
          <tbody>
            {heroDetails.itemUsage.map(item => (
              <tr key={item.itemId}>
                <td>{item.itemName}</td>
                <td>{item.count}</td>
                <td>{item.winRate}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export const StatsDisplay: React.FC<StatsDisplayProps> = ({ 
  stats: externalStats, 
  loading: externalLoading, 
  error: externalError,
  initialStatsType = StatsType.Raw,
  ratingId = DEFAULT_RATING_ID,
  onHeroSelect
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [statsType, setStatsType] = useState<StatsType>(initialStatsType);
  const [currentStats, setCurrentStats] = useState<unknown>(externalStats);
  const [currentLoading, setCurrentLoading] = useState<boolean>(externalLoading || false);
  const [currentError, setCurrentError] = useState<string | null>(externalError || null);
  const [selectedHero, setSelectedHero] = useState<number | null>(null);
  const [showHeroStats, setShowHeroStats] = useState<boolean>(false);
  
  // Загрузка данных, если они не переданы снаружи
  const loadStats = useCallback(async (type: StatsType) => {
    if (externalStats !== undefined) return;
    
    setCurrentLoading(true);
    setCurrentError(null);
    try {
      const data = await fetchAllHeroesStats(ratingId, type);
      setCurrentStats(data);
    } catch (err: any) {
      setCurrentError(err.message || 'Не удалось загрузить статистику');
    } finally {
      setCurrentLoading(false);
    }
  }, [externalStats, ratingId]);

  // Загрузка данных при первом рендере или изменении типа статистики
  useEffect(() => {
    if (statsType) {
      loadStats(statsType);
    }
  }, [statsType, loadStats]);

  // Обработчик изменения типа статистики
  const handleStatsTypeChange = (type: StatsType) => {
    setStatsType(type);
    setCurrentPage(1); // Сбрасываем на первую страницу при смене статистики
  };

  // Получение имени героя
  const getHeroName = (item: HeroStatItem): string => {
    return item.localized_name || item.name || `Герой ${item.hero_id || ''}`;
  };

  // Функция для переключения страниц
  const handlePageChange = (page: number, totalPages: number): void => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Обработчик клика по герою
  const handleHeroClick = (heroId: number) => {
    setSelectedHero(heroId);
    setShowHeroStats(true);
    if (onHeroSelect) {
      onHeroSelect(heroId);
    }
  };
  
  const closeHeroStats = () => {
    setShowHeroStats(false);
  };

  // Вычисление максимального значения для статистики
  const getMaxValue = (data: HeroStatItem[], key: string): number => {
    return Math.max(...data.map(item => parseFloat(String(item[key as keyof HeroStatItem] || 0))));
  };

  // Рендер статистической ячейки
  const renderStatCell = (
    item: HeroStatItem, 
    statKey: StatColumnType, 
    maxValue: number,
    barColor: BarColor, 
    isPercentage = false,
    alternativeKey?: string
  ): ReactElement => {
    const value = item[statKey] || item[alternativeKey as keyof HeroStatItem] || 0;
    const displayValue = isPercentage 
      ? `${Number(value).toFixed(2)}%` 
      : statKey === StatColumnType.KDA 
        ? Number(value).toFixed(2) 
        : Math.round(Number(value));
        
    const percentage = isPercentage 
      ? Number(value) 
      : Math.min(100, (Number(value) / maxValue) * 100);

    return (
      <td className={styles.statCell}>
        <div className={styles.statValue}>
          {displayValue}
        </div>
        <div className={styles.barContainer}>
          <div 
            className={cx(styles.progressBar, styles[barColor])} 
            style={{ width: `${percentage}%` }}
          />
        </div>
      </td>
    );
  };

  // Рендер таблицы статистики
  const renderStatsTable = (data: HeroStatItem[]): ReactElement | null => {
    if (!data || data.length === 0) {
      return <p className={styles.noData}>Нет данных о героях</p>;
    }

    const maxGpm = getMaxValue(data, StatColumnType.GPM);
    const maxXpm = getMaxValue(data, StatColumnType.XPM);
    const maxKda = getMaxValue(data, StatColumnType.KDA);
    
    const totalPages = Math.ceil(data.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const currentItems = data.slice(startIndex, endIndex);
    
    return (
      <>
        <div className={styles.heroStatsTable}>
          <table>
            <thead>
              <tr>
                <th className={styles.heroColumn}>Hero</th>
                <th className={styles.statColumn}>
                  Presence <i className={styles.sortIcon}>▼</i>
                </th>
                <th className={styles.statColumn}>Win Rate</th>
                <th className={styles.statColumn}>KDA Ratio</th>
                <th className={styles.statColumn}>GPM</th>
                <th className={styles.statColumn}>XPM</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((item, index) => (
                <tr 
                  key={item.hero_id || index}
                  onClick={() => handleHeroClick(item.hero_id || 0)}
                  className={styles.heroRow}
                >
                  <td className={styles.heroCell}>
                    {item.icon && (
                      <img 
                        src={getHeroIconUrl(item.icon)} 
                        alt={getHeroName(item)} 
                        className={styles.heroIcon} 
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = getFallbackHeroIcon();
                        }}
                      />
                    )}
                    <span className={styles.heroName}>{getHeroName(item)}</span>
                  </td>
                  
                  {renderStatCell(item, StatColumnType.Presence, 100, BarColor.Red, true, 'pick_rate')}
                  {renderStatCell(item, StatColumnType.WinRate, 100, BarColor.Green, true, 'win_percent')}
                  {renderStatCell(item, StatColumnType.KDA, maxKda, BarColor.Orange)}
                  {renderStatCell(item, StatColumnType.GPM, maxGpm, BarColor.Gold)}
                  {renderStatCell(item, StatColumnType.XPM, maxXpm, BarColor.Cyan)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {totalPages > 1 && (
          <div className={styles.pagination}>
            <button 
              className={cx(styles.pageButton, { [styles.disabled]: currentPage === 1 })}
              onClick={() => handlePageChange(currentPage - 1, totalPages)}
              disabled={currentPage === 1}
            >
              &lt;
            </button>
            
            <div className={styles.pageInfo}>
              {currentPage} из {totalPages}
              <span className={styles.totalItems}>
                (всего {data.length})
              </span>
            </div>
            
            <button 
              className={cx(styles.pageButton, { [styles.disabled]: currentPage === totalPages })}
              onClick={() => handlePageChange(currentPage + 1, totalPages)}
              disabled={currentPage === totalPages}
            >
              &gt;
            </button>
          </div>
        )}
      </>
    );
  };

  // Форматирование JSON
  const formatJson = (data: unknown): string => {
    try {
      if (typeof data === 'object') {
        return JSON.stringify(data, null, 2);
      }
      
      if (typeof data === 'string') {
        const obj = JSON.parse(data);
        return JSON.stringify(obj, null, 2);
      }
      
      return String(data);
    } catch (e) {
      return String(data);
    }
  };

  // Основная функция рендеринга статистики
  const renderStats = (): ReactElement => {
    if (!currentStats) {
      return <p className={styles.noData}>Нет данных для отображения</p>;
    }

    try {
      const parsedData = parseStatsData(currentStats);
      
      if (!parsedData || (typeof parsedData === 'object' && Object.keys(parsedData as object).length === 0)) {
        return <p className={styles.noData}>Статистика пуста</p>;
      }

      if (typeof parsedData === 'object' && 'error' in (parsedData as any)) {
        return <p className={styles.error}>Ошибка: {(parsedData as any).error}</p>;
      }

      if (Array.isArray(parsedData)) {
        return renderStatsTable(parsedData as HeroStatItem[]) || <p className={styles.noData}>Нет данных для отображения</p>;
      }

      return (
        <div className={styles.jsonContainer}>
          <pre>{formatJson(parsedData)}</pre>
        </div>
      );
    } catch (e) {
      console.error('Ошибка отображения статистики:', e);
      return <p className={styles.error}>Ошибка отображения данных</p>;
    }
  };

  // Состояния загрузки и ошибок
  if (currentLoading) {
    return (
      <div className={styles.statsDisplay}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Загрузка статистики...</p>
        </div>
      </div>
    );
  }

  if (currentError) {
    return (
      <div className={styles.statsDisplay}>
        <div className={styles.error}>
          <p>Ошибка: {currentError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.statsDisplay}>
      {showHeroStats && selectedHero !== null && (
        <div className={styles.heroStatsModal} onClick={closeHeroStats}>
          <div onClick={(e) => e.stopPropagation()}>
            <HeroStats 
              heroId={selectedHero} 
              stats={currentStats} 
              onClose={closeHeroStats} 
            />
          </div>
        </div>
      )}
      
      <div className={styles.header}>
        <h2>Результаты статистики</h2>
        <div className={styles.statsTypeTabs}>
          <button 
            className={cx(styles.statsTypeTab, { [styles.active]: statsType === StatsType.Raw })}
            onClick={() => handleStatsTypeChange(StatsType.Raw)}
          >
            Общая статистика
          </button>
          <button 
            className={cx(styles.statsTypeTab, { [styles.active]: statsType === StatsType.XPM })}
            onClick={() => handleStatsTypeChange(StatsType.XPM)}
          >
            XPM
          </button>
          <button 
            className={cx(styles.statsTypeTab, { [styles.active]: statsType === StatsType.GPM })}
            onClick={() => handleStatsTypeChange(StatsType.GPM)}
          >
            GPM
          </button>
        </div>
      </div>
      <div className={styles.statsContent}>
        {renderStats()}
      </div>
    </div>
  );
}; 