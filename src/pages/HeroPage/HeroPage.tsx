import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { HeroStats } from '../../components/HeroStats';
import { fetchHeroes } from '../../api';
import { getHeroImageUrl, getHeroIconUrl, getFallbackHeroImage, getFallbackHeroIcon } from '../../utils/heroImages';
import styles from './HeroPage.module.scss';

interface RouteParams {
  heroId: string;
  [key: string]: string | undefined;
}

interface Hero {
  id: number;
  name: string;
  localized_name: string;
  primary_attr: string;
  img: string;
  icon: string;
}

export const HeroPage: React.FC = () => {
  const { heroId } = useParams<RouteParams>();
  const navigate = useNavigate();
  const [hero, setHero] = useState<Hero | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [ratingId, setRatingId] = useState<string>('11');

  // Список допустимых значений rating_id
  const RATING_VALUES = [
    "11", "12", "13", "14", "15", 
    "21", "22", "23", "24", "25", 
    "31", "32", "33", "34", "35", 
    "41", "42", "43", "44", "45", 
    "51", "52", "53", "54", "55", 
    "61", "62", "63", "64", "65", 
    "71", "72", "73", "74", "75", 
    "81"
  ];

  // Загрузка информации о герое
  useEffect(() => {
    const loadHeroData = async () => {
      if (!heroId) {
        navigate('/');
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const heroesData = await fetchHeroes();
        
        // Поиск героя по ID
        const foundHero = heroesData.heroes.find(h => h.id === parseInt(heroId, 10));
        
        if (!foundHero) {
          throw new Error(`Герой с ID ${heroId} не найден`);
        }
        
        setHero(foundHero);
      } catch (err: any) {
        console.error('Ошибка при загрузке данных героя:', err);
        setError(`Не удалось загрузить информацию о герое: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    loadHeroData();
  }, [heroId, navigate]);

  if (loading) {
    return (
      <div className={styles.heroPage}>
        <div className={styles.loading}>Загрузка информации о герое...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.heroPage}>
        <div className={styles.error}>
          <p>{error}</p>
          <button onClick={() => navigate('/')}>Вернуться на главную</button>
        </div>
      </div>
    );
  }

  if (!hero) {
    return (
      <div className={styles.heroPage}>
        <div className={styles.error}>
          <p>Информация о герое не найдена</p>
          <button onClick={() => navigate('/')}>Вернуться на главную</button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.heroPage}>
      <div className={styles.container}>
        <div className={styles.header}>
          <button className={styles.backButton} onClick={() => navigate('/')}>
            &larr; Назад
          </button>
          <h1 className={styles.title}>
            <img 
              src={getHeroIconUrl(hero.icon)} 
              alt={hero.localized_name} 
              className={styles.heroIcon}
              onError={(e) => {
                (e.target as HTMLImageElement).src = getFallbackHeroIcon();
              }}
            />
            {hero.localized_name}
          </h1>
          <div className={styles.ratingSelector}>
            <label htmlFor="rating-select">Рейтинг:</label>
            <select 
              id="rating-select"
              value={ratingId}
              onChange={(e) => setRatingId(e.target.value)}
            >
              {RATING_VALUES.map(value => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <div className={styles.heroInfo}>
          <div className={styles.heroImage}>
            <img 
              src={getHeroImageUrl(hero.img)} 
              alt={hero.localized_name} 
              onError={(e) => {
                (e.target as HTMLImageElement).src = getFallbackHeroImage();
              }}
            />
            <div className={styles.heroAttribute}>
              <span className={styles[hero.primary_attr]}>
                {hero.primary_attr === 'str' && 'Сила'}
                {hero.primary_attr === 'agi' && 'Ловкость'}
                {hero.primary_attr === 'int' && 'Интеллект'}
                {hero.primary_attr === 'all' && 'Универсал'}
              </span>
            </div>
          </div>
          
          <HeroStats 
            heroId={hero.id} 
            heroName={hero.localized_name} 
            ratingId={ratingId}
          />
        </div>
      </div>
    </div>
  );
}; 