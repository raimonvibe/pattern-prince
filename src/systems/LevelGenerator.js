import { GAME } from '../data/constants.js';

export class LevelGenerator {
  constructor(scene) {
    this.scene = scene;
    this.chunks = new Map();
    this.lastX = 0;
    this.lastPlatform = { x: 0, y: GAME.HEIGHT - 80, w: 200, h: 20 };
    this.rng = Phaser.Math.RND;
    this.maxJumpH = 140;
    this.maxJumpW = 220;
  }

  reset() {
    this.chunks.clear();
    this.lastX = 0;
    this.lastPlatform = { x: 0, y: GAME.HEIGHT - 80, w: 240, h: 20 };
    this.spawnChunk(0);
  }

  update(playerX, difficulty) {
    const chunkIdx = Math.floor(playerX / GAME.CHUNK_WIDTH);
    for (let i = chunkIdx - GAME.CHUNKS_BEHIND; i <= chunkIdx + GAME.CHUNKS_AHEAD; i++) {
      if (!this.chunks.has(i)) this.spawnChunk(i, difficulty);
    }
    [...this.chunks.keys()].forEach((k) => {
      if (k < chunkIdx - GAME.CHUNKS_BEHIND - 1 || k > chunkIdx + GAME.CHUNKS_AHEAD + 1) {
        const chunk = this.chunks.get(k);
        chunk?.objects.platforms.forEach((p) => this.scene.events.emit('platform-removed', p));
        chunk?.destroy();
        this.chunks.delete(k);
      }
    });
  }

  spawnChunk(index, difficulty = 1) {
    const group = this.scene.add.group();
    const startX = index * GAME.CHUNK_WIDTH;
    const objects = { platforms: [], coins: [], enemies: [], hazards: [], chests: [] };

    // Every chunk gets a full-width ground floor so gravity always has something to land on.
    const ground = this.makeGroundFloor(startX, GAME.GROUND_Y, GAME.CHUNK_WIDTH, group);
    objects.platforms.push(ground);

    if (index === 0) {
      this.lastPlatform = { x: startX, y: GAME.GROUND_Y, w: GAME.CHUNK_WIDTH, h: GAME.GROUND_HEIGHT };
    }

    let x = startX + 80;
    const endX = startX + GAME.CHUNK_WIDTH - 40;
    const count = 4 + Math.floor(difficulty * 0.8);

    for (let i = 0; i < count && x < endX; i++) {
      const gap = Phaser.Math.Between(40, this.maxJumpW - 20);
      const px = x + gap;
      const minY = GAME.GROUND_Y - 180;
      const maxY = GAME.GROUND_Y - 70;
      const prevY = this.lastPlatform.y;
      let py = Phaser.Math.Clamp(
        prevY + Phaser.Math.Between(-this.maxJumpH + 20, 40),
        minY,
        maxY,
      );
      if (Math.abs(prevY - py) > this.maxJumpH) py = prevY > py ? prevY - this.maxJumpH + 10 : prevY + 40;
      const pw = Phaser.Math.Between(100, 180);
      const types = ['stone', 'stone', 'crystal', 'corrupted', 'moving', 'disappearing'];
      const type = types[Phaser.Math.Between(0, Math.min(types.length - 1, 1 + Math.floor(difficulty / 3)))];

      const plat = this.makePlatform(px, py, pw, type, group);
      objects.platforms.push(plat);

      if (this.rng.frac() < 0.55 + difficulty * 0.02) {
        objects.coins.push(this.scene.spawnCoin?.(px + pw * 0.5, py - 30, this.pickCoinType(difficulty), group));
      }
      if (this.rng.frac() < 0.12 + difficulty * 0.015) {
        objects.enemies.push(this.scene.spawnEnemy?.(px + pw * 0.5, py - 24, this.pickEnemyType(difficulty), group));
      }
      if (this.rng.frac() < 0.08 + difficulty * 0.01) {
        objects.hazards.push(this.scene.spawnHazard?.(px + Phaser.Math.Between(20, pw - 40), py - 8, this.pickHazardType(difficulty), group));
      }
      if (this.rng.frac() < 0.04 + difficulty * 0.005) {
        objects.chests.push(this.scene.spawnChest?.(px + pw - 30, py - 28, group));
      }

      this.lastPlatform = { x: px, y: py, w: pw, h: 20 };
      x = px + pw;
    }

    if (this.rng.frac() < 0.15 + difficulty * 0.02) {
      const fx = startX + Phaser.Math.Between(80, GAME.CHUNK_WIDTH - 80);
      objects.hazards.push(this.scene.spawnHazard?.(fx, GAME.GROUND_Y - 12, 'fire', group));
    }

    this.chunks.set(index, { group, objects, destroy: () => group.clear(true, true) });
    this.lastX = Math.max(this.lastX, x);
  }

  makeGroundFloor(x, y, w, group) {
    const sprite = this.scene.add.image(x, y, 'platform-stone');
    sprite.setOrigin(0, 0);
    sprite.setDisplaySize(w, GAME.GROUND_HEIGHT);
    sprite.setTint(0x888899);
    this.scene.physics.add.existing(sprite, true);
    sprite.body.setSize(w, GAME.GROUND_HEIGHT);
    sprite.refreshBody();
    sprite.isGround = true;
    sprite.platformType = 'ground';
    group.add(sprite);
    return sprite;
  }

  makePlatform(x, y, w, type, group) {
    const sprite = this.scene.add.image(x, y, `platform-${type}`);
    sprite.setOrigin(0, 0);
    sprite.setDisplaySize(w, 20);
    this.scene.physics.add.existing(sprite, true);
    sprite.body.setSize(w, 20);
    sprite.refreshBody();
    sprite.platformType = type;
    sprite.startX = x + w / 2;
    sprite.moveRange = type === 'moving' ? 60 : 0;
    sprite.disappearTimer = type === 'disappearing' ? 0 : null;
    group.add(sprite);
    return sprite;
  }

  pickCoinType(d) {
    const r = this.rng.frac();
    if (r < 0.05 + d * 0.002) return 'diamond';
    if (r < 0.25 + d * 0.01) return 'dollar';
    return 'gold';
  }

  pickEnemyType(d) {
    const r = this.rng.frac();
    if (r < 0.08 + d * 0.01) return 'beast';
    if (r < 0.35 + d * 0.02) return 'knight';
    return 'ghost';
  }

  pickHazardType(d) {
    const types = ['spike', 'fire', 'barrier', 'block', 'laser'];
    return types[Phaser.Math.Between(0, Math.min(types.length - 1, 1 + Math.floor(d / 4)))];
  }

  updatePlatforms(time, delta) {
    this.chunks.forEach(({ objects }) => {
      objects.platforms.forEach((p) => {
        if (p.moveRange) {
          p.x = p.startX - p.displayWidth / 2 + Math.sin(time / 500) * p.moveRange;
          p.body.updateFromGameObject();
        }
        if (p.disappearTimer !== null) {
          p.disappearTimer += delta;
          if (p.disappearTimer > 2000) p.setAlpha(0.3 + Math.abs(Math.sin(p.disappearTimer / 200)) * 0.4);
        }
      });
    });
  }
}
