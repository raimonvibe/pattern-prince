export class AudioManager {
  constructor(scene) {
    this.scene = scene;
    this.ctx = null;
    this.musicGain = null;
    this.sfxGain = null;
    this.musicTimer = null;
    this.musicStep = 0;
    this.intensity = 1;
    this.enabled = true;
    this.musicOn = true;
    this.initialized = false;
  }

  init() {
    if (this.initialized) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    this.ctx = new AC();
    this.musicGain = this.ctx.createGain();
    this.sfxGain = this.ctx.createGain();
    this.musicGain.gain.value = 0.08;
    this.sfxGain.gain.value = 0.18;
    this.musicGain.connect(this.ctx.destination);
    this.sfxGain.connect(this.ctx.destination);
    this.initialized = true;
  }

  async unlock() {
    this.init();
    if (this.ctx?.state === 'suspended') await this.ctx.resume();
    if (this.musicOn && !this.musicTimer) this.startMusic();
  }

  setIntensity(level) {
    this.intensity = 1 + level * 0.08;
    if (this.musicGain) this.musicGain.gain.value = Math.min(0.14, 0.06 + level * 0.004);
  }

  tone(freq, dur, type = 'square', vol = 0.2, dest = 'sfx', sweep = 0) {
    if (!this.enabled || !this.ctx) return;
    const gainNode = dest === 'music' ? this.musicGain : this.sfxGain;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
    if (sweep) osc.frequency.exponentialRampToValueAtTime(freq * sweep, this.ctx.currentTime + dur);
    g.gain.setValueAtTime(vol, this.ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + dur);
    osc.connect(g).connect(gainNode);
    osc.start();
    osc.stop(this.ctx.currentTime + dur);
  }

  startMusic() {
    if (!this.musicOn || this.musicTimer) return;
    const bass = [55, 55, 49, 44, 55, 55, 62, 49];
    const lead = [220, 262, 330, 392, 330, 262, 440, 392];
    this.musicTimer = setInterval(() => {
      if (!this.enabled || !this.ctx) return;
      const i = this.musicStep % 8;
      const tempo = Math.max(120, 280 - this.intensity * 20);
      this.tone(bass[i] * (1 + this.intensity * 0.02), 0.18, 'sawtooth', 0.07, 'music');
      this.tone(lead[i], 0.12, 'triangle', 0.05, 'music');
      if (this.musicStep % 2 === 0) this.tone(lead[i] * 2, 0.08, 'sine', 0.03, 'music');
      this.musicStep++;
    }, 280);
  }

  stopMusic() {
    if (this.musicTimer) {
      clearInterval(this.musicTimer);
      this.musicTimer = null;
    }
  }

  toggleMusic() {
    this.musicOn = !this.musicOn;
    if (this.musicOn) this.startMusic();
    else this.stopMusic();
    return this.musicOn;
  }

  playJump() { this.tone(520, 0.08, 'square', 0.15); this.tone(780, 0.06, 'sine', 0.1); }
  playCoin(type) {
    if (type === 'diamond') { this.tone(880, 0.1); this.tone(1320, 0.12); this.tone(1760, 0.15); return; }
    if (type === 'dollar') { this.tone(660, 0.08); this.tone(990, 0.1); return; }
    this.tone(440, 0.06); this.tone(660, 0.08);
  }
  playDamage() { this.tone(180, 0.2, 'sawtooth', 0.25, 'sfx', 0.5); }
  playTreasure() {
    [440, 554, 659, 880].forEach((f, i) => setTimeout(() => this.tone(f, 0.12, 'sine', 0.2), i * 80));
  }
  playDash() { this.tone(300, 0.1, 'triangle', 0.2, 'sfx', 2); }
  playLevelUp() {
    [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => this.tone(f, 0.15, 'square', 0.18), i * 100));
  }
  playDeath() { this.tone(110, 0.6, 'sawtooth', 0.2, 'sfx', 0.3); }
  playChest() { this.tone(220, 0.15, 'square', 0.2); this.playTreasure(); }

  destroy() {
    this.stopMusic();
    this.ctx?.close();
  }
}
