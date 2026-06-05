import { COINS } from '../data/constants.js';

export function spawnCoin(scene, x, y, type, group) {
  const coin = scene.physics.add.sprite(x, y, `coin-${type}-0`);
  coin.coinType = type;
  coin.baseY = y;
  coin.spinT = Math.random() * 1000;
  coin.play(`coin-${type}`);
  coin.body.setAllowGravity(false);
  coin.body.setSize(16, 16);
  group?.add(coin);
  scene.coinGroup.add(coin);
  return coin;
}

export function updateCoins(scene, player, delta) {
  scene.coinGroup.children.iterate((coin) => {
    if (!coin?.active) return;
    coin.spinT += delta;
    coin.y = coin.baseY + Math.sin(coin.spinT / 300) * 6;
    coin.setTint(Math.sin(coin.spinT / 200) > 0.5 ? 0xffffff : 0xffffaa);

    const magnet = scene.powerups?.has('magnet');
    if (magnet) {
      const dx = player.x - coin.x;
      const dy = player.y - coin.y;
      const dist = Math.hypot(dx, dy);
      if (dist < 160) {
        coin.x += dx * 0.06;
        coin.y += dy * 0.06;
      }
    }
  });
}

export function collectCoin(scene, coin) {
  const def = COINS[coin.coinType];
  const mult = scene.powerups?.scoreMultiplier() || 1;
  scene.stats.score += def.score * mult;
  if (def.health) scene.player.heal(def.health);
  scene.stats.coinsCollected++;
  scene.audio?.playCoin(coin.coinType);
  scene.fx?.burst(coin.x, coin.y, def.color);
  coin.destroy();
}
