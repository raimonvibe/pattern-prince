import { GAME } from '../data/constants.js';
import { getLayout } from '../ui/UILayout.js';

export class GameOverScene extends Phaser.Scene {
  constructor() {
    super('GameOverScene');
  }

  create(data) {
    this.runData = data || {};
    this.bg = this.add.rectangle(GAME.WIDTH / 2, GAME.HEIGHT / 2, GAME.WIDTH, GAME.HEIGHT, 0x050508, 0.92);

    this.title = this.add.text(0, 0, '// MEMORY LOST', {
      fontFamily: 'Courier New', color: '#ff0044',
    }).setOrigin(0.5);

    this.statsText = this.add.text(0, 0, '', {
      fontFamily: 'Courier New', color: '#00ff88', align: 'center',
    }).setOrigin(0.5);

    this.retryBtnBg = this.add.rectangle(0, 0, 280, 44, 0x001100).setStrokeStyle(2, 0x00ff88).setInteractive({ useHandCursor: true });
    this.retryBtnTxt = this.add.text(0, 0, 'RETRY', { fontFamily: 'Courier New', color: '#00ff88' }).setOrigin(0.5);

    this.menuBtnBg = this.add.rectangle(0, 0, 280, 44, 0x001100).setStrokeStyle(2, 0x00ff88).setInteractive({ useHandCursor: true });
    this.menuBtnTxt = this.add.text(0, 0, 'MAIN MENU', { fontFamily: 'Courier New', color: '#00ff88' }).setOrigin(0.5);

    const retry = () => {
      this.scene.stop('UIScene');
      this.scene.start('GameScene');
      this.scene.launch('UIScene');
    };
    const menu = () => {
      this.scene.stop('UIScene');
      this.scene.start('MainMenuScene');
    };

    [this.retryBtnBg, this.retryBtnTxt].forEach((el) => el.on('pointerdown', retry));
    [this.menuBtnBg, this.menuBtnTxt].forEach((el) => el.on('pointerdown', menu));

    this.scale.on('resize', this.applyLayout, this);
    this.applyLayout();

    this.input.keyboard.once('keydown-SPACE', retry);
  }

  applyLayout() {
    if (!this.sys?.isActive() || !this.title?.active) return;

    const stats = this.runData.stats || { score: 0, level: 1, distance: 0, coinsCollected: 0 };
    const best = this.runData.best || { bestScore: 0 };
    const L = getLayout(this);
    const cx = L.w / 2;

    this.title.setFontSize(L.mobile ? 26 : 36);
    this.title.setPosition(cx, L.mobile ? 56 : 100);

    this.statsText.setFontSize(L.mobile ? 14 : 18);
    this.statsText.setText([
      `SCORE ${Math.floor(stats.score)}`,
      `LEVEL ${stats.level}`,
      `DIST ${Math.floor(stats.distance)}m`,
      `COINS ${stats.coinsCollected}`,
      `BEST ${best.bestScore}`,
    ].join('\n'));
    this.statsText.setPosition(cx, L.mobile ? 140 : 180);
    this.statsText.setWordWrapWidth(L.w - L.pad * 2);

    const btnW = L.btn.width;
    const btnH = L.btn.height;
    const retryY = L.mobile ? 280 : 320;
    const menuY = retryY + btnH + 14;

    this.retryBtnBg.setSize(btnW, btnH).setPosition(cx, retryY);
    this.retryBtnTxt.setFontSize(L.btn.fontSize).setPosition(cx, retryY);
    this.menuBtnBg.setSize(btnW, btnH).setPosition(cx, menuY);
    this.menuBtnTxt.setFontSize(L.btn.fontSize).setPosition(cx, menuY);
  }

  shutdown() {
    this.scale.off('resize', this.applyLayout, this);
  }
}
