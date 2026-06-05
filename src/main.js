import Phaser from 'phaser';
import { gameConfig } from './config/gameConfig.js';

const game = new Phaser.Game(gameConfig);

window.addEventListener('resize', () => {
  game.scale.refresh();
});

window.addEventListener('orientationchange', () => {
  setTimeout(() => game.scale.refresh(), 100);
});
