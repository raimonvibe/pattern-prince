export const ACHIEVEMENTS = [
  { id: 'first_coin', title: 'First Coin', desc: 'Collect your first coin.', check: (s) => s.coinsCollected >= 1 },
  { id: 'treasure_hunter', title: 'Treasure Hunter', desc: 'Open a treasure chest.', check: (s) => s.chestsOpened >= 1 },
  { id: 'coins_100', title: '100 Coins', desc: 'Collect 100 coins.', check: (s) => s.coinsCollected >= 100 },
  { id: 'level_10', title: 'Level 10', desc: 'Reach level 10.', check: (s) => s.level >= 10 },
  { id: 'level_25', title: 'Level 25', desc: 'Reach level 25.', check: (s) => s.level >= 25 },
  { id: 'survivor', title: 'Survivor', desc: 'Travel 5000 units.', check: (s) => s.distance >= 5000 },
  { id: 'king', title: 'King of Memory', desc: 'Score 5000 points.', check: (s) => s.score >= 5000 },
];
