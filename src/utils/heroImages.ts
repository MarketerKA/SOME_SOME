// Утилита для работы с изображениями героев

// Базовый URL для изображений Steam
const STEAM_CDN_URL = 'https://cdn.cloudflare.steamstatic.com';

// Маппинг идентификаторов героев в их имена
// Обычно такие данные должны приходить с сервера, но для примера 
// добавляем несколько распространенных героев
const HERO_ID_TO_NAME: Record<number, string> = {
  1: 'antimage',
  2: 'axe',
  3: 'bane',
  4: 'bloodseeker',
  5: 'crystal_maiden',
  6: 'drow_ranger',
  7: 'earthshaker',
  8: 'juggernaut',
  9: 'mirana',
  10: 'morphling',
  11: 'nevermore', // Shadow Fiend
  12: 'phantom_lancer',
  13: 'puck',
  14: 'pudge',
  15: 'razor',
  16: 'sand_king',
  17: 'storm_spirit',
  18: 'sven',
  19: 'tiny',
  20: 'vengefulspirit',
  // Можно добавить больше героев при необходимости
};

/**
 * Формирует полный URL для изображения героя
 * @param relativeImagePath Относительный путь к изображению из API
 * @returns Полный URL к изображению
 */
export const getHeroImageUrl = (relativeImagePath: string): string => {
  if (!relativeImagePath) return '';
  
  // Убираем знак вопроса в конце URL, если он есть
  const cleanPath = relativeImagePath.replace(/\?$/, '');
  
  // Формируем полный URL
  return `${STEAM_CDN_URL}${cleanPath}`;
};

/**
 * Формирует полный URL для иконки героя
 * @param relativeIconPath Относительный путь к иконке из API
 * @returns Полный URL к иконке
 */
export const getHeroIconUrl = (relativeIconPath: string): string => {
  if (!relativeIconPath) return '';
  
  // Убираем знак вопроса в конце URL, если он есть
  const cleanPath = relativeIconPath.replace(/\?$/, '');
  
  // Формируем полный URL
  return `${STEAM_CDN_URL}${cleanPath}`;
};

/**
 * Возвращает запасное изображение в случае ошибки загрузки
 */
export const getFallbackHeroImage = (): string => {
  return `${STEAM_CDN_URL}/apps/dota2/images/heroes/default_sb.png`;
};

/**
 * Возвращает запасную иконку в случае ошибки загрузки
 */
export const getFallbackHeroIcon = (): string => {
  return `${STEAM_CDN_URL}/apps/dota2/images/heroes/default_icon.png`;
};

/**
 * Получает цвет для героя на основе его атрибута
 * @param primaryAttr Основной атрибут героя
 * @returns Цветовой код
 */
export const getHeroAttributeColor = (primaryAttr: string): string => {
  switch (primaryAttr) {
    case 'str': return '#f44336'; // Сила - красный
    case 'agi': return '#4caf50'; // Ловкость - зеленый
    case 'int': return '#2196f3'; // Интеллект - синий
    default: return '#9c27b0';    // Универсал - фиолетовый
  }
};

/**
 * Получает имя героя по его ID
 * @param heroId ID героя
 * @returns Имя героя или строка по умолчанию
 */
export const getHeroNameById = (heroId: number): string => {
  return HERO_ID_TO_NAME[heroId] || `hero_${heroId}`;
};

/**
 * Формирует URL для иконки героя по его ID
 * @param heroId ID героя
 * @returns URL к иконке героя
 */
export const getHeroIconByIdDirect = (heroId: number): string => {
  const heroName = getHeroNameById(heroId);
  return `${STEAM_CDN_URL}/apps/dota2/images/dota_react/heroes/icons/${heroName}.png`;
};

/**
 * Формирует URL для изображения героя по его ID
 * @param heroId ID героя
 * @returns URL к изображению героя
 */
export const getHeroImageByIdDirect = (heroId: number): string => {
  const heroName = getHeroNameById(heroId);
  return `${STEAM_CDN_URL}/apps/dota2/images/dota_react/heroes/${heroName}.png`;
};

/**
 * Формирует URL для изображения героя по его ID
 * @param heroId ID героя
 * @param heroes Массив героев из API
 * @returns URL к изображению героя
 */
export const getHeroImageById = (heroId: number, heroes: any[]): string => {
  if (!heroes || !heroes.length) return getFallbackHeroImage();
  
  const hero = heroes.find(h => h.id === heroId);
  if (!hero) return getFallbackHeroImage();
  
  return getHeroImageUrl(hero.img);
};

/**
 * Формирует URL для иконки героя по его ID
 * @param heroId ID героя
 * @param heroes Массив героев из API
 * @returns URL к иконке героя
 */
export const getHeroIconById = (heroId: number, heroes: any[]): string => {
  if (!heroes || !heroes.length) return getFallbackHeroIcon();
  
  const hero = heroes.find(h => h.id === heroId);
  if (!hero) return getFallbackHeroIcon();
  
  return getHeroIconUrl(hero.icon);
}; 