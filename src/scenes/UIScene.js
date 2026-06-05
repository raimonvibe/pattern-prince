import { HUD } from '../ui/HUD.js';
import { MobileControls } from '../ui/MobileControls.js';
import { AchievementToast } from '../ui/AchievementToast.js';

export class UIScene extends Phaser.Scene {
  constructor() {
    super('UIScene');
  }

  create() {
    this.hud = new HUD(this);
    this.toast = new AchievementToast(this);
    this.mobile = new MobileControls(this);
    this.registry.set('mobileInput', { left: false, right: false, jump: false, dash: false });

    this.scale.on('resize', this.applyLayout, this);
    this.events.on('resume', () => this.scene.bringToTop());
    this.applyLayout();
  }

  applyLayout() {
    if (!this.sys?.isActive() || !this.hud) return;
    this.hud?.layout();
    this.mobile?.layout();
  }

  update() {
    const stats = this.registry.get('gameStats');
    const player = this.registry.get('player');
    const powerups = this.registry.get('powerups') || [];
    const best = this.registry.get('leaderboard') || { bestScore: 0 };
    const newAch = this.registry.get('newAchievements');

    if (newAch?.length) {
      this.toast.show(newAch);
      this.registry.set('newAchievements', null);
    }

    if (stats && player) {
      this.hud.update(stats, player, powerups, best, Math.round(this.game.loop.actualFps));
    }

    if (this.mobile?.visible) {
      this.registry.set('mobileInput', this.mobile.getInput());
    }
  }

  shutdown() {
    this.scale.off('resize', this.applyLayout, this);
  }
}
