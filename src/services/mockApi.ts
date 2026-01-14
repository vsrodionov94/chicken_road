import type { GameSession, StepResult, CashoutResult, VerificationData } from '../types/game';
import { generateRandomString, sha256, generateTrapPositions, generateSessionId, verifyGame } from '../utils/crypto';
import { calculateMultiplier, calculatePotentialWin } from '../utils/coefficients';

// Хранилище активных сессий (в реальном приложении это будет на сервере)
const activeSessions = new Map<string, {
  session: GameSession;
  serverSeed: string;
}>();

// Имитация задержки сети
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

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

  const trapPositions = await generateTrapPositions(
    serverSeed,
    finalClientSeed,
    nonce,
    cellCount,
    10
  );

  const session: GameSession = {
    id: generateSessionId(),
    serverSeedHash,
    clientSeed: finalClientSeed,
    nonce,
    cellCount,
    trapPositions,
    bet,
    currentStep: 0,
    currentMultiplier: 1,
    status: 'playing',
    createdAt: Date.now(),
  };

  activeSessions.set(session.id, { session, serverSeed });

  // Возвращаем сессию без trapPositions (они скрыты от клиента)
  return {
    ...session,
    trapPositions: [], // Скрываем позиции ловушек
  };
}

/**
 * Сделать шаг (выбрать ячейку)
 */
export async function makeStep(
  sessionId: string,
  cellIndex: number
): Promise<StepResult> {
  await delay(100);

  const sessionData = activeSessions.get(sessionId);
  if (!sessionData) {
    throw new Error('Session not found');
  }

  const { session } = sessionData;

  if (session.status !== 'playing') {
    throw new Error('Game is not in playing state');
  }

  const currentRow = session.currentStep;
  const trapIndex = session.trapPositions[currentRow];
  const success = cellIndex !== trapIndex;

  if (success) {
    session.currentStep += 1;
    session.currentMultiplier = calculateMultiplier(session.cellCount, session.currentStep);
  } else {
    session.status = 'lost';
  }

  return {
    success,
    trapIndex,
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

  if (session.status !== 'playing') {
    throw new Error('Game is not in playing state');
  }

  if (session.currentStep === 0) {
    throw new Error('Cannot cashout without making any steps');
  }

  session.status = 'won';
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

  if (session.status === 'playing') {
    throw new Error('Cannot verify while game is in progress');
  }

  const isValid = await verifyGame(
    serverSeed,
    session.serverSeedHash,
    session.clientSeed,
    session.nonce,
    session.cellCount,
    session.trapPositions
  );

  return {
    serverSeed,
    serverSeedHash: session.serverSeedHash,
    clientSeed: session.clientSeed,
    nonce: session.nonce,
    trapPositions: session.trapPositions,
    isValid,
  };
}

/**
 * Получить текущую сессию
 */
export function getSession(sessionId: string): GameSession | null {
  const sessionData = activeSessions.get(sessionId);
  if (!sessionData) return null;

  return {
    ...sessionData.session,
    trapPositions: sessionData.session.status === 'playing' ? [] : sessionData.session.trapPositions,
  };
}

/**
 * Очистить сессию
 */
export function clearSession(sessionId: string): void {
  activeSessions.delete(sessionId);
}
