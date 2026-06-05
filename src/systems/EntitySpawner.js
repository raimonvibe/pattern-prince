import { EnemyManager } from '../managers/EnemyManager.js';
import { spawnCoin, updateCoins } from '../entities/Coin.js';
import { spawnChest, openChest } from '../entities/Chest.js';
import { spawnHazard, updateHazards, hitHazard } from '../entities/Hazard.js';
import { collectCoin } from '../entities/Coin.js';
import { ENEMIES } from '../data/constants.js';

/**
 * Central spawn + collision hub for gameplay entities.
 * Keeps LevelGenerator decoupled from GameScene method injection.
 */
export class EntitySpawner {
  constructor(scene) {
    this.scene = scene;
    this.enemyManager = new EnemyManager(scene);
    this.coins = scene.physics.add.group();
    this.chests = scene.physics.add.group();
    this.hazards = scene.physics.add.group();
  }

  spawnCoin(x, y, type) {
    return spawnCoin(this.scene, x, y, type, null);
  }

  spawnChest(x, y) {
    return spawnChest(this.scene, x, y, null);
  }

  spawnHazard(x, y, type) {
    return spawnHazard(this.scene, x, y, type, null);
  }

  spawnEnemy(x, y, type) {
    return this.enemyManager.spawn(x, y, type);
  }

  bindColliders(player, platforms) {
    const s = this.scene;
    s.physics.add.collider(player, platforms);
    s.physics.add.collider(this.enemyManager.group, platforms);
    s.physics.add.collider(this.hazards, platforms);
    s.physics.add.overlap(player, this.coins, (_, coin) => collectCoin(s, coin));
    s.physics.add.overlap(player, this.chests, (_, chest) => openChest(s, chest));
    s.physics.add.overlap(player, this.hazards, (_, h) => hitHazard(s, h));
    s.physics.add.overlap(player, this.enemyManager.group, (_, e) => {
      if (player.takeDamage(e.damage || ENEMIES[e.enemyType]?.damage || 15)) {
        this.enemyManager.group.killAndHide(e);
      }
    });
  }

  update(player, delta, frozen) {
    updateCoins(this.scene, player, delta);
    updateHazards(this.scene, delta);
    this.enemyManager.update(player, frozen, delta);
  }

  clear() {
    this.coins.clear(true, true);
    this.chests.clear(true, true);
    this.hazards.clear(true, true);
    this.enemyManager.clear();
  }
}
