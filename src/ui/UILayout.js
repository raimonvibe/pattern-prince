import { GAME } from '../data/constants.js';

export function isMobileView(scene) {
  const touch = scene.sys.game.device.input.touch;
  const display = scene.scale.displaySize;
  const coarse = typeof window !== 'undefined' && window.matchMedia?.('(pointer: coarse)').matches;
  const narrow = display.width < 900 || display.height < 500;
  const portrait = display.height > display.width;
  return touch || coarse || narrow || portrait;
}

export function isPortrait(scene) {
  return scene.scale.displaySize.height > scene.scale.displaySize.width;
}

export function getLayout(scene) {
  const w = GAME.WIDTH;
  const h = GAME.HEIGHT;
  const mobile = isMobileView(scene);
  const portrait = isPortrait(scene);
  const pad = mobile ? 12 : 16;
  const btnSize = mobile ? Math.max(48, Math.min(58, w * 0.1)) : 0;
  const btnSizeLg = mobile ? Math.min(68, btnSize + 10) : 0;
  const btnSizeSm = mobile ? Math.max(44, btnSize - 6) : 0;
  const gap = mobile ? 12 : 0;
  const bottomPad = mobile ? (portrait ? 14 : 10) : 0;
  const controlY = h - bottomPad - btnSizeLg / 2;
  const leftClusterX = pad + btnSize / 2;
  const rightClusterX = w - pad - btnSizeLg / 2;

  // Keep left/right clusters separated — no overlap in center
  const minCenterGap = 120;
  const leftMaxX = leftClusterX + btnSize + gap + btnSize / 2;
  const rightMinX = rightClusterX - btnSizeLg - gap - btnSizeSm;
  const dashX = Math.max(leftMaxX + minCenterGap, rightMinX - btnSizeSm / 2);

  return {
    w,
    h,
    mobile,
    portrait,
    pad,
    bottomReserve: mobile ? btnSizeLg + bottomPad + 16 : 12,
    topBarHeight: mobile ? 44 : 88,
    toastY: mobile ? 52 : 72,
    hud: {
      pad,
      hpWidth: mobile ? (portrait ? 88 : 110) : 200,
      hpHeight: mobile ? 8 : 10,
      hpY: mobile ? 15 : 22,
      statsLeftX: pad,
      statsTopY: mobile ? 6 : 12,
      statsRow2Y: mobile ? 22 : 34,
      statsRow3Y: mobile ? 36 : 56,
      statsLineH: mobile ? 14 : 22,
      rightX: w - pad,
      fpsY: mobile ? 6 : 12,
      powerY: mobile ? 22 : 36,
    },
    controls: mobile
      ? {
          left: [
            { x: leftClusterX, y: controlY, size: btnSize },
            { x: leftClusterX + btnSize + gap, y: controlY, size: btnSize },
          ],
          right: [
            { x: dashX, y: controlY - btnSizeSm * 0.5, size: btnSizeSm, key: 'dash' },
            { x: rightClusterX, y: controlY, size: btnSizeLg, key: 'jump' },
          ],
        }
      : null,
    btn: {
      width: mobile ? w - pad * 2 : 280,
      height: mobile ? 44 : 48,
      fontSize: mobile ? 15 : 18,
    },
  };
}

export function fontSize(scene, desktop, mobile) {
  return `${isMobileView(scene) ? mobile : desktop}px`;
}
