import { HAZARDS } from '../data/constants.js';

export function spawnHazard(scene, x, y, type, group) {
  const key = `hazard-${type}-0`;
  const hazard = scene.physics.add.sprite(x, y, key);
  hazard.hazardType = type;
  hazard.damage = HAZARDS[type]?.damage || 20;
  hazard.body.setAllowGravity(type === 'block');
  if (type === 'laser') hazard.setDisplaySize(64, 32);
  if (type === 'block') {
    hazard.body.setVelocityY(40);
    hazard.triggerY = y + 120;
  }
  hazard.play(`hazard-${type}`);
  group?.add(hazard);
  scene.hazardGroup.add(hazard);
  return hazard;
}

export function updateHazards(scene, delta) {
  scene.hazardGroup.children.iterate((h) => {
    if (!h?.active) return;
    if (h.hazardType === 'block' && h.y > h.triggerY) {
      h.body.setVelocityY(180);
    }
    if (h.hazardType === 'laser') {
      h.alpha = 0.6 + Math.sin(scene.time.now / 100) * 0.3;
    }
  });
}

export function hitHazard(scene, hazard) {
  scene.player.takeDamage(hazard.damage);
}
