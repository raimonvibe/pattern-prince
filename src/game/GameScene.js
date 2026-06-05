import Phaser from 'phaser';
import { GAME } from './config.js';

export class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  init() {
    this.player = null;
    this.platforms = null;
    this.enemies = null;
    this.cursors = null;
    this.score = 0;
    this.gameOver = false;
  }

  create() {
    this.showStatus('Loading...');

    try {
      this.createTextures();
      this.buildWorld();
      this.buildPlayer();
      this.buildColliders();
      this.bindInput();
      this.setupCamera();
      this.spawnEnemies();
      this.buildHud();
      this.statusText?.destroy();
      this.statusText = null;
    } catch (err) {
      console.error('Game failed to load:', err);
      this.showStatus('Game failed to load');
    }
  }

  showStatus(message) {
    if (this.statusText) this.statusText.destroy();
    this.statusText = this.add
      .text(GAME.WIDTH / 2, GAME.HEIGHT / 2, message, {
        fontFamily: 'monospace',
        fontSize: '20px',
        color: '#ffffff',
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(1000);
  }

  createTextures() {
    if (this.textures.exists('ground')) return;

    const g = this.make.graphics({ add: false });
    g.fillStyle(0x666677, 1);
    g.fillRect(0, 0, 32, 32);
    g.generateTexture('ground', 32, 32);
    g.clear();
    g.fillStyle(0x44aaff, 1);
    g.fillRect(0, 0, 24, 32);
    g.generateTexture('player', 24, 32);
    g.clear();
    g.fillStyle(0xff4466, 1);
    g.fillRect(0, 0, 28, 28);
    g.generateTexture('enemy', 28, 28);
    g.destroy();
  }

  /** Step 1 — ground/platforms BEFORE player */
  buildWorld() {
    this.platforms = this.physics.add.staticGroup();

    const groundCenterY = GAME.GROUND_Y + GAME.GROUND_HEIGHT / 2;
    const ground = this.platforms.create(GAME.WORLD_WIDTH / 2, groundCenterY, 'ground');
    ground.setDisplaySize(GAME.WORLD_WIDTH, GAME.GROUND_HEIGHT);
    ground.refreshBody();

    const platformData = [
      { x: 520, y: 400, w: 160 },
      { x: 900, y: 340, w: 140 },
      { x: 1300, y: 380, w: 180 },
      { x: 1700, y: 320, w: 160 },
      { x: 2100, y: 360, w: 200 },
      { x: 2500, y: 300, w: 140 },
    ];

    platformData.forEach(({ x, y, w }) => {
      const tile = this.platforms.create(x, y + 10, 'ground');
      tile.setDisplaySize(w, 20);
      tile.setTint(0x888899);
      tile.refreshBody();
    });

    this.physics.world.setBounds(0, 0, GAME.WORLD_WIDTH, GAME.HEIGHT);
  }

  /** Step 2 — player spawns ON ground, never in air */
  buildPlayer() {
    const spawnY = GAME.GROUND_Y - 16;
    this.player = this.physics.add.sprite(120, spawnY, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.setBounce(0);
    this.player.body.setSize(20, 30);
  }

  /** Step 3 — colliders after both exist */
  buildColliders() {
    this.physics.add.collider(this.player, this.platforms);
  }

  /** Step 4 — input after player exists */
  bindInput() {
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys({
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
      jump: Phaser.Input.Keyboard.KeyCodes.W,
    });
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.input.keyboard.on('keydown-R', () => {
      if (this.gameOver) this.scene.restart();
    });
  }

  setupCamera() {
    this.cameras.main.setBounds(0, 0, GAME.WORLD_WIDTH, GAME.HEIGHT);
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
  }

  spawnEnemies() {
    this.enemies = this.physics.add.group({ allowGravity: true });

    const spots = [480, 880, 1280, 1680, 2080, 2480];
    spots.forEach((x) => {
      const enemy = this.enemies.create(x, GAME.GROUND_Y - 14, 'enemy');
      enemy.setCollideWorldBounds(true);
      enemy.setBounce(1, 0);
      enemy.setVelocityX(Phaser.Math.Between(0, 1) ? 50 : -50);
      enemy.body.setSize(24, 24);
    });

    this.physics.add.collider(this.enemies, this.platforms);
    this.physics.add.overlap(this.player, this.enemies, this.onPlayerHitEnemy, null, this);
  }

  buildHud() {
    this.scoreText = this.add
      .text(16, 12, 'Score: 0', {
        fontFamily: 'monospace',
        fontSize: '18px',
        color: '#ffffff',
      })
      .setScrollFactor(0)
      .setDepth(100);

    this.helpText = this.add
      .text(GAME.WIDTH / 2, GAME.HEIGHT - 20, 'Arrows / WASD — move & jump', {
        fontFamily: 'monospace',
        fontSize: '13px',
        color: '#888899',
      })
      .setOrigin(0.5, 1)
      .setScrollFactor(0)
      .setDepth(100);
  }

  onPlayerHitEnemy() {
    if (this.gameOver) return;
    this.gameOver = true;
    this.player.setTint(0xff0000);
    this.physics.pause();

    this.add
      .text(GAME.WIDTH / 2, GAME.HEIGHT / 2, `Game Over\nScore: ${Math.floor(this.score)}\nPress R to retry`, {
        fontFamily: 'monospace',
        fontSize: '22px',
        color: '#ffffff',
        align: 'center',
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(1001);
  }

  update(_time, delta) {
    if (!this.player?.body || this.gameOver) return;

    const onGround = this.player.body.blocked.down || this.player.body.touching.down;
    const left = this.cursors.left.isDown || this.wasd.left.isDown;
    const right = this.cursors.right.isDown || this.wasd.right.isDown;
    const jump =
      (this.cursors.up.isDown || this.spaceKey.isDown || this.wasd.jump.isDown) && onGround;

    if (left) {
      this.player.setVelocityX(-GAME.PLAYER_SPEED);
    } else if (right) {
      this.player.setVelocityX(GAME.PLAYER_SPEED);
    } else {
      this.player.setVelocityX(0);
    }

    if (jump) {
      this.player.setVelocityY(GAME.JUMP_VELOCITY);
    }

    this.score += delta * 0.02;
    this.scoreText?.setText(`Score: ${Math.floor(this.score)}`);
  }
}
