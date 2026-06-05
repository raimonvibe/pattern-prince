import Phaser from 'phaser';
import { GAME } from '../data/constants.js';
import { BootScene } from '../scenes/BootScene.js';
import { MainMenuScene } from '../scenes/MainMenuScene.js';
import { GameScene } from '../scenes/GameScene.js';
import { UIScene } from '../scenes/UIScene.js';

import { GameOverScene } from '../scenes/GameOverScene.js';

export const gameConfig = {
  type: Phaser.AUTO,
  width: GAME.WIDTH,
  height: GAME.HEIGHT,
  parent: 'game-container',
  backgroundColor: '#050508',
  pixelArt: true,
  antialias: false,
  roundPixels: true,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: GAME.WIDTH,
    height: GAME.HEIGHT,
    resizeInterval: 250,
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: GAME.GRAVITY },
      debug: false,
    },
  },
  scene: [BootScene, MainMenuScene, GameScene, UIScene, GameOverScene],
  input: {
    activePointers: 3,
  },
  fps: {
    target: 60,
    forceSetTimeOut: true,
  },
};
