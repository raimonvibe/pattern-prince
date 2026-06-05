const PAL = {
  skin: 0xffcc99,
  skinDark: 0xe8a86a,
  hair: 0x3a2518,
  eye: 0x1a1a2e,
  blue: 0x2266cc,
  blueDark: 0x1144aa,
  blueLight: 0x4488ee,
  gold: 0xffcc00,
  goldDark: 0xcc9900,
  white: 0xffffff,
  boot: 0x222244,
  cape: 0x1133aa,
  ghost: 0xaaddff,
  ghostEye: 0x224466,
  knight: 0x882222,
  knightArmor: 0xaaaaaa,
  beast: 0xff2266,
  beastEye: 0xffff00,
};

function px(g, x, y, w, h, color) {
  g.fillStyle(color, 1);
  g.fillRect(x, y, w, h);
}

function drawPrinceFrame(g, frame) {
  g.clear();
  const ox = 4;
  const oy = 2;
  const legOffset = frame === 1 ? 1 : frame === 3 ? -1 : 0;
  const armSwing = frame === 1 ? -1 : frame === 3 ? 1 : 0;
  const isJump = frame === 10;
  const isFall = frame === 11;
  const isDash = frame === 12;
  const isDamage = frame === 13;
  const isDeath = frame === 14;
  const isIdle = frame === 0 || frame === 15;

  if (isDeath) {
    px(g, ox + 4, oy + 18, 16, 4, PAL.blue);
    px(g, ox + 6, oy + 14, 12, 4, PAL.blueDark);
    px(g, ox + 8, oy + 10, 8, 4, PAL.skin);
    px(g, ox + 6, oy + 6, 12, 4, PAL.gold);
    return;
  }

  const bodyY = isJump ? oy + 2 : isFall ? oy + 6 : isDash ? oy + 8 : oy + 8;
  const legY = isJump ? oy + 18 : isFall ? oy + 20 : oy + 20;

  px(g, ox + 6 + legOffset, legY, 4, 6, PAL.boot);
  px(g, ox + 14 - legOffset, legY, 4, 6, PAL.boot);
  px(g, ox + 6, bodyY + 4, 12, 10, PAL.blue);
  px(g, ox + 8, bodyY + 6, 8, 6, PAL.blueLight);
  px(g, ox + 4, bodyY + 6 + armSwing, 3, 8, PAL.blueDark);
  px(g, ox + 17 - armSwing, bodyY + 6, 3, 8, PAL.blueDark);
  px(g, ox + 2, bodyY + 8, 3, 10, PAL.cape);
  px(g, ox + 7, bodyY - 2, 10, 8, PAL.skin);
  px(g, ox + 8, bodyY, 8, 2, PAL.eye);
  px(g, ox + 9, bodyY + 1, 2, 1, PAL.white);
  px(g, ox + 13, bodyY + 1, 2, 1, PAL.white);
  px(g, ox + 8, bodyY + 4, 6, 1, PAL.skinDark);
  px(g, ox + 6, bodyY - 6, 12, 4, PAL.gold);
  px(g, ox + 8, bodyY - 8, 8, 2, PAL.goldDark);
  px(g, ox + 10, bodyY - 10, 4, 2, PAL.gold);

  if (isDash) {
    px(g, ox - 2, bodyY + 8, 6, 2, 0x44aaff);
    px(g, ox - 4, bodyY + 12, 4, 2, 0x2266cc);
  }
  if (isDamage) {
    px(g, ox + 4, bodyY, 16, 16, 0xff0044);
    g.fillStyle(0xff0044, 0.35);
    g.fillRect(ox, oy, 24, 28);
  }
  if (isIdle && frame === 15) {
    px(g, ox + 10, bodyY + 3, 2, 1, PAL.white);
  }
}

function drawEnemyFrame(g, type, frame) {
  g.clear();
  const ox = 4;
  const oy = 4;
  if (type === 'ghost') {
    px(g, ox + 4, oy + 2, 16, 14, PAL.ghost);
    px(g, ox + 6, oy + 8, 4, 4, PAL.ghostEye);
    px(g, ox + 14, oy + 8, 4, 4, PAL.ghostEye);
    px(g, ox + 4, oy + 16 + (frame % 2), 4, 4, PAL.ghost);
    px(g, ox + 10, oy + 16 - (frame % 2), 4, 4, PAL.ghost);
    px(g, ox + 16, oy + 16, 4, 4, PAL.ghost);
  } else if (type === 'knight') {
    px(g, ox + 6, oy + 14, 4, 8, PAL.knightArmor);
    px(g, ox + 14, oy + 14, 4, 8, PAL.knightArmor);
    px(g, ox + 4, oy + 4, 16, 12, PAL.knight);
    px(g, ox + 6, oy + 2, 12, 6, PAL.knightArmor);
    px(g, ox + 8, oy + 8, 3, 3, 0x111111);
    px(g, ox + 13, oy + 8, 3, 3, 0x111111);
    px(g, ox + 18, oy + 8, 2, 12, 0xcccccc);
  } else {
    px(g, ox + 2, oy + 8, 20, 12, PAL.beast);
    px(g, ox + 4, oy + 4, 16, 8, PAL.beast);
    px(g, ox + 6, oy + 6, 4, 4, PAL.beastEye);
    px(g, ox + 14, oy + 6, 4, 4, PAL.beastEye);
    px(g, ox + 0, oy + 10, 4, 4, PAL.beast);
    px(g, ox + 20, oy + 10, 4, 4, PAL.beast);
    px(g, ox + 8, oy + 20, 4, 4, PAL.beast);
    px(g, ox + 14, oy + 20, 4, 4, PAL.beast);
  }
}

function drawCoinFrame(g, type, frame) {
  g.clear();
  const colors = { gold: 0xffd700, dollar: 0x44ff88, diamond: 0x66ccff };
  const c = colors[type] || 0xffd700;
  const w = frame % 4 === 0 ? 14 : frame % 4 === 2 ? 6 : 10;
  px(g, 16 - w / 2, 6, w, 16, c);
  px(g, 16 - w / 2 + 2, 8, Math.max(2, w - 4), 12, 0xffffff);
  g.fillStyle(c, 0.4);
  g.fillCircle(16, 14, 10 + (frame % 2));
  if (type === 'dollar') {
    g.fillStyle(0x003311, 1);
    g.fillRect(14, 10, 4, 8);
  }
  if (type === 'diamond') {
    g.fillStyle(0xffffff, 0.8);
    g.fillTriangle(16, 4, 10, 14, 22, 14);
  }
}

function drawChestFrame(g, open) {
  g.clear();
  px(g, 4, 12, 24, 14, 0x8b4513);
  px(g, 6, 14, 20, 10, 0xa0522d);
  px(g, 4, 10, 24, 4, 0x654321);
  px(g, 14, 16, 4, 4, PAL.gold);
  if (open) {
    px(g, 4, 4, 24, 8, 0x654321);
    g.fillStyle(PAL.gold, 0.6);
    g.fillCircle(16, 8, 6);
  }
}

function drawPlatform(g, type) {
  g.clear();
  const colors = {
    stone: [0x444455, 0x666677, 0x333344],
    crystal: [0x4466aa, 0x88aaff, 0x224488],
    corrupted: [0x661122, 0xaa2244, 0x440011],
    moving: [0x556655, 0x779977, 0x334433],
    disappearing: [0x555566, 0x777788, 0x333344],
  };
  const c = colors[type] || colors.stone;
  px(g, 0, 8, 64, 8, c[0]);
  px(g, 2, 6, 60, 4, c[1]);
  px(g, 0, 16, 64, 4, c[2]);
  if (type === 'crystal') {
    g.fillStyle(0xaaccff, 0.5);
    g.fillTriangle(16, 0, 8, 8, 24, 8);
    g.fillTriangle(48, 0, 40, 8, 56, 8);
  }
}

function drawHazard(g, type, frame) {
  g.clear();
  if (type === 'spike') {
    g.fillStyle(0xcccccc, 1);
    g.fillTriangle(8, 20, 0, 20, 4, 4);
    g.fillTriangle(16, 20, 8, 20, 12, 4);
    g.fillTriangle(24, 20, 16, 20, 20, 4);
  } else if (type === 'fire') {
    const f = frame % 3;
    g.fillStyle(0xff4400, 1);
    g.fillEllipse(16, 16, 14, 10 + f * 2);
    g.fillStyle(0xffaa00, 1);
    g.fillEllipse(16, 18, 8, 6 + f);
  } else if (type === 'barrier') {
    g.fillStyle(0xff0022, 0.8);
    g.fillRect(0, 0, 8, 32);
    g.fillStyle(0xff6688, 0.4);
    g.fillRect(2, 2, 4, 28);
  } else if (type === 'block') {
    g.fillStyle(0x886644, 1);
    g.fillRect(2, 2, 28, 28);
    g.fillStyle(0xaa8866, 1);
    g.fillRect(4, 4, 24, 6);
  } else if (type === 'laser') {
    g.fillStyle(0xff0044, 0.3 + (frame % 2) * 0.3);
    g.fillRect(0, 14, 64, 4);
    g.fillStyle(0xffffff, 0.8);
    g.fillRect(0, 15, 64, 2);
  }
}

export class PixelArtGenerator {
  static register(scene) {
    const g = scene.make.graphics({ x: 0, y: 0, add: false });

    for (let i = 0; i < 16; i++) drawPrinceFrame(g, i);
    for (let i = 0; i < 16; i++) {
      drawPrinceFrame(g, i === 0 ? 0 : i <= 4 ? i : i === 5 ? 10 : i === 6 ? 11 : i === 7 ? 12 : i === 8 ? 13 : i === 9 ? 14 : i <= 13 ? ((i - 10) % 4) + 1 : 15);
      g.generateTexture(`prince-${i}`, 32, 32);
      g.clear();
    }

    const animMap = [
      ['prince-idle-0', 0], ['prince-idle-1', 15],
      ['prince-run-0', 1], ['prince-run-1', 2], ['prince-run-2', 3], ['prince-run-3', 4],
      ['prince-jump', 10], ['prince-fall', 11], ['prince-dash', 12],
      ['prince-damage', 13], ['prince-death', 14],
    ];
    animMap.forEach(([key, frame]) => {
      drawPrinceFrame(g, frame);
      g.generateTexture(key, 32, 32);
      g.clear();
    });

    ['ghost', 'knight', 'beast'].forEach((type) => {
      for (let f = 0; f < 4; f++) {
        drawEnemyFrame(g, type, f);
        g.generateTexture(`enemy-${type}-${f}`, 32, 32);
        g.clear();
      }
    });

    ['gold', 'dollar', 'diamond'].forEach((type) => {
      for (let f = 0; f < 8; f++) {
        drawCoinFrame(g, type, f);
        g.generateTexture(`coin-${type}-${f}`, 32, 32);
        g.clear();
      }
    });

    drawChestFrame(g, false);
    g.generateTexture('chest-closed', 32, 32);
    g.clear();
    drawChestFrame(g, true);
    g.generateTexture('chest-open', 32, 32);
    g.clear();

    ['stone', 'crystal', 'corrupted', 'moving', 'disappearing'].forEach((type) => {
      drawPlatform(g, type);
      g.generateTexture(`platform-${type}`, 64, 20);
      g.clear();
    });

    ['spike', 'fire', 'barrier', 'block', 'laser'].forEach((type) => {
      for (let f = 0; f < 4; f++) {
        drawHazard(g, type, f);
        g.generateTexture(`hazard-${type}-${f}`, type === 'laser' ? 64 : 32, 32);
        g.clear();
      }
    });

    g.destroy();
  }

  static createAnimations(scene) {
    scene.anims.create({
      key: 'prince-idle',
      frames: [{ key: 'prince-idle-0' }, { key: 'prince-idle-1' }],
      frameRate: 3,
      repeat: -1,
    });
    scene.anims.create({
      key: 'prince-run',
      frames: ['prince-run-0', 'prince-run-1', 'prince-run-2', 'prince-run-3'].map((k) => ({ key: k })),
      frameRate: 10,
      repeat: -1,
    });
    scene.anims.create({
      key: 'prince-jump',
      frames: [{ key: 'prince-jump' }],
      frameRate: 1,
    });
    scene.anims.create({
      key: 'prince-fall',
      frames: [{ key: 'prince-fall' }],
      frameRate: 1,
    });
    scene.anims.create({
      key: 'prince-dash',
      frames: [{ key: 'prince-dash' }],
      frameRate: 1,
    });
    scene.anims.create({
      key: 'prince-damage',
      frames: [{ key: 'prince-damage' }],
      frameRate: 1,
    });
    scene.anims.create({
      key: 'prince-death',
      frames: [{ key: 'prince-death' }],
      frameRate: 1,
    });

    ['ghost', 'knight', 'beast'].forEach((type) => {
      scene.anims.create({
        key: `enemy-${type}`,
        frames: [0, 1, 2, 3].map((f) => ({ key: `enemy-${type}-${f}` })),
        frameRate: 6,
        repeat: -1,
      });
    });

    ['gold', 'dollar', 'diamond'].forEach((type) => {
      scene.anims.create({
        key: `coin-${type}`,
        frames: [0, 1, 2, 3, 4, 5, 6, 7].map((f) => ({ key: `coin-${type}-${f}` })),
        frameRate: 10,
        repeat: -1,
      });
    });

    ['spike', 'fire', 'barrier', 'block', 'laser'].forEach((type) => {
      scene.anims.create({
        key: `hazard-${type}`,
        frames: [0, 1, 2, 3].map((f) => ({ key: `hazard-${type}-${f}` })),
        frameRate: type === 'fire' || type === 'laser' ? 8 : 4,
        repeat: -1,
      });
    });
  }
}
