const HOUSE_EDGE = 0.03; // 3% house edge

/**
 * Расчёт коэффициента для конкретного шага
 * Формула: (cellCount / (cellCount - 1)) ^ step * (1 - houseEdge)
 */
export function calculateMultiplier(cellCount: number, step: number): number {
  if (step === 0) return 1;
  const baseMultiplier = Math.pow(cellCount / (cellCount - 1), step);
  const withHouseEdge = baseMultiplier * (1 - HOUSE_EDGE);
  return Math.round(withHouseEdge * 100) / 100;
}

/**
 * Получить таблицу всех коэффициентов для заданного количества ячеек
 */
export function getMultiplierTable(cellCount: number, maxSteps: number = 10): number[] {
  const multipliers: number[] = [];
  for (let step = 1; step <= maxSteps; step++) {
    multipliers.push(calculateMultiplier(cellCount, step));
  }
  return multipliers;
}

/**
 * Расчёт потенциального выигрыша
 */
export function calculatePotentialWin(bet: number, multiplier: number): number {
  return Math.round(bet * multiplier * 100) / 100;
}

/**
 * Расчёт вероятности успеха на одном шаге
 */
export function getWinProbability(cellCount: number): number {
  return (cellCount - 1) / cellCount;
}

/**
 * Расчёт общей вероятности достижения определённого шага
 */
export function getTotalWinProbability(cellCount: number, steps: number): number {
  return Math.pow(getWinProbability(cellCount), steps);
}

/**
 * Получить описание сложности
 */
export function getDifficultyLabel(cellCount: number): string {
  switch (cellCount) {
    case 2:
      return 'Экстремальная';
    case 3:
      return 'Высокая';
    case 4:
      return 'Средняя';
    case 5:
      return 'Низкая';
    default:
      return 'Неизвестная';
  }
}

/**
 * Максимальный коэффициент для заданного количества ячеек (10 шагов)
 */
export function getMaxMultiplier(cellCount: number): number {
  return calculateMultiplier(cellCount, 10);
}
