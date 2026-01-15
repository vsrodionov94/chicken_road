/**
 * Генерация случайной строки
 */
export function generateRandomString(length: number = 32): string {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * SHA-256 хеширование
 */
export async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * HMAC-SHA256
 */
export async function hmacSha256(key: string, message: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(key);
  const messageData = encoder.encode(message);

  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign('HMAC', cryptoKey, messageData);
  const hashArray = Array.from(new Uint8Array(signature));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Получить позицию ловушки на основе хеша
 */
export function getTrapPositionFromHash(hash: string, cellCount: number): number {
  // Берём первые 8 символов хеша и конвертируем в число
  const hashPart = hash.substring(0, 8);
  const number = parseInt(hashPart, 16);
  return number % cellCount;
}

/**
 * Генерация позиций ловушек для всех рядов
 */
export async function generateTrapPositions(
  serverSeed: string,
  clientSeed: string,
  nonce: number,
  cellCount: number,
  rowCount: number = 10
): Promise<number[]> {
  const positions: number[] = [];

  for (let row = 0; row < rowCount; row++) {
    const message = `${clientSeed}:${nonce}:${row}`;
    const hash = await hmacSha256(serverSeed, message);
    positions.push(getTrapPositionFromHash(hash, cellCount));
  }

  return positions;
}

/**
 * Верификация честности игры
 */
export async function verifyGame(
  serverSeed: string,
  serverSeedHash: string,
  clientSeed: string,
  nonce: number,
  claimedDiceRolls: { dice1: number; dice2: number; isDouble: boolean }[]
): Promise<boolean> {
  // Проверяем, что хеш сида совпадает
  const calculatedHash = await sha256(serverSeed);
  if (calculatedHash !== serverSeedHash) {
    return false;
  }

  // Генерируем хеш для проверки бросков кубиков
  const combined = `${serverSeed}-${clientSeed}-${nonce}`;
  const hash = await sha256(combined);

  // Проверяем броски кубиков
  for (let step = 0; step < claimedDiceRolls.length; step++) {
    const dice1Hash = hash.substring(step * 4, step * 4 + 2);
    const dice2Hash = hash.substring(step * 4 + 2, step * 4 + 4);

    const dice1Value = parseInt(dice1Hash, 16);
    const dice2Value = parseInt(dice2Hash, 16);

    const dice1 = (dice1Value % 6) + 1;
    const dice2 = (dice2Value % 6) + 1;

    const claimed = claimedDiceRolls[step];
    if (claimed.dice1 !== dice1 || claimed.dice2 !== dice2) {
      return false;
    }
  }

  return true;
}

/**
 * Генерация уникального ID сессии
 */
export function generateSessionId(): string {
  return `session_${Date.now()}_${generateRandomString(8)}`;
}
