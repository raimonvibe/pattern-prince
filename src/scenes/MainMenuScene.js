import { GAME } from '../data/constants.js';
import { LeaderboardManager } from '../managers/LeaderboardManager.js';
import { AudioManager } from '../managers/AudioManager.js';
import { getLayout, isMobileView } from '../ui/UILayout.js';

export class MainMenuScene extends Phaser.Scene {
  constructor() {
    super('MainMenuScene');
  }

  create() {
    this.audio = new AudioManager(this);
    this.leaderboard = new LeaderboardManager();
    this.ui = [];

    this.add.rectangle(GAME.WIDTH / 2, GAME.HEIGHT / 2, GAME.WIDTH, GAME.HEIGHT, 0x050508);

    this.title = this.add.text(0, 0, 'PATTERN PRINCE', {
      fontFamily: 'Courier New, monospace',
      color: '#00ff88',
      stroke: '#004422',
      strokeThickness: 4,
    }).setOrigin(0.5);

    this.subtitle = this.add.text(0, 0, '// RETRO ARCADE DUNGEON RUNNER', {
      fontFamily: 'Courier New', color: '#66cc88',
    }).setOrigin(0.5);

    this.stats = this.add.text(0, 0, '', {
      fontFamily: 'Courier New', color: '#88ffcc',
    }).setOrigin(0.5);

    this.prince = this.add.sprite(0, 0, 'prince-idle-0').setScale(2);
    this.prince.play('prince-idle');

    this.startBtnBg = this.add.rectangle(0, 0, 280, 48, 0x001100).setStrokeStyle(2, 0x00ff88).setInteractive({ useHandCursor: true });
    this.startBtnTxt = this.add.text(0, 0, 'ENTER DUNGEON', { fontFamily: 'Courier New', color: '#00ff88' }).setOrigin(0.5);

    this.musicBtnBg = this.add.rectangle(0, 0, 280, 48, 0x001100).setStrokeStyle(2, 0x00ff88).setInteractive({ useHandCursor: true });
    this.musicBtnTxt = this.add.text(0, 0, 'MUSIC: ON', { fontFamily: 'Courier New', color: '#00ff88' }).setOrigin(0.5);

    this.controlsHint = this.add.text(0, 0, '', {
      fontFamily: 'Courier New', color: '#448866', align: 'center',
    }).setOrigin(0.5);

    this.mobileHint = this.add.text(0, 0, 'Use on-screen buttons to play', {
      fontFamily: 'Courier New', color: '#336655',
    }).setOrigin(0.5);

    this.wireButtons();
    this.scale.on('resize', this.applyLayout, this);
    this.applyLayout();

    this.tweens.add({ targets: this.title, alpha: { from: 0.7, to: 1 }, duration: 900, yoyo: true, repeat: -1 });

    this.input.keyboard.on('keydown-SPACE', () => this.startGame());
    this.input.keyboard.on('keydown-ENTER', () => this.startGame());
  }

  wireButtons() {
    const start = () => { this.audio.unlock(); this.startGame(); };
    const toggleMusic = () => {
      const on = this.audio.toggleMusic();
      this.musicBtnTxt.setText(`MUSIC: ${on ? 'ON' : 'OFF'}`);
    };

    [this.startBtnBg, this.startBtnTxt].forEach((el) => {
      el.on('pointerdown', start);
    });
    [this.musicBtnBg, this.musicBtnTxt].forEach((el) => {
      el.on('pointerdown', toggleMusic);
    });

    this.startBtnBg.on('pointerover', () => { this.startBtnBg.setFillStyle(0x00ff88); this.startBtnTxt.setColor('#001100'); });
    this.startBtnBg.on('pointerout', () => { this.startBtnBg.setFillStyle(0x001100); this.startBtnTxt.setColor('#00ff88'); });
    this.musicBtnBg.on('pointerover', () => { this.musicBtnBg.setFillStyle(0x00ff88); this.musicBtnTxt.setColor('#001100'); });
    this.musicBtnBg.on('pointerout', () => { this.musicBtnBg.setFillStyle(0x001100); this.musicBtnTxt.setColor('#00ff88'); });
  }

  applyLayout() {
    if (!this.sys?.isActive() || !this.title?.active) return;
    const L = getLayout(this);
    const mobile = L.mobile;
    const cx = L.w / 2;
    const best = this.leaderboard.get();

    this.title.setFontSize(mobile ? 28 : 48);
    this.title.setPosition(cx, mobile ? 48 : 100);

    this.subtitle.setFontSize(mobile ? 12 : 16);
    this.subtitle.setPosition(cx, mobile ? 82 : 170);

    this.stats.setFontSize(mobile ? 11 : 14);
    this.stats.setText(`BEST ${best.bestScore}  |  LVL ${best.highestLevel}  |  DIST ${best.longestDistance}`);
    this.stats.setPosition(cx, mobile ? 108 : 230);
    if (mobile) this.stats.setWordWrapWidth(L.w - L.pad * 2);

    this.prince.setPosition(cx, mobile ? 168 : 260);
    this.prince.setScale(mobile ? 1.5 : 2);

    const btnW = mobile ? L.w - L.pad * 2 : 280;
    const btnH = mobile ? 44 : 48;
    const btnFs = mobile ? 15 : 18;
    const startY = mobile ? 248 : 320;
    const musicY = mobile ? startY + btnH + 12 : 390;

    this.startBtnBg.setSize(btnW, btnH).setPosition(cx, startY);
    this.startBtnTxt.setFontSize(btnFs).setPosition(cx, startY);
    this.musicBtnBg.setSize(btnW, btnH).setPosition(cx, musicY);
    this.musicBtnTxt.setFontSize(btnFs).setPosition(cx, musicY);

    this.controlsHint.setFontSize(mobile ? 10 : 13);
    this.controlsHint.setText(mobile
      ? 'Tap ENTER DUNGEON to start'
      : 'A/D Move  |  SPACE Jump  |  SHIFT Dash  |  R Restart');
    this.controlsHint.setPosition(cx, mobile ? musicY + btnH + 18 : 460);
    this.controlsHint.setWordWrapWidth(L.w - L.pad * 2);

    this.mobileHint.setVisible(mobile);
    this.mobileHint.setFontSize(10);
    this.mobileHint.setPosition(cx, mobile ? musicY + btnH + 36 : 490);
  }

  startGame() {
    this.audio.unlock();
    this.scene.start('GameScene');
    this.scene.launch('UIScene');
  }

  shutdown() {
    this.scale.off('resize', this.applyLayout, this);
  }
}
