import { API, API_OPTIONS, STATS_TYPE, RATING_VALUES, DEFAULT_RATING_ID } from '../utils/constants';
import { User, Match, Hero, HeroesResponse, HeroStats } from '../types';

// Устанавливаем cookie вручную, так как это наиболее надежный способ (работает через прокси)
document.cookie = `session_id=${API.SESSION_ID}; path=/`;

// Экспортируем типы статистики для использования в компонентах
export { STATS_TYPE as StatsType };

// Экспортируем рейтинги для использования в компонентах
export { RATING_VALUES };

// Получение пользовательских данных
export const fetchUserProfile = async (): Promise<User> => {
  console.log('API Call: получение данных пользователя');
  try {
    const response = await fetch(`${API.BASE_URL}/me`, API_OPTIONS);
    
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
    const response = await fetch(`${API.BASE_URL}/me/matches`, API_OPTIONS);
    
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
    const response = await fetch(`${API.BASE_URL}/heroes`, API_OPTIONS);
    
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
  ratingId: string = DEFAULT_RATING_ID,
  heroId: string,
  statsType: string | STATS_TYPE = STATS_TYPE.Raw
): Promise<HeroStats> => {
  // Используем формат как в Swagger, с дополнительным слешем
  const url = `${API.BASE_URL}/stats/${heroId}/?rating_id=${ratingId}&types=${statsType}`;
  console.log(`API Call: получение статистики героя, URL: ${url}`);
  
  try {
    const response = await fetch(url, API_OPTIONS);
    
    console.log(`API Response Status для статистики героя: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Не удалось получить текст ошибки');
      console.error(`API Error ${response.status}: ${errorText}`);
      throw new Error(`Ошибка ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('Получен ответ API для героя, первые 100 символов:', 
                typeof data === 'string' ? data.substring(0, 100) : JSON.stringify(data).substring(0, 100) + '...');
    return data;
  } catch (error) {
    console.error('API Error при получении статистики героя:', error);
    throw error;
  }
};

// Получение статистики всех героев
export const fetchAllHeroesStats = async (
  ratingId: string = DEFAULT_RATING_ID,
  statsType: string | STATS_TYPE = STATS_TYPE.Raw
): Promise<HeroStats[]> => {
  // Используем точно такой же формат URL, как в примере Swagger
  const url = `${API.BASE_URL}/stats/?rating_id=${ratingId}&types=${statsType}`;
  console.log(`API Call: получение статистики всех героев, URL: ${url}`);
  
  try {
    const response = await fetch(url, API_OPTIONS);
    
    console.log(`API Response Status для статистики: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Не удалось получить текст ошибки');
      console.error(`API Error ${response.status}: ${errorText}`);
      throw new Error(`Ошибка ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('Получен ответ API, первые 100 символов:', 
                typeof data === 'string' ? data.substring(0, 100) : JSON.stringify(data).substring(0, 100) + '...');
    return data;
  } catch (error) {
    console.error('API Error при получении статистики всех героев:', error);
    throw error;
  }
}; 