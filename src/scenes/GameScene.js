import { GAME } from '../data/constants.js';
import { Prince } from '../entities/Prince.js';
import { AudioManager } from '../managers/AudioManager.js';
import { PowerupManager } from '../managers/PowerupManager.js';
import { AchievementManager } from '../managers/AchievementManager.js';
import { LeaderboardManager } from '../managers/LeaderboardManager.js';
import { LevelGenerator } from '../systems/LevelGenerator.js';
import { WorldBuilder } from '../systems/WorldBuilder.js';
import { EntitySpawner } from '../systems/EntitySpawner.js';
import { InputController } from '../systems/InputController.js';
import { VisualEffects } from '../effects/VisualEffects.js';

/**
 * Core gameplay scene — structured like a typical Phaser 3 platformer:
 * buildWorld → buildPlayer → buildColliders → bindInput → update loop
 */
export class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  create() {
    this.stats = { score: 0, distance: 0, level: 1, coinsCollected: 0, chestsOpened: 0 };
    this.startX = 120;
    this.finished = false;

    this.audio = new AudioManager(this);
    this.powerups = new PowerupManager(this);
    this.achievements = new AchievementManager(this);
    this.leaderboard = new LeaderboardManager();
    this.fx = new VisualEffects(this);

    this.buildWorld();
    this.buildPlayer();
    this.buildColliders();
    this.bindInput();
    this.syncRegistry();

    this.audio.unlock();
  }

  /** Step 1 — physics world, background, procedural chunks */
  buildWorld() {
    this.physics.world.setBounds(0, 0, Number.MAX_SAFE_INTEGER, GAME.HEIGHT);

    this.bgLayer = this.add.graphics().setDepth(-10);
    this.lightLayer = this.add.graphics().setDepth(5);

    this.world = new WorldBuilder(this);
    this.spawner = new EntitySpawner(this);

    // Wire entity groups for Coin/Chest/Hazard modules
    this.coinGroup = this.spawner.coins;
    this.chestGroup = this.spawner.chests;
    this.hazardGroup = this.spawner.hazards;
    this.platformGroup = this.world.platforms;

    this.levelGen = new LevelGenerator(this, this.world, this.spawner);
    this.levelGen.reset();
  }

  /** Step 2 — player sprite with arcade physics */
  buildPlayer() {
    this.player = new Prince(this, 120, GAME.GROUND_Y - 36);
    this.physics.world.once('worldstep', () => {
      if (this.player?.body) {
        this.player.setPosition(120, GAME.GROUND_Y - 36);
        this.player.body.setVelocity(0, 0);
        this.player.body.updateFromGameObject();
      }
    });
    this.cameras.main.startFollow(this.player, true, 0.12, 0.08);
    this.cameras.main.setBounds(0, 0, Number.MAX_SAFE_INTEGER, GAME.HEIGHT);
  }

  /** Step 3 — colliders: player + enemies + hazards ↔ static platforms */
  buildColliders() {
    this.spawner.bindColliders(this.player, this.world.platforms);
  }

  /** Step 4 — keyboard + mobile via registry */
  bindInput() {
    this.inputCtrl = new InputController(this);
    this.events.on('powerup-changed', (list) => this.registry.set('powerups', list));
  }

  syncRegistry() {
    this.registry.set('gameStats', this.stats);
    this.registry.set('player', this.player);
    this.registry.set('powerups', []);
    this.registry.set('leaderboard', this.leaderboard.get());
  }

  update(time, delta) {
    if (this.finished) return;

    const input = this.inputCtrl.poll(this.registry);
    this.player.update(input, delta);

    this.stats.distance = Math.max(this.stats.distance, this.player.x - this.startX);
    this.stats.score += 0.02;

    const newLevel = Math.floor(this.stats.score / GAME.SCORE_PER_LEVEL) + 1;
    if (newLevel > this.stats.level) {
      this.stats.level = newLevel;
      this.audio.setIntensity(newLevel);
      this.audio.playLevelUp();
      this.fx.flash(0x00ff88, 0.2);
    }

    this.levelGen.update(this.player.x, this.stats.level);
    this.levelGen.updatePlatforms(time, delta);
    this.spawner.update(this.player, delta, this.powerups.isFrozen());

    this.drawBackground();
    this.fx.update(this.stats.level, delta);

    this.registry.set('gameStats', this.stats);
    this.registry.set('player', this.player);

    const unlocked = this.achievements.evaluate(this.stats);
    if (unlocked.length) this.registry.set('newAchievements', unlocked);

    if (this.player.y > GAME.HEIGHT + 40) this.player.takeDamage(100);
  }

  drawBackground() {
    const cam = this.cameras.main;
    const scroll = cam.scrollX;
    this.bgLayer.clear();
    this.lightLayer.clear();
    this.bgLayer.fillStyle(0x050508, 1);
    this.bgLayer.fillRect(scroll, 0, GAME.WIDTH, GAME.HEIGHT);
    this.bgLayer.lineStyle(1, 0x0a1a0a, 0.4);
    for (let x = Math.floor(scroll / 40) * 40; x < scroll + GAME.WIDTH; x += 40) {
      this.bgLayer.lineBetween(x, 0, x, GAME.HEIGHT);
    }
    this.lightLayer.fillStyle(0x00ff88, 0.06);
    this.lightLayer.fillCircle(this.player.x, this.player.y, 100 + this.stats.level * 2);
  }

  onPlayerDeath() {
    if (this.finished) return;
    this.finished = true;
    const best = this.leaderboard.update(this.stats);
    this.registry.set('leaderboard', best);
    this.scene.stop('UIScene');
    this.scene.start('GameOverScene', { stats: { ...this.stats }, best });
  }

  restart() {
    this.cleanup();
    this.scene.stop('UIScene');
    this.scene.start('GameScene');
    this.scene.launch('UIScene');
  }

  cleanup() {
    this.powerups?.reset();
    this.spawner?.clear();
    this.world?.destroy();
    this.fx?.destroy();
    this.audio?.stopMusic();
    this.events.off('powerup-changed');
  }

  shutdown() {
    this.cleanup();
  }
}
