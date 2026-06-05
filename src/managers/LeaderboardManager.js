const STORAGE_KEY = 'patternPrinceLeaderboard';

export class LeaderboardManager {
  constructor() {
    this.data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{"bestScore":0,"longestDistance":0,"highestLevel":0}');
  }

  update({ score, distance, level }) {
    let changed = false;
    if (score > this.data.bestScore) { this.data.bestScore = score; changed = true; }
    if (distance > this.data.longestDistance) { this.data.longestDistance = distance; changed = true; }
    if (level > this.data.highestLevel) { this.data.highestLevel = level; changed = true; }
    if (changed) localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    return this.data;
  }

  get() {
    return { ...this.data };
  }
}
