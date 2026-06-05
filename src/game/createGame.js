import Phaser from 'phaser';
import { GameScene } from './GameScene.js';
import { GAME } from './config.js';

let gameInstance = null;

export function createGame(parent) {
  if (gameInstance) return gameInstance;

  gameInstance = new Phaser.Game({
    type: Phaser.AUTO,
    width: GAME.WIDTH,
    height: GAME.HEIGHT,
    parent,
    backgroundColor: '#050508',
    pixelArt: true,
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: GAME.WIDTH,
      height: GAME.HEIGHT,
    },
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { y: GAME.GRAVITY },
        debug: false,
      },
    },
    scene: [GameScene],
  });

  return gameInstance;
}

export function destroyGame() {
  if (gameInstance) {
    gameInstance.destroy(true);
    gameInstance = null;
  }
}

export function refreshGameScale() {
  if (gameInstance?.scale) gameInstance.scale.refresh();
}
