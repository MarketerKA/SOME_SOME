import React from 'react';
import { Link } from 'react-router-dom';
import styles from './HeroCard.module.scss';
import { getHeroIconUrl, getFallbackHeroIcon } from '../../utils/heroImages';

interface HeroCardProps {
  id: number;
  name: string;
  localized_name: string;
  icon: string;
  primary_attr: string;
}

export const HeroCard: React.FC<HeroCardProps> = ({ 
  id, 
  name, 
  localized_name, 
  icon, 
  primary_attr 
}) => {
  // Определение класса для атрибута героя
  const getAttributeClass = () => {
    switch (primary_attr) {
      case 'str': return styles.strength;
      case 'agi': return styles.agility;
      case 'int': return styles.intelligence;
      default: return styles.universal;
    }
  };
  
  return (
    <Link to={`/heroes/${id}`} className={styles.heroCard}>
      <div className={styles.heroIcon}>
        <img 
          src={getHeroIconUrl(icon)} 
          alt={localized_name} 
          onError={(e) => {
            (e.target as HTMLImageElement).src = getFallbackHeroIcon();
          }}
        />
        <div className={`${styles.attributeBadge} ${getAttributeClass()}`} />
      </div>
      <div className={styles.heroName}>{localized_name}</div>
    </Link>
  );
}; 