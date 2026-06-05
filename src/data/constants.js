export const GAME = {
  WIDTH: 960,
  HEIGHT: 540,
  TILE: 16,
  GRAVITY: 1400,
  PLAYER_SPEED: 220,
  JUMP_VELOCITY: -520,
  DASH_SPEED: 520,
  DASH_DURATION: 180,
  DASH_COOLDOWN: 900,
  MAX_HP: 100,
  SCORE_PER_LEVEL: 150,
  CHUNK_WIDTH: 640,
  CHUNKS_AHEAD: 3,
  CHUNKS_BEHIND: 1,
  GROUND_HEIGHT: 48,
  GROUND_Y: 540 - 48, // surface top of ground floor (HEIGHT - GROUND_HEIGHT)
};

export const COINS = {
  gold: { score: 10, health: 0, color: 0xffd700, rare: false },
  dollar: { score: 15, health: 10, color: 0x44ff88, rare: false },
  diamond: { score: 100, health: 25, color: 0x66ccff, rare: true },
};

export const ENEMIES = {
  ghost: { hp: 15, damage: 15, speed: 60, color: 0xaaddff },
  knight: { hp: 25, damage: 25, speed: 90, color: 0xcc4444 },
  beast: { hp: 40, damage: 40, speed: 140, color: 0xff2266 },
};

export const HAZARDS = {
  spike: { damage: 20 },
  fire: { damage: 30 },
  barrier: { damage: 25 },
  block: { damage: 35 },
  laser: { damage: 40 },
};

export const POWERUPS = {
  shield: { duration: 10000, label: 'SHIELD' },
  dash: { duration: 0, label: 'DASH+' },
  freeze: { duration: 8000, label: 'FREEZE' },
  magnet: { duration: 12000, label: 'MAGNET' },
  double: { duration: 15000, label: '2X SCORE' },
};

export const CHEST_REWARDS = [
  'health',
  'score',
  'shield',
  'double',
  'dash',
  'freeze',
  'magnet',
  'artifact',
];
