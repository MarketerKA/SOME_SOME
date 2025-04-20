import React, { useState } from 'react';
import styles from './StatsDisplay.module.scss';
import { getHeroIconUrl, getFallbackHeroIcon } from '../../utils/heroImages';

interface StatsDisplayProps {
  stats: any; // Используем any для обработки разных форматов данных
  loading: boolean;
  error: string | null;
}

export const StatsDisplay: React.FC<StatsDisplayProps> = ({ stats, loading, error }) => {
  // Добавляем состояние для пагинации
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const formatJson = (data: any): string => {
    try {
      // Если данные уже в JSON-формате, форматируем их
      if (typeof data === 'object') {
        return JSON.stringify(data, null, 2);
      }
      
      // Если это строка, пробуем распарсить JSON
      if (typeof data === 'string') {
        const obj = JSON.parse(data);
        return JSON.stringify(obj, null, 2);
      }
      
      // Для других типов просто преобразуем в строку
      return String(data);
    } catch (e) {
      // Если не удалось распарсить как JSON, возвращаем как есть
      console.error('Ошибка форматирования данных:', e);
      return String(data);
    }
  };

  // Функция для парсинга данных в объект, если они пришли в строковом формате
  const parseStatsData = (rawData: any): any => {
    if (!rawData) return null;
    
    try {
      if (typeof rawData === 'string') {
        return JSON.parse(rawData);
      }
      return rawData;
    } catch (e) {
      console.error('Ошибка парсинга данных статистики:', e);
      return null;
    }
  };

  // Получаем название героя по ID, если оно доступно
  const getHeroName = (item: any): string => {
    return item.localized_name || item.name || `Герой ${item.hero_id || ''}`;
  };

  // Функция для переключения страниц
  const handlePageChange = (page: number, totalPages: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Функция отображения красивой таблицы со статистикой героев в стиле скриншота
  const renderBeautifulTable = (data: any[]) => {
    if (!data || data.length === 0) {
      return <p className={styles.noData}>Нет данных о героях</p>;
    }

    // Определение максимальных значений для правильного масштабирования полосок
    const getMaxValue = (key: string) => {
      return Math.max(...data.map(item => parseFloat(item[key] || 0)));
    };

    const maxGpm = getMaxValue('gpm');
    const maxXpm = getMaxValue('xpm');
    const maxKda = getMaxValue('kda');
    
    // Ограничиваем количество отображаемых данных
    const totalPages = Math.ceil(data.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
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
                <tr key={item.hero_id || index}>
                  <td className={styles.heroCell}>
                    {/* Иконка героя, если доступна */}
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
                  
                  {/* Presence (Процент присутствия) */}
                  <td className={styles.statCell}>
                    <div className={styles.statValue}>
                      {(item.presence || item.pick_rate || 0).toFixed(2)}%
                    </div>
                    <div className={styles.barContainer}>
                      <div 
                        className={`${styles.progressBar} ${styles.redBar}`} 
                        style={{ width: `${item.presence || item.pick_rate || 0}%` }}
                      ></div>
                    </div>
                  </td>
                  
                  {/* Win Rate (Процент побед) */}
                  <td className={styles.statCell}>
                    <div className={styles.statValue}>
                      {(item.win_rate || item.win_percent || 0).toFixed(2)}%
                    </div>
                    <div className={styles.barContainer}>
                      <div 
                        className={`${styles.progressBar} ${styles.greenBar}`} 
                        style={{ width: `${item.win_rate || item.win_percent || 0}%` }}
                      ></div>
                    </div>
                  </td>
                  
                  {/* KDA Ratio */}
                  <td className={styles.statCell}>
                    <div className={styles.statValue}>
                      {(item.kda || (item.kills + item.assists) / Math.max(1, item.deaths) || 0).toFixed(2)}
                    </div>
                    <div className={styles.barContainer}>
                      <div 
                        className={`${styles.progressBar} ${styles.orangeBar}`} 
                        style={{ 
                          width: `${Math.min(100, (item.kda || 0) / maxKda * 100)}%` 
                        }}
                      ></div>
                    </div>
                  </td>
                  
                  {/* GPM (Gold Per Minute) */}
                  <td className={styles.statCell}>
                    <div className={styles.statValue}>
                      {Math.round(item.gpm || 0)}
                    </div>
                    <div className={styles.barContainer}>
                      <div 
                        className={`${styles.progressBar} ${styles.goldBar}`} 
                        style={{ 
                          width: `${Math.min(100, (item.gpm || 0) / maxGpm * 100)}%` 
                        }}
                      ></div>
                    </div>
                  </td>
                  
                  {/* XPM (Experience Per Minute) */}
                  <td className={styles.statCell}>
                    <div className={styles.statValue}>
                      {Math.round(item.xpm || 0)}
                    </div>
                    <div className={styles.barContainer}>
                      <div 
                        className={`${styles.progressBar} ${styles.cyanBar}`} 
                        style={{ 
                          width: `${Math.min(100, (item.xpm || 0) / maxXpm * 100)}%` 
                        }}
                      ></div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Пагинация */}
        {totalPages > 1 && (
          <div className={styles.pagination}>
            <button 
              className={`${styles.pageButton} ${currentPage === 1 ? styles.disabled : ''}`}
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
              className={`${styles.pageButton} ${currentPage === totalPages ? styles.disabled : ''}`}
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

  const renderStats = () => {
    // Проверяем, есть ли данные для отображения
    if (!stats) {
      return <p className={styles.noData}>Нет данных для отображения</p>;
    }

    try {
      // Парсим данные, если они пришли в строковом формате
      const parsedData = parseStatsData(stats);
      
      // Проверка на наличие данных в объекте статистики
      if (!parsedData || (typeof parsedData === 'object' && Object.keys(parsedData).length === 0)) {
        return <p className={styles.noData}>Статистика пуста</p>;
      }

      // Проверка на наличие ошибки в данных
      if (typeof parsedData === 'object' && 'error' in parsedData) {
        return <p className={styles.error}>Ошибка: {parsedData.error}</p>;
      }

      // Если данные - массив, отображаем в виде красивой таблицы
      if (Array.isArray(parsedData)) {
        return renderBeautifulTable(parsedData);
      }

      // В остальных случаях отображаем форматированный JSON
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

  return (
    <div className={styles.statsDisplay}>
      <h2>Результаты статистики</h2>
      <div className={styles.statsContent}>
        {renderStats()}
      </div>
    </div>
  );
}; 