import Phaser from 'phaser';
import { gameConfig } from './config/gameConfig.js';

const game = new Phaser.Game(gameConfig);

let resizeTimer;
const refreshScale = () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    if (game.scale) game.scale.refresh();
  }, 80);
};

window.addEventListener('resize', refreshScale);
window.addEventListener('orientationchange', () => setTimeout(refreshScale, 150));

if (window.visualViewport) {
  window.visualViewport.addEventListener('resize', refreshScale);
  window.visualViewport.addEventListener('scroll', refreshScale);
}
