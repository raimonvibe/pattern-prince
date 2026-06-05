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
    this.mobileStatsText = scene.add.text(0, 0, '', { ...this.baseStyle, fontSize: '11px', color: '#88ffcc' });

    this.hpBg = scene.add.rectangle(0, 0, 200, 14, 0x111111).setStrokeStyle(2, 0x00ff88);
    this.hpFill = scene.add.rectangle(0, 0, 200, 10, 0x00ff88).setOrigin(0, 0.5);

    this.container.add([
      this.hpBg, this.hpFill,
      this.scoreText, this.levelText, this.distText, this.bestText,
      this.fpsText, this.powerText, this.mobileStatsText,
    ]);

    this.layout();
  }

  layout() {
    const L = getLayout(this.scene);
    const h = L.hud;
    const fs = L.mobile ? 11 : 16;
    const fsSm = L.mobile ? 10 : 13;
    const fsFps = 10;

    this.scoreText.setFontSize(fs);
    this.levelText.setFontSize(fs);
    this.distText.setFontSize(fsSm);
    this.bestText.setFontSize(fsSm);
    this.fpsText.setFontSize(fsFps);
    this.powerText.setFontSize(fsSm);
    this.mobileStatsText.setFontSize(fsSm);

    this.hpBg.setSize(h.hpWidth + 4, h.hpHeight + 4);
    this.hpBg.setPosition(L.w / 2, h.hpY);
    this.hpFill.height = h.hpHeight;
    this.hpFillMax = h.hpWidth;

    if (L.mobile) {
      this.scoreText.setPosition(h.statsLeftX, 6);
      this.levelText.setPosition(h.statsLeftX, 22);
      this.mobileStatsText.setVisible(true).setPosition(h.statsLeftX + 54, 22);
      this.distText.setVisible(false);
      this.bestText.setVisible(false);
      this.fpsText.setVisible(false);
      this.hpBg.setPosition(L.w / 2, 16);
      this.powerText.setPosition(h.rightX, 6).setOrigin(1, 0);
      this.powerText.setWordWrapWidth(Math.floor(L.w * 0.34));
    } else {
      this.scoreText.setPosition(h.statsLeftX, h.statsTopY);
      this.levelText.setPosition(h.statsLeftX, h.statsTopY + h.statsLineH);
      this.distText.setVisible(true).setPosition(h.statsLeftX, h.statsTopY + h.statsLineH * 2);
      this.bestText.setVisible(true).setPosition(h.statsLeftX, h.statsTopY + h.statsLineH * 3);
      this.fpsText.setVisible(true).setPosition(h.rightX, h.fpsY).setOrigin(1, 0);
      this.mobileStatsText.setVisible(false);
      this.powerText.setPosition(h.rightX, h.powerY).setOrigin(1, 0);
      this.powerText.setWordWrapWidth(280);
    }

    this.layoutMetrics = L;
  }

  update(stats, player, powerups, best, fps) {
    if (!this.layoutMetrics) this.layout();
    const L = this.layoutMetrics;

    this.scoreText.setText(`SCORE ${stats.score}`);
    this.levelText.setText(`LVL ${String(stats.level).padStart(2, '0')}`);

    if (L.mobile) {
      this.mobileStatsText.setText(`DIST ${Math.floor(stats.distance)}m  BEST ${best.bestScore}`);
    } else {
      this.distText.setText(`DIST ${Math.floor(stats.distance)}m`);
      this.bestText.setText(`BEST ${best.bestScore}`);
      this.fpsText.setText(`${fps} FPS`);
    }

    const powerLabel = powerups.length ? powerups.join(' · ') : '';
    this.powerText.setText(powerLabel);

    const pct = player.hp / player.maxHp;
    this.hpFill.width = this.hpFillMax * pct;
    this.hpFill.setPosition(L.w / 2 - this.hpFillMax / 2, L.mobile ? 16 : L.hud.hpY);
    this.hpFill.fillColor = pct > 0.5 ? 0x00ff88 : pct > 0.25 ? 0xffcc00 : 0xff0044;
  }
}
