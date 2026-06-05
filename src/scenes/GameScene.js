import { GAME } from '../data/constants.js';
import { Prince } from '../entities/Prince.js';
import { AudioManager } from '../managers/AudioManager.js';
import { PowerupManager } from '../managers/PowerupManager.js';
import { EnemyManager } from '../managers/EnemyManager.js';
import { AchievementManager } from '../managers/AchievementManager.js';
import { LeaderboardManager } from '../managers/LeaderboardManager.js';
import { LevelGenerator } from '../systems/LevelGenerator.js';
import { VisualEffects } from '../effects/VisualEffects.js';
import { spawnCoin, updateCoins, collectCoin } from '../entities/Coin.js';
import { spawnChest, openChest } from '../entities/Chest.js';
import { spawnHazard, updateHazards, hitHazard } from '../entities/Hazard.js';
import { ENEMIES } from '../data/constants.js';

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
    this.enemyManager = new EnemyManager(this);
    this.achievements = new AchievementManager(this);
    this.leaderboard = new LeaderboardManager();
    this.levelGen = new LevelGenerator(this);
    this.fx = new VisualEffects(this);

    this.spawnCoin = spawnCoin;
    this.spawnChest = spawnChest;
    this.spawnHazard = spawnHazard;
    this.spawnEnemy = (x, y, type, group) => this.enemyManager.spawn(x, y, type);

    this.coinGroup = this.physics.add.group();
    this.chestGroup = this.physics.add.group();
    this.syncedPlatforms = new Set();
    this.hazardGroup = this.physics.add.group();
    this.platformGroup = this.physics.add.staticGroup();

    this.bgLayer = this.add.graphics().setDepth(-10);
    this.lightLayer = this.add.graphics().setDepth(5);

    this.player = new Prince(this, 120, GAME.HEIGHT - 140);
    this.physics.add.collider(this.player, this.platformGroup);
    this.physics.add.overlap(this.player, this.coinGroup, (_, coin) => collectCoin(this, coin));
    this.physics.add.overlap(this.player, this.chestGroup, (_, chest) => openChest(this, chest));
    this.physics.add.overlap(this.player, this.hazardGroup, (_, h) => hitHazard(this, h));
    this.physics.add.overlap(this.player, this.enemyManager.group, (_, e) => {
      if (this.player.takeDamage(e.damage || ENEMIES[e.enemyType]?.damage || 15)) {
        this.enemyManager.group.killAndHide(e);
      }
    });

    this.levelGen.reset();
    this.syncPlatforms();

    this.cameras.main.startFollow(this.player, true, 0.12, 0.08);
    this.cameras.main.setBounds(0, 0, Number.MAX_SAFE_INTEGER, GAME.HEIGHT);

    this.keys = this.input.keyboard.addKeys({
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
      jump: Phaser.Input.Keyboard.KeyCodes.SPACE,
      dash: Phaser.Input.Keyboard.KeyCodes.SHIFT,
      restart: Phaser.Input.Keyboard.KeyCodes.R,
      arrowL: Phaser.Input.Keyboard.KeyCodes.LEFT,
      arrowR: Phaser.Input.Keyboard.KeyCodes.RIGHT,
      arrowU: Phaser.Input.Keyboard.KeyCodes.UP,
    });
    this.mobileJumpQueued = false;
    this.mobileDashQueued = false;
    this.input.keyboard.on('keydown-R', () => this.restart());
    this.events.on('powerup-changed', (list) => this.registry.set('powerups', list));

    this.audio.unlock();
    this.registry.set('gameStats', this.stats);
    this.registry.set('player', this.player);
    this.registry.set('powerups', []);
    this.registry.set('leaderboard', this.leaderboard.get());
  }

  syncPlatforms() {
    this.levelGen.chunks.forEach(({ objects }) => {
      objects.platforms.forEach((p) => {
        if (this.syncedPlatforms.has(p)) return;
        this.syncedPlatforms.add(p);
        this.platformGroup.add(p);
      });
    });
  }

  getInput() {
    const mobile = this.registry.get('mobileInput') || {};
    if (mobile.jump) {
      this.mobileJumpQueued = true;
      mobile.jump = false;
      this.registry.set('mobileInput', mobile);
    }
    if (mobile.dash) {
      this.mobileDashQueued = true;
      mobile.dash = false;
      this.registry.set('mobileInput', mobile);
    }
    const jump = Phaser.Input.Keyboard.JustDown(this.keys.jump)
      || Phaser.Input.Keyboard.JustDown(this.keys.arrowU)
      || this.mobileJumpQueued;
    const dash = Phaser.Input.Keyboard.JustDown(this.keys.dash) || this.mobileDashQueued;
    this.mobileJumpQueued = false;
    this.mobileDashQueued = false;
    return {
      left: this.keys.left.isDown || this.keys.arrowL.isDown || mobile.left,
      right: this.keys.right.isDown || this.keys.arrowR.isDown || mobile.right,
      jump,
      dash,
    };
  }

  update(time, delta) {
    if (this.finished) return;

    const input = this.getInput();
    this.player.update(input, delta);
    this.stats.distance = Math.max(this.stats.distance, this.player.x - this.startX);
    const newLevel = Math.floor(this.stats.score / GAME.SCORE_PER_LEVEL) + 1;
    if (newLevel > this.stats.level) {
      this.stats.level = newLevel;
      this.audio.setIntensity(newLevel);
      this.audio.playLevelUp();
      this.fx.flash(0x00ff88, 0.2);
    }

    this.levelGen.update(this.player.x, this.stats.level);
    this.syncPlatforms();
    this.levelGen.updatePlatforms(time, delta);
    updateCoins(this, this.player, delta);
    updateHazards(this, delta);
    this.enemyManager.update(this.player, this.powerups.isFrozen());

    this.drawBackground();
    this.fx.update(this.stats.level, delta);

    this.registry.set('gameStats', this.stats);
    this.registry.set('player', this.player);

    const unlocked = this.achievements.evaluate(this.stats);
    if (unlocked.length) this.registry.set('newAchievements', unlocked);

    if (this.player.y > GAME.HEIGHT + 80) this.player.takeDamage(100);
  }

  drawBackground() {
    const cam = this.cameras.main;
    this.bgLayer.clear();
    this.lightLayer.clear();
    const scroll = cam.scrollX;
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
    this.leaderboard.update(this.stats);
    this.registry.set('leaderboard', this.leaderboard.get());
    this.time.delayedCall(800, () => {
      this.scene.stop('UIScene');
      this.scene.start('MainMenuScene');
    });
  }

  restart() {
    this.scene.stop('UIScene');
    this.scene.start('GameScene');
    this.scene.launch('UIScene');
  }
}
