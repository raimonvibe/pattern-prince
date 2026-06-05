import { GAME } from '../data/constants.js';

/**
 * Manages all static platform/ground bodies.
 * Phaser pattern: physics.add.staticGroup() + create() + refreshBody() after transforms.
 * @see https://phaser.io/tutorials/making-your-first-phaser-3-game/part4
 */
export class WorldBuilder {
  constructor(scene) {
    this.scene = scene;
    this.platforms = scene.physics.add.staticGroup();
  }

  /** Full-width ground strip — always present per chunk so gravity has a floor. */
  createGround(leftX, topY, width) {
    const cx = leftX + width / 2;
    const cy = topY + GAME.GROUND_HEIGHT / 2;
    const tile = this.platforms.create(cx, cy, 'platform-stone');
    tile.setDisplaySize(width, GAME.GROUND_HEIGHT);
    tile.setTint(0x888899);
    tile.refreshBody();
    tile.isGround = true;
    tile.platformType = 'ground';
    tile.setDepth(1);
    return tile;
  }

  /** Floating platform — center position, top surface at (topY). */
  createPlatform(leftX, topY, width, type) {
    const cx = leftX + width / 2;
    const cy = topY + 10;
    const tile = this.platforms.create(cx, cy, `platform-${type}`);
    tile.setDisplaySize(width, 20);
    tile.refreshBody();
    tile.platformType = type;
    tile.startX = cx;
    tile.moveRange = type === 'moving' ? 60 : 0;
    tile.disappearTimer = type === 'disappearing' ? 0 : null;
    tile.setDepth(2);
    return tile;
  }

  remove(tile) {
    if (tile?.active) this.platforms.remove(tile, true, true);
  }

  destroy() {
    this.platforms.clear(true, true);
  }
}
