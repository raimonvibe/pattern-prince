import { ENEMIES } from '../data/constants.js';

export class EnemyManager {
  constructor(scene) {
    this.scene = scene;
    this.group = scene.physics.add.group();
  }

  spawn(x, y, type) {
    const def = ENEMIES[type];
    const enemy = this.group.create(x, y, `enemy-${type}-0`);
    enemy.setCollideWorldBounds(false);
    enemy.setDepth(15);
    enemy.body.setSize(20, 24).setOffset(6, 6);
    enemy.enemyType = type;
    enemy.damage = def.damage;
    enemy.speed = def.speed;
    enemy.patrolMin = x - 80;
    enemy.patrolMax = x + 80;
    enemy.chargeCooldown = 0;
    enemy.play(`enemy-${type}`);

    if (type === 'ghost') enemy.body.setAllowGravity(false);

    return enemy;
  }

  update(player, frozen, delta) {
    const speedMult = frozen ? 0.25 : 1;
    const dt = delta / 1000;
    this.group.children.iterate((enemy) => {
      if (!enemy?.active) return;
      if (enemy.enemyType === 'ghost') {
        enemy.y += Math.sin(this.scene.time.now / 400) * 0.4;
        enemy.x += enemy.speed * dt * speedMult * (enemy.flipX ? -1 : 1);
        if (enemy.x <= enemy.patrolMin || enemy.x >= enemy.patrolMax) enemy.flipX = !enemy.flipX;
        enemy.body.updateFromGameObject();
      } else if (enemy.enemyType === 'knight') {
        enemy.x += enemy.speed * dt * speedMult * (enemy.flipX ? -1 : 1);
        if (enemy.x <= enemy.patrolMin || enemy.x >= enemy.patrolMax) enemy.flipX = !enemy.flipX;
        enemy.body.updateFromGameObject();
      } else if (enemy.enemyType === 'beast') {
        enemy.chargeCooldown -= delta;
        const dist = Phaser.Math.Distance.Between(enemy.x, enemy.y, player.x, player.y);
        if (dist < 280 && enemy.chargeCooldown <= 0) {
          enemy.body.setVelocityX((player.x > enemy.x ? 1 : -1) * enemy.speed * 2.5 * speedMult);
          enemy.chargeCooldown = 2000;
        } else if (enemy.chargeCooldown > 1500) {
          enemy.body.setVelocityX(0);
        }
      }
    });
  }

  clear() {
    this.group.clear(true, true);
  }
}
