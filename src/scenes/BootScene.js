import { PixelArtGenerator } from '../graphics/PixelArtGenerator.js';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  create() {
    PixelArtGenerator.register(this);
    PixelArtGenerator.createAnimations(this);
    this.scene.start('MainMenuScene');
  }
}
