// Массив цветов для индикаторов героев
const colors = [
  '#FF5252', '#FF4081', '#E040FB', '#7C4DFF', '#536DFE',
  '#448AFF', '#40C4FF', '#18FFFF', '#64FFDA', '#69F0AE',
  '#B2FF59', '#EEFF41', '#FFFF00', '#FFD740', '#FFAB40',
  '#FF6E40', '#8D6E63', '#78909C'
];

/**
 * Возвращает цвет для героя на основе его ID
 * @param heroId ID героя
 * @returns Цвет в формате HEX
 */
export function getHeroColor(heroId: number): string {
  return colors[heroId % colors.length];
}

/**
 * Создает данные для CSS стилей цветного индикатора героя
 * @param heroId ID героя
 * @returns Объект с CSS свойствами
 */
export function createHeroColorIndicator(heroId: number): {
  backgroundColor: string;
  color: string;
} {
  const bgColor = getHeroColor(heroId);
  
  // Определяем контрастный цвет текста
  const r = parseInt(bgColor.substring(1, 3), 16);
  const g = parseInt(bgColor.substring(3, 5), 16);
  const b = parseInt(bgColor.substring(5, 7), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  
  // Если фон темный, используем светлый текст, и наоборот
  const textColor = brightness > 125 ? '#000000' : '#FFFFFF';
  
  return {
    backgroundColor: bgColor,
    color: textColor
  };
} 