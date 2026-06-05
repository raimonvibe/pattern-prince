import { POWERUPS } from '../data/constants.js';

export class PowerupManager {
  constructor(scene) {
    this.scene = scene;
    this.active = {};
    this.timers = {};
    this.dashCharges = 1;
  }

  activate(type) {
    const def = POWERUPS[type];
    if (!def) return;
    if (type === 'dash') {
      this.dashCharges = Math.min(3, this.dashCharges + 1);
      this.scene.events.emit('powerup-changed', this.getActiveList());
      return;
    }
    if (this.timers[type]) this.scene.time.removeEvent(this.timers[type]);
    this.active[type] = def.label;
    this.timers[type] = this.scene.time.delayedCall(def.duration, () => {
      delete this.active[type];
      delete this.timers[type];
      this.scene.events.emit('powerup-changed', this.getActiveList());
    });
    this.scene.events.emit('powerup-changed', this.getActiveList());
  }

  has(type) {
    return Boolean(this.active[type]);
  }

  isShielded() {
    return this.has('shield');
  }

  isFrozen() {
    return this.has('freeze');
  }

  scoreMultiplier() {
    return this.has('double') ? 2 : 1;
  }

  useDashCharge() {
    if (this.dashCharges <= 0) return false;
    this.dashCharges--;
    this.scene.events.emit('powerup-changed', this.getActiveList());
    return true;
  }

  getActiveList() {
    const list = Object.values(this.active);
    if (this.dashCharges > 0) list.push(`DASH x${this.dashCharges}`);
    return list;
  }

  reset() {
    Object.values(this.timers).forEach((t) => this.scene.time.removeEvent(t));
    this.active = {};
    this.timers = {};
    this.dashCharges = 1;
  }
}
