import {
  GameStatus,
  type GameSession,
  type StepResult,
  type CashoutResult,
  type VerificationData,
} from '../types/game';
import {
  generateRandomString,
  sha256,
  generateSessionId,
  verifyGame,
} from '../utils/crypto';
import { calculateMultiplier, calculatePotentialWin } from '../utils/coefficients';

// Хранилище активных сессий (в реальном приложении это будет на сервере)
const activeSessions = new Map<
  string,
  {
    session: GameSession;
    serverSeed: string;
  }
>();

// Имитация задержки сети
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Генерация безопасного пути для игры
 */
async function generateSafePath(
  serverSeed: string,
  clientSeed: string,
  nonce: number,
  cellCount: number
): Promise<{ safePath: number[]; maxStep: number }> {
  const combined = `${serverSeed}-${clientSeed}-${nonce}`;
  const hash = await sha256(combined);

  // Определяем максимальное количество безопасных шагов (от 0 до 10)
  // Используем экспоненциальное распределение для смещения к низким значениям
  // maxStep = 0 означает проигрыш на первом шаге (нет успешных шагов)
  const maxStepByte = parseInt(hash.substring(0, 2), 16);
  const normalized = maxStepByte / 255; // 0-1
  const exponential = Math.pow(normalized, 3); // Смещаем к низким значениям
  const maxStep = Math.min(10, Math.floor(exponential * 10));

  const safePath: number[] = [];

  // Генерируем индекс безопасной ячейки для каждого шага
  for (let step = 0; step < 10; step++) {
    const stepHash = hash.substring(step * 6, step * 6 + 6);
    const value = parseInt(stepHash, 16);
    const safeIndex = value % cellCount;
    safePath.push(safeIndex);
  }

  return { safePath, maxStep };
}

/**
 * Начать новую игру
 */
export async function startGame(
  bet: number,
  cellCount: number,
  clientSeed?: string
): Promise<GameSession> {
  await delay(200); // Имитация сетевой задержки

  const serverSeed = generateRandomString(32);
  const serverSeedHash = await sha256(serverSeed);
  const finalClientSeed = clientSeed || generateRandomString(16);
  const nonce = Date.now();

  const { safePath, maxStep } = await generateSafePath(
    serverSeed,
    finalClientSeed,
    nonce,
    cellCount
  );

  const session: GameSession = {
    id: generateSessionId(),
    serverSeedHash,
    clientSeed: finalClientSeed,
    nonce,
    cellCount,
    safePath,
    maxStep,
    bet,
    currentStep: 0,
    currentMultiplier: 1,
    status: GameStatus.Playing,
    createdAt: Date.now(),
  };

  activeSessions.set(session.id, { session, serverSeed });

  return session;
}

/**
 * Сделать шаг (продолжить игру)
 */
export async function makeStep(sessionId: string): Promise<StepResult> {
  await delay(100);

  const sessionData = activeSessions.get(sessionId);
  if (!sessionData) {
    throw new Error('Session not found');
  }

  const { session } = sessionData;

  if (session.status !== GameStatus.Playing) {
    throw new Error('Game is not in playing state');
  }

  const currentRow = session.currentStep;
  const safeIndex = session.safePath[currentRow];

  // Проверяем, достиг ли игрок максимального шага
  const success = currentRow < session.maxStep;

  if (success) {
    session.currentStep += 1;
    session.currentMultiplier = calculateMultiplier(session.cellCount, session.currentStep);
  } else {
    session.status = GameStatus.Lost;
  }

  return {
    success,
    safeIndex,
    newMultiplier: session.currentMultiplier,
    potentialWin: calculatePotentialWin(session.bet, session.currentMultiplier),
  };
}

/**
 * Забрать выигрыш
 */
export async function cashout(sessionId: string): Promise<CashoutResult> {
  await delay(150);

  const sessionData = activeSessions.get(sessionId);
  if (!sessionData) {
    throw new Error('Session not found');
  }

  const { session } = sessionData;

  if (session.status !== GameStatus.Playing) {
    throw new Error('Game is not in playing state');
  }

  if (session.currentStep === 0) {
    throw new Error('Cannot cashout without making any steps');
  }

  session.status = GameStatus.Won;
  const amount = calculatePotentialWin(session.bet, session.currentMultiplier);

  return {
    success: true,
    amount,
    finalMultiplier: session.currentMultiplier,
  };
}

/**
 * Получить данные для верификации
 */
export async function getVerificationData(sessionId: string): Promise<VerificationData> {
  await delay(100);

  const sessionData = activeSessions.get(sessionId);
  if (!sessionData) {
    throw new Error('Session not found');
  }

  const { session, serverSeed } = sessionData;

  if (session.status === GameStatus.Playing) {
    throw new Error('Cannot verify while game is in progress');
  }

  const isValid = await verifyGame(
    serverSeed,
    session.serverSeedHash,
    session.clientSeed,
    session.nonce,
    session.cellCount,
    session.safePath
  );

  return {
    serverSeed,
    serverSeedHash: session.serverSeedHash,
    clientSeed: session.clientSeed,
    nonce: session.nonce,
    trapPositions: session.safePath,
    isValid,
  };
}

/**
 * Получить текущую сессию
 */
export function getSession(sessionId: string): GameSession | null {
  const sessionData = activeSessions.get(sessionId);
  if (!sessionData) return null;

  return sessionData.session;
}

/**
 * Очистить сессию
 */
export function clearSession(sessionId: string): void {
  activeSessions.delete(sessionId);
}
