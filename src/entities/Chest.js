import { CHEST_REWARDS } from '../data/constants.js';

export function spawnChest(scene, x, y, group) {
  const chest = scene.physics.add.sprite(x, y, 'chest-closed');
  chest.body.setAllowGravity(false);
  chest.body.setSize(24, 20);
  chest.opened = false;
  group?.add(chest);
  scene.chestGroup.add(chest);
  return chest;
}

export function openChest(scene, chest) {
  if (chest.opened) return;
  chest.opened = true;
  chest.setTexture('chest-open');
  scene.stats.chestsOpened++;
  scene.audio?.playChest();
  scene.fx?.flash(0xffcc00, 0.35);
  scene.fx?.burst(chest.x, chest.y, 0xffcc00, 24);

  const reward = CHEST_REWARDS[Phaser.Math.Between(0, CHEST_REWARDS.length - 1)];
  const mult = scene.powerups?.scoreMultiplier() || 1;
  switch (reward) {
    case 'health':
      scene.player.heal(30);
      break;
    case 'score':
      scene.stats.score += 250 * mult;
      break;
    case 'shield':
    case 'double':
    case 'dash':
      scene.powerups.activate(reward === 'double' ? 'double' : reward);
      break;
    case 'artifact':
      scene.stats.score += 500 * mult;
      scene.player.heal(50);
      scene.powerups.activate('shield');
      break;
    default:
      break;
  }
  scene.time.delayedCall(600, () => chest.destroy());
}
