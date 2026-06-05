import { ACHIEVEMENTS } from '../data/achievements.js';

const STORAGE_KEY = 'patternPrinceAchievements';

export class AchievementManager {
  constructor(scene) {
    this.scene = scene;
    this.unlocked = new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'));
  }

  evaluate(stats) {
    const newly = [];
    ACHIEVEMENTS.forEach((a) => {
      if (!this.unlocked.has(a.id) && a.check(stats)) {
        this.unlocked.add(a.id);
        newly.push(a);
      }
    });
    if (newly.length) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...this.unlocked]));
    }
    return newly;
  }

  getAll() {
    return ACHIEVEMENTS.map((a) => ({ ...a, unlocked: this.unlocked.has(a.id) }));
  }
}
