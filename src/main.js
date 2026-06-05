import Phaser from 'phaser';
import { gameConfig } from './config/gameConfig.js';

const game = new Phaser.Game(gameConfig);

let resizeTimer;
const onResize = () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    if (game.scale) game.scale.refresh();
  }, 100);
};

window.addEventListener('resize', onResize);
window.addEventListener('orientationchange', onResize);
