import { GAME } from '../data/constants.js';

export function isMobileView(scene) {
  const touch = scene.sys.game.device.input.touch;
  const display = scene.scale.displaySize;
  return touch || display.height > display.width || display.width < 720;
}

export function getLayout(scene) {
  const w = GAME.WIDTH;
  const h = GAME.HEIGHT;
  const mobile = isMobileView(scene);
  const pad = mobile ? 10 : 16;
  const bottomReserve = mobile ? 108 : 12;
  const btnSize = mobile ? Math.min(56, (w * 0.11)) : 0;
  const btnSizeLg = mobile ? Math.min(64, btnSize + 8) : 0;
  const btnSizeSm = mobile ? Math.min(46, btnSize - 8) : 0;
  const gap = mobile ? 10 : 0;
  const controlY = h - pad - btnSizeLg / 2;
  const leftStart = pad + btnSize / 2;
  const rightStart = w - pad - btnSizeLg / 2;

  return {
    w,
    h,
    mobile,
    pad,
    bottomReserve,
    topBarHeight: mobile ? 40 : 88,
    toastY: mobile ? 48 : 72,
    hud: {
      pad,
      hpWidth: mobile ? 96 : 200,
      hpHeight: mobile ? 7 : 10,
      hpY: mobile ? 16 : 22,
      statsLeftX: pad,
      statsTopY: mobile ? 6 : 12,
      statsLineH: mobile ? 14 : 22,
      rightX: w - pad,
      fpsY: mobile ? 6 : 12,
      powerY: mobile ? 22 : 36,
      showFps: !mobile,
      showBest: !mobile,
      showDistInline: mobile,
    },
    controls: mobile
      ? {
          left: [
            { x: leftStart, y: controlY, size: btnSize },
            { x: leftStart + btnSize + gap, y: controlY, size: btnSize },
          ],
          right: [
            { x: rightStart - btnSizeLg - gap - btnSizeSm, y: controlY - btnSizeSm * 0.55, size: btnSizeSm, key: 'dash' },
            { x: rightStart, y: controlY, size: btnSizeLg, key: 'jump' },
          ],
        }
      : null,
  };
}

export function fontSize(scene, desktop, mobile) {
  return `${isMobileView(scene) ? mobile : desktop}px`;
}
