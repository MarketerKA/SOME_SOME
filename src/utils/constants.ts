/**
 * Константы приложения SOME-SOME
 */

// API константы
export const API = {
  BASE_URL: '/api',
  SESSION_ID: '318334842',
};

// Настройки запросов к API
export const API_OPTIONS = {
  headers: {
    'accept': 'application/json'
  },
  credentials: 'include' as RequestCredentials
};

// Типы статистики
export enum STATS_TYPE {
  Raw = 'raw',
  XPM = 'xpm',
  GPM = 'gpm',
  Against = 'against',
  With = 'with',
  Item = 'item'
}

// Типы рейтингов
export const RATING_VALUES = [
  "11", "12", "13", "14", "15", 
  "21", "22", "23", "24", "25", 
  "31", "32", "33", "34", "35", 
  "41", "42", "43", "44", "45", 
  "51", "52", "53", "54", "55", 
  "61", "62", "63", "64", "65", 
  "71", "72", "73", "74", "75", 
  "81"
];

// Рейтинг по умолчанию
export const DEFAULT_RATING_ID = "43";

// Пути роутинга
export const ROUTES = {
  HOME: '/',
  HEROES: '/heroes',
  HERO_DETAILS: '/heroes/:heroId',
  HERO_BY_ID: (id: number | string) => `/heroes/${id}`,
}; 