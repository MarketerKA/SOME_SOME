import React, { useState, useMemo } from 'react';
import { HeroCard } from '../HeroCard';
import styles from './HeroGrid.module.scss';

interface Hero {
  id: number;
  name: string;
  localized_name: string;
  primary_attr: string;
  icon: string;
}

interface HeroGridProps {
  heroes: Hero[];
  loading?: boolean;
  error?: string | null;
}

export const HeroGrid: React.FC<HeroGridProps> = ({ heroes, loading, error }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [attributeFilter, setAttributeFilter] = useState('all');
  
  // Фильтрация героев по имени и атрибуту
  const filteredHeroes = useMemo(() => {
    if (!heroes || heroes.length === 0) return [];
    
    return heroes.filter(hero => {
      const nameMatch = hero.localized_name.toLowerCase().includes(searchTerm.toLowerCase());
      const attrMatch = attributeFilter === 'all' || hero.primary_attr === attributeFilter;
      return nameMatch && attrMatch;
    });
  }, [heroes, searchTerm, attributeFilter]);
  
  if (loading) {
    return <div className={styles.loading}>Загрузка героев...</div>;
  }
  
  if (error) {
    return <div className={styles.error}>{error}</div>;
  }
  
  if (!heroes || heroes.length === 0) {
    return <div className={styles.empty}>Список героев пуст</div>;
  }
  
  return (
    <div className={styles.heroGridContainer}>
      <div className={styles.filters}>
        <div className={styles.searchContainer}>
          <input
            type="text"
            placeholder="Поиск героя..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>
        
        <div className={styles.attributeFilters}>
          <button
            className={`${styles.filterButton} ${attributeFilter === 'all' ? styles.active : ''}`}
            onClick={() => setAttributeFilter('all')}
          >
            Все
          </button>
          <button
            className={`${styles.filterButton} ${styles.strengthFilter} ${attributeFilter === 'str' ? styles.active : ''}`}
            onClick={() => setAttributeFilter('str')}
          >
            Сила
          </button>
          <button
            className={`${styles.filterButton} ${styles.agilityFilter} ${attributeFilter === 'agi' ? styles.active : ''}`}
            onClick={() => setAttributeFilter('agi')}
          >
            Ловкость
          </button>
          <button
            className={`${styles.filterButton} ${styles.intelligenceFilter} ${attributeFilter === 'int' ? styles.active : ''}`}
            onClick={() => setAttributeFilter('int')}
          >
            Интеллект
          </button>
        </div>
      </div>
      
      <div className={styles.heroCount}>
        Найдено героев: {filteredHeroes.length}
      </div>
      
      <div className={styles.heroGrid}>
        {filteredHeroes.map(hero => (
          <HeroCard
            key={hero.id}
            id={hero.id}
            name={hero.name}
            localized_name={hero.localized_name}
            icon={hero.icon}
            primary_attr={hero.primary_attr}
          />
        ))}
      </div>
      
      {filteredHeroes.length === 0 && (
        <div className={styles.noResults}>
          Герои не найдены. Попробуйте изменить параметры поиска.
        </div>
      )}
    </div>
  );
}; 