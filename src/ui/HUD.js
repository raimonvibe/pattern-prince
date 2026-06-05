import { getLayout } from './UILayout.js';

export class HUD {
  constructor(scene) {
    this.scene = scene;
    this.baseStyle = {
      fontFamily: 'Courier New, monospace',
      color: '#00ff88',
      stroke: '#003322',
      strokeThickness: 2,
    };
    this.container = scene.add.container(0, 0).setScrollFactor(0).setDepth(800);

    this.scoreText = scene.add.text(0, 0, '', this.baseStyle);
    this.levelText = scene.add.text(0, 0, '', this.baseStyle);
    this.distText = scene.add.text(0, 0, '', this.baseStyle);
    this.bestText = scene.add.text(0, 0, '', { ...this.baseStyle, color: '#88ffcc' });
    this.fpsText = scene.add.text(0, 0, '', { ...this.baseStyle, color: '#66aa88' });
    this.powerText = scene.add.text(0, 0, '', { ...this.baseStyle, color: '#ffcc00' });
    this.mobileMetaText = scene.add.text(0, 0, '', { ...this.baseStyle, color: '#88ffcc' });

    this.hpBg = scene.add.rectangle(0, 0, 200, 14, 0x111111).setStrokeStyle(2, 0x00ff88);
    this.hpFill = scene.add.rectangle(0, 0, 200, 10, 0x00ff88).setOrigin(0, 0.5);

    this.container.add([
      this.hpBg, this.hpFill,
      this.scoreText, this.levelText, this.distText, this.bestText,
      this.fpsText, this.powerText, this.mobileMetaText,
    ]);

    this.layout();
  }

  layout() {
    if (!this.scene?.sys?.isActive() || !this.hpBg?.active) return;
    const L = getLayout(this.scene);
    const h = L.hud;
    const fs = L.mobile ? (L.portrait ? 10 : 11) : 16;
    const fsSm = L.mobile ? 9 : 13;

    this.scoreText.setFontSize(fs);
    this.levelText.setFontSize(fs);
    this.distText.setFontSize(fsSm);
    this.bestText.setFontSize(fsSm);
    this.fpsText.setFontSize(10);
    this.powerText.setFontSize(fsSm);
    this.mobileMetaText.setFontSize(fsSm);

    this.hpFillMax = h.hpWidth;
    this.hpBg.setSize(h.hpWidth + 4, h.hpHeight + 4);
    this.hpFill.setSize(h.hpWidth, h.hpHeight);

    if (L.mobile) {
      // Row 1: score (left) | HP (center) | power (right)
      this.scoreText.setPosition(h.statsLeftX, h.statsTopY);
      this.hpBg.setPosition(L.w / 2, h.hpY);
      this.powerText.setPosition(h.rightX, h.statsTopY).setOrigin(1, 0);
      this.powerText.setWordWrapWidth(Math.floor(L.w * 0.28));

      // Row 2: combined meta line (left) — avoids overlap with controls
      this.levelText.setVisible(false);
      this.mobileMetaText.setVisible(true).setPosition(h.statsLeftX, h.statsRow2Y);
      this.distText.setVisible(false);
      this.bestText.setVisible(false);
      this.fpsText.setVisible(false);
    } else {
      this.scoreText.setPosition(h.statsLeftX, h.statsTopY);
      this.levelText.setVisible(true).setPosition(h.statsLeftX, h.statsTopY + h.statsLineH);
      this.mobileMetaText.setVisible(false);
      this.distText.setVisible(true).setPosition(h.statsLeftX, h.statsTopY + h.statsLineH * 2);
      this.bestText.setVisible(true).setPosition(h.statsLeftX, h.statsTopY + h.statsLineH * 3);
      this.fpsText.setVisible(true).setPosition(h.rightX, h.fpsY).setOrigin(1, 0);
      this.hpBg.setPosition(L.w / 2, h.hpY);
      this.powerText.setPosition(h.rightX, h.powerY).setOrigin(1, 0);
      this.powerText.setWordWrapWidth(280);
    }

    this.layoutMetrics = L;
  }

  update(stats, player, powerups, best, fps) {
    if (!this.layoutMetrics) this.layout();
    const L = this.layoutMetrics;
    const h = L.hud;

    this.scoreText.setText(`SCORE ${Math.floor(stats.score)}`);

    if (L.mobile) {
      this.mobileMetaText.setText(
        `LVL ${String(stats.level).padStart(2, '0')}  DIST ${Math.floor(stats.distance)}m  BEST ${best.bestScore}`,
      );
    } else {
      this.levelText.setText(`LVL ${String(stats.level).padStart(2, '0')}`);
      this.distText.setText(`DIST ${Math.floor(stats.distance)}m`);
      this.bestText.setText(`BEST ${best.bestScore}`);
      this.fpsText.setText(`${fps} FPS`);
    }

    this.powerText.setText(powerups.length ? powerups.join(' · ') : '');

    const pct = player.hp / player.maxHp;
    const fillW = this.hpFillMax * pct;
    this.hpFill.setSize(Math.max(0, fillW), h.hpHeight);
    this.hpFill.setPosition(L.w / 2 - this.hpFillMax / 2, h.hpY);
    this.hpFill.fillColor = pct > 0.5 ? 0x00ff88 : pct > 0.25 ? 0xffcc00 : 0xff0044;
  }
}
