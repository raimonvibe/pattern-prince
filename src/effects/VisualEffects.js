import { GAME } from '../data/constants.js';

export class VisualEffects {
  constructor(scene) {
    this.scene = scene;
    this.scanlines = scene.add.graphics().setScrollFactor(0).setDepth(900).setAlpha(0.12);
    this.vignette = scene.add.graphics().setScrollFactor(0).setDepth(901).setAlpha(0.35);
    this.flashGfx = scene.add.rectangle(GAME.WIDTH / 2, GAME.HEIGHT / 2, GAME.WIDTH, GAME.HEIGHT, 0xffffff, 0)
      .setScrollFactor(0).setDepth(950);
    this.glitchTimer = 0;
    this.particles = scene.add.particles(0, 0, 'prince-idle-0', {
      lifespan: 400,
      speed: { min: 60, max: 180 },
      scale: { start: 0.3, end: 0 },
      emitting: false,
    }).setDepth(50);

    this.drawOverlays();
    scene.scale.on('resize', this.drawOverlays, this);
  }

  drawOverlays() {
    const w = GAME.WIDTH;
    const h = GAME.HEIGHT;
    const mobile = this.scene.scale.displaySize.height > this.scene.scale.displaySize.width;
    const bottomInset = mobile ? 100 : 40;
    const topInset = mobile ? 56 : 40;

    this.scanlines.clear();
    this.scanlines.fillStyle(0x000000, 0.15);
    for (let y = 0; y < h; y += 3) this.scanlines.fillRect(0, y, w, 1);

    this.vignette.clear();
    this.vignette.fillStyle(0x000000, 0.45);
    this.vignette.fillRect(0, 0, w, topInset);
    this.vignette.fillRect(0, h - bottomInset, w, bottomInset);

    this.flashGfx.setPosition(w / 2, h / 2);
    this.flashGfx.setSize(w, h);
  }

  shake(intensity, duration) {
    this.scene.cameras.main.shake(duration, intensity);
  }

  flash(color, alpha = 0.3) {
    this.flashGfx.setFillStyle(color, alpha);
    this.scene.tweens.add({
      targets: this.flashGfx,
      alpha: { from: alpha, to: 0 },
      duration: 220,
    });
  }

  burst(x, y, color, count = 12) {
    this.particles.setParticleTint(color);
    this.particles.explode(count, x, y);
  }

  update(level, delta) {
    this.glitchTimer += delta;
    const cam = this.scene.cameras.main;
    const glitchChance = Math.min(0.02, 0.002 + level * 0.001);
    if (Math.random() < glitchChance) {
      cam.setScroll(cam.scrollX + Phaser.Math.Between(-4, 4), cam.scrollY);
      this.flash(0xff0044, 0.08);
    }
  }

  destroy() {
    this.scene.scale.off('resize', this.drawOverlays, this);
  }
}
