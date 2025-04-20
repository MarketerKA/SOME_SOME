/**
 * Основные типы проекта SOME-SOME
 */

// Матч пользователя
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

// Данные пользователя
export interface User {
  id_: number;
  name: string;
  avatar: string;
  steam: string;
  rank: number;
  matches: Match[];
}

// Данные о герое
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

// Ответ API с героями
export interface HeroesResponse {
  heroes: Hero[];
}

// Статистика героя
export interface HeroStats {
  hero_id: number;
  icon?: string;
  name?: string;
  localized_name?: string;
  presence: number;
  win_rate: number;
  kda: number;
  gpm: number;
  xpm: number;
  matches_count?: number;
  picks_count?: number;
  bans_count?: number;
}

// Объединенная статистика героя для отображения на главной странице
export interface CombinedHeroStats {
  hero_id: number;
  localized_name?: string;
  name?: string;
  icon?: string;
  raw?: {
    presence: number;
    win_rate: number;
    kda: number;
  };
  xpm?: number;
  gpm?: number;
} 