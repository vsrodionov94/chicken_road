import {
  GameStatus,
  type GameSession,
  type StepResult,
  type CashoutResult,
  type VerificationData,
  type DiceRoll,
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
 * Генерация бросков кубиков для игры
 */
async function generateDiceRolls(
  serverSeed: string,
  clientSeed: string,
  nonce: number
): Promise<{ diceRolls: DiceRoll[]; maxStep: number }> {
  const combined = `${serverSeed}-${clientSeed}-${nonce}`;
  const hash = await sha256(combined);

  const diceRolls: DiceRoll[] = [];
  let maxStep = 10; // По умолчанию можно пройти все 10 шагов

  // Генерируем броски кубиков для каждого шага
  // SHA-256 хеш имеет длину 64 символа, используем по 2 символа на кубик (4 символа на шаг)
  for (let step = 0; step < 10; step++) {
    // Используем разные части хеша для каждого кубика (по 2 символа = 1 байт)
    const dice1Hash = hash.substring(step * 4, step * 4 + 2);
    const dice2Hash = hash.substring(step * 4 + 2, step * 4 + 4);

    const dice1Value = parseInt(dice1Hash, 16);
    const dice2Value = parseInt(dice2Hash, 16);

    // Преобразуем в значения от 1 до 6
    const dice1 = (dice1Value % 6) + 1;
    const dice2 = (dice2Value % 6) + 1;

    const isDouble = dice1 === dice2;

    diceRolls.push({ dice1, dice2, isDouble });

    // Если выпал дубль и это первый дубль, запоминаем шаг
    if (isDouble && maxStep === 10) {
      maxStep = step; // Игрок проиграет на этом шаге
    }
  }

  return { diceRolls, maxStep };
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

  const { diceRolls, maxStep } = await generateDiceRolls(
    serverSeed,
    finalClientSeed,
    nonce
  );

  const session: GameSession = {
    id: generateSessionId(),
    serverSeedHash,
    clientSeed: finalClientSeed,
    nonce,
    cellCount,
    diceRolls,
    maxStep,
    bet,
    currentStep: -1,
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

  const nextStep = session.currentStep + 1;
  const diceRoll = session.diceRolls[nextStep];

  // Проверяем, не выпал ли дубль (проигрыш)
  const success = !diceRoll.isDouble;

  if (success) {
    session.currentStep += 1;
    session.currentMultiplier = calculateMultiplier(session.cellCount, session.currentStep + 1);
  } else {
    session.status = GameStatus.Lost;
  }

  return {
    success,
    diceRoll,
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
    session.diceRolls
  );

  return {
    serverSeed,
    serverSeedHash: session.serverSeedHash,
    clientSeed: session.clientSeed,
    nonce: session.nonce,
    diceRolls: session.diceRolls,
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
