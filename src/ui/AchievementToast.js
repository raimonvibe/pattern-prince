import { getLayout } from './UILayout.js';

export class AchievementToast {
  constructor(scene) {
    this.scene = scene;
    this.queue = [];
    this.showing = false;
  }

  show(achievements) {
    this.queue.push(...achievements);
    if (!this.showing) this.next();
  }

  next() {
    if (!this.queue.length) {
      this.showing = false;
      return;
    }
    this.showing = true;
    const a = this.queue.shift();
    const L = getLayout(this.scene);
    const toastW = L.mobile ? L.w - L.pad * 2 : Math.min(420, L.w - 80);
    const toastH = L.mobile ? 52 : 64;
    const y = L.toastY;

    const bg = this.scene.add.rectangle(L.w / 2, y, toastW, toastH, 0x001a00, 0.92)
      .setStrokeStyle(2, 0x00ff88).setScrollFactor(0).setDepth(960);
    const title = this.scene.add.text(L.w / 2, y - (L.mobile ? 8 : 12), `🏆 ${a.title}`, {
      fontFamily: 'Courier New',
      fontSize: L.mobile ? '14px' : '18px',
      color: '#00ff88',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(961);
    const desc = this.scene.add.text(L.w / 2, y + (L.mobile ? 10 : 14), a.desc, {
      fontFamily: 'Courier New',
      fontSize: L.mobile ? '11px' : '13px',
      color: '#88ffaa',
      wordWrap: { width: toastW - 24 },
      align: 'center',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(961);

    this.scene.tweens.add({
      targets: [bg, title, desc],
      alpha: { from: 0, to: 1 },
      duration: 250,
    });
    this.scene.time.delayedCall(2200, () => {
      bg.destroy();
      title.destroy();
      desc.destroy();
      this.next();
    });
  }
}
