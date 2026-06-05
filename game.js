const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const W = canvas.width, H = canvas.height;

let level = 1, score = 0, collected = 0, lives = 3, gameOver = false, started = false;
let highScore = localStorage.getItem('prHighScore') || 0;
let musicPlaying = true;

const player = { x: 80, y: 300, w: 28, h: 42, vx: 0, vy: 0, speed: 5.5, jump: -16.5, grounded: false, facing: 1, rolling: false, rollTime: 0, attacking: false, attackTime: 0 };

let platforms = [], enemies = [], spikes = [], specimens = [], door = {x:0, y:0, w:40, h:60};
const keys = {};

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
let musicInterval = null;

// Enhanced Sound Effects
function playSound(freq, duration = 50, type = 'square', volume = 0.2, sweep = 0) {
const osc = audioCtx.createOscillator();
const gain = audioCtx.createGain();
osc.type = type;
osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
if (sweep) osc.frequency.linearRampToValueAtTime(freq * sweep, audioCtx.currentTime + duration/1000);
gain.gain.value = volume;
osc.connect(gain).connect(audioCtx.destination);
osc.start();
setTimeout(() => osc.stop(), duration);
}

// Background Music (chiptune-style loop)
function startBackgroundMusic() {
if (musicInterval) clearInterval(musicInterval);
let note = 0;
const melody = [220, 330, 440, 330, 220, 392, 523, 392]; // simple retro melody
musicInterval = setInterval(() => {
if (!musicPlaying || gameOver) return;
playSound(melody[note % melody.length], 120, 'sawtooth', 0.12);
playSound(melody[(note + 2) % melody.length] * 1.5, 80, 'triangle', 0.08); // harmony
note++;
// Increase tempo slightly with level
if (note % 8 === 0) clearInterval(musicInterval); // restart faster
}, Math.max(140, 220 - level * 8));
}

function toggleMusic() {
musicPlaying = !musicPlaying;
if (!musicPlaying && musicInterval) clearInterval(musicInterval);
else if (started) startBackgroundMusic();
}

// Specific Game Sounds
function jumpSound() { playSound(680, 60, 'square', 0.25); playSound(920, 40, 'sine', 0.15); }
function attackSound() { playSound(920, 80, 'sawtooth', 0.3, 0.7); }
function rollSound() { playSound(180, 120, 'triangle', 0.25); }
function collectSound() { playSound(660, 40, 'sine'); playSound(880, 80, 'sine', 0.25); }
function hitEnemySound() { playSound(1200, 100, 'square', 0.3); playSound(800, 60, 'sawtooth'); }
function spikeDeathSound() { playSound(140, 400, 'triangle', 0.4); }
function levelUpSound() {
playSound(440, 100); playSound(660, 100); playSound(880, 100); playSound(1200, 300, 'sine', 0.3);
}
function gameOverSound() { playSound(320, 600, 'sawtooth', 0.25); }

// Procedural level generator (unchanged from before)
function generateLevel() {
platforms = [{x:0, y:H-60, w:W, h:60}];
enemies = []; spikes = []; specimens = [];

const numPlatforms = 6 + level;
for (let i = 0; i < numPlatforms; i++) {
const px = 80 + Math.random() * (W - 200);
const py = 100 + Math.random() * (H - 250);
platforms.push({x: px, y: py, w: 120 + Math.random()*80, h: 18});
}

for (let i = 0; i < 2 + Math.floor(level/2); i++) {
enemies.push({x: 200 + i*220, y: 200, w: 26, h: 36, vx: 2.2 + level*0.2, dir: 1});
}

for (let i = 0; i < 5 + level; i++) {
spikes.push({x: 150 + i*110, y: H-85, w: 28, h: 22});
}

for (let i = 0; i < 4 + Math.floor(level/2); i++) {
specimens.push({x: Math.random()*(W-100)+50, y: Math.random()*(H-200)+80, w:22, h:22, collected:false, char: String.fromCharCode(33 + Math.floor(Math.random()*90)) });
}

door.x = W - 120; door.y = H - 160;
}

function startGame() {
document.getElementById('start-screen').style.display = 'none';
started = true;
level = 1; score = 0; collected = 0; lives = 3; gameOver = false;
generateLevel();
player.x = 80; player.y = 200;
startBackgroundMusic();
loop();
}

function restartGame() {
document.getElementById('game-over').style.display = 'none';
startGame();
}

function shareOnX() {
const text = `I escaped deeper into the PATTERN RETRIEVAL dungeon! LVL ${level} • Score ${score} • Prince run 🔥 @adamilenich #PatternRetrieval`;
window.open(`https://x.com/intent/tweet?text=${encodeURIComponent(text)}`);
}

// Input
window.addEventListener('keydown', e => keys[e.key] = true);
window.addEventListener('keyup', e => keys[e.key] = false);

function loop() {
if (!started || gameOver) return;
update();
render();
requestAnimationFrame(loop);
}

function update() {
if (player.rolling) player.rollTime--;
if (player.attacking) player.attackTime--;

player.vx = 0;
if (keys['ArrowLeft'] || keys['a']) { player.vx = -player.speed; player.facing = -1; }
if (keys['ArrowRight'] || keys['d']) { player.vx = player.speed; player.facing = 1; }

if ((keys['ArrowDown'] || keys['s']) && player.grounded && !player.rolling) {
player.rolling = true; player.rollTime = 18; player.vx *= 2.2;
rollSound();
}

if ((keys[' '] || keys['ArrowUp']) && player.grounded) {
player.vy = player.jump;
player.grounded = false;
jumpSound();
}

if (keys['z'] && !player.attacking) {
player.attacking = true; player.attackTime = 12;
attackSound();
}

player.vy += 0.85;
player.x += player.vx;
player.y += player.vy;

player.grounded = false;
platforms.forEach(p => {
if (collides(player, p) && player.vy > 0) {
player.y = p.y - player.h;
player.vy = 0;
player.grounded = true;
}
});

if (player.x < 0) player.x = 0;
if (player.x > W - player.w) player.x = W - player.w;
if (player.y > H) die();

// Enemies
enemies.forEach((e, i) => {
e.x += e.vx * e.dir;
if (e.x < 50 || e.x > W - 80) e.dir *= -1;

if (player.attacking && Math.abs(player.x - e.x) < 60 && Math.abs(player.y - e.y) < 50) {
enemies.splice(i, 1);
score += 250;
hitEnemySound();
} else if (collides(player, e) && !player.rolling) {
die();
}
});

spikes.forEach(s => { if (collides(player, s)) die(); });

specimens.forEach((s, i) => {
if (!s.collected && collides(player, s)) {
s.collected = true;
collected++;
score += 180;
collectSound();
document.getElementById('collected').textContent = collected;
}
});

if (collected >= specimens.length && collides(player, door)) {
level++;
score += 1000;
document.getElementById('level').textContent = String(level).padStart(2, '0');
levelUpSound();
generateLevel();
player.x = 80;
collected = 0;
document.getElementById('collected').textContent = 0;
startBackgroundMusic(); // faster music
}

document.getElementById('score').textContent = score;
document.getElementById('lives').textContent = lives;
}

function collides(a, b) {
return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function die() {
lives--;
spikeDeathSound();
if (lives <= 0) {
gameOver = true;
if (score > highScore) {
highScore = score;
localStorage.setItem('prHighScore', highScore);
}
document.getElementById('final-stats').innerHTML = `FINAL SCORE ${score}<br>LEVEL ${level}<br>HIGH ${highScore}`;
document.getElementById('game-over').style.display = 'flex';
if (musicInterval) clearInterval(musicInterval);
} else {
player.x = 80; player.y = 200; player.vx = player.vy = 0;
}
}

function render() {
ctx.fillStyle = '#0a0a0a';
ctx.fillRect(0, 0, W, H);

ctx.fillStyle = '#0f0';
platforms.forEach(p => {
ctx.fillRect(p.x, p.y, p.w, p.h);
ctx.fillStyle = '#0a0'; ctx.fillRect(p.x+4, p.y+6, p.w-8, 4); ctx.fillStyle = '#0f0';
});

ctx.fillStyle = '#ff0';
ctx.fillRect(door.x, door.y, door.w, door.h);
ctx.fillStyle = '#000'; ctx.font = 'bold 18px Courier New'; ctx.fillText('EXIT', door.x+6, door.y+38);

ctx.fillStyle = '#f00';
spikes.forEach(s => ctx.fillRect(s.x, s.y, s.w, s.h));

ctx.font = 'bold 22px Courier New';
ctx.fillStyle = '#ff0';
specimens.forEach(s => {
if (!s.collected) {
ctx.save();
ctx.translate(s.x + 11, s.y + 18);
ctx.fillText(s.char, -8, 8);
ctx.restore();
}
});

ctx.fillStyle = '#f0f';
enemies.forEach(e => ctx.fillRect(e.x, e.y, e.w, e.h));

ctx.fillStyle = player.rolling ? '#0ff' : '#0cf';
ctx.fillRect(player.x, player.y, player.w, player.h);
if (player.attacking) {
ctx.fillStyle = '#ff0';
ctx.fillRect(player.x + (player.facing > 0 ? player.w : -28), player.y + 10, 28, 12);
}

// CRT effects
ctx.fillStyle = 'rgba(0,255,80,0.08)';
for (let i = 0; i < H; i += 3) ctx.fillRect(0, i, W, 1.5);

if (level > 4 && Math.random() < 0.12) {
ctx.fillStyle = 'rgba(255,80,120,0.25)';
ctx.fillRect(Math.random()*W, Math.random()*H*0.6, 120, 40);
}
}

loop();
