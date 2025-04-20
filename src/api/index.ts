// Используем относительный URL для прокси через Vite
const API_URL = '/api';

// ID сессии для авторизации
const SESSION_ID = '318334842';

export interface Match {
  id: number;
  win: boolean;
  duration: number;
  game_mode: number;
  hero_id: number;
  time: number;
  kills: number;
  deaths: number;
  assists: number;
}

export interface User {
  id_: number;
  name: string;
  avatar: string;
  steam: string;
  rank: number;
  matches: Match[];
}

export interface Hero {
  id: number;
  name: string;
  primary_attr: string;
  attack_type: string;
  roles: string[];
  img: string;
  icon: string;
  base_health: number;
  base_health_regen: number;
  base_mana: number;
  base_mana_regen: number;
  base_armor: number;
  base_mr: number;
  base_attack_min: number;
  base_attack_max: number;
  base_str: number;
  base_agi: number;
  base_int: number;
  str_gain: number;
  agi_gain: number;
  int_gain: number;
  attack_range: number;
  projectile_speed: number;
  attack_rate: number;
  base_attack_time: number;
  attack_point: number;
}

export interface HeroesResponse {
  heroes: Hero[];
}

// Устанавливаем cookie вручную, так как это наиболее надежный способ (работает через прокси)
document.cookie = `session_id=${SESSION_ID}; path=/`;

// Базовые настройки запросов к API
const apiOptions = {
  headers: {
    'accept': 'application/json'
  },
  credentials: 'include' // Включаем передачу cookies (будет работать через прокси)
};

// Получение пользовательских данных
export const fetchUserProfile = async (): Promise<User> => {
  console.log('API Call: получение данных пользователя');
  try {
    const response = await fetch(`${API_URL}/me`, apiOptions);
    
    console.log('API Response Status:', response.status, response.statusText);
    
    if (!response.ok) {
      throw new Error(`Ошибка ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('API Response Data (first match):', data.matches?.[0]);
    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// Получение списка матчей пользователя
export const fetchMatches = async (): Promise<Match[]> => {
  console.log('API Call: получение матчей');
  try {
    const response = await fetch(`${API_URL}/me/matches`, apiOptions);
    
    if (!response.ok) {
      throw new Error(`Ошибка ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('API Matches Response получено записей:', data.length);
    return data;
  } catch (error) {
    console.error('API Error при получении матчей:', error);
    throw error;
  }
};

// Получение списка героев
export const fetchHeroes = async (): Promise<HeroesResponse> => {
  console.log('API Call: получение списка героев');
  try {
    const response = await fetch(`${API_URL}/heroes`, apiOptions);
    
    if (!response.ok) {
      throw new Error(`Ошибка ${response.status}: ${response.statusText}`);
    }
    
    return response.json();
  } catch (error) {
    console.error('API Error при получении списка героев:', error);
    throw error;
  }
};

// Получение статистики конкретного героя
export const fetchHeroStats = async (
  ratingId: string,
  heroId: string,
  statsType: string
): Promise<string> => {
  console.log('API Call: получение статистики героя', { ratingId, heroId, statsType });
  try {
    const response = await fetch(
      `${API_URL}/stats/${heroId}?rating_id=${ratingId}&types=${statsType}`,
      apiOptions
    );
    
    if (!response.ok) {
      throw new Error(`Ошибка ${response.status}: ${response.statusText}`);
    }
    
    return response.json();
  } catch (error) {
    console.error('API Error при получении статистики героя:', error);
    throw error;
  }
};

// Получение статистики всех героев
export const fetchAllHeroesStats = async (
  ratingId: string,
  statsType: string
): Promise<string> => {
  console.log('API Call: получение статистики всех героев', { ratingId, statsType });
  try {
    const response = await fetch(
      `${API_URL}/stats?rating_id=${ratingId}&types=${statsType}`,
      apiOptions
    );
    
    if (!response.ok) {
      throw new Error(`Ошибка ${response.status}: ${response.statusText}`);
    }
    
    return response.json();
  } catch (error) {
    console.error('API Error при получении статистики всех героев:', error);
    throw error;
  }
}; 