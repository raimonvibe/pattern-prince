/**
 * Keyboard + mobile input in one place (Phaser platformer pattern: isolate input from physics).
 */
export class InputController {
  constructor(scene) {
    this.scene = scene;
    this.mobileJumpQueued = false;
    this.mobileDashQueued = false;
    this.keys = scene.input.keyboard.addKeys({
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
      jump: Phaser.Input.Keyboard.KeyCodes.SPACE,
      dash: Phaser.Input.Keyboard.KeyCodes.SHIFT,
      restart: Phaser.Input.Keyboard.KeyCodes.R,
      arrowL: Phaser.Input.Keyboard.KeyCodes.LEFT,
      arrowR: Phaser.Input.Keyboard.KeyCodes.RIGHT,
      arrowU: Phaser.Input.Keyboard.KeyCodes.UP,
    });
    scene.input.keyboard.on('keydown-R', () => scene.restart?.());
  }

  poll(registry) {
    const mobile = registry.get('mobileInput') || {};
    if (mobile.jump) {
      this.mobileJumpQueued = true;
      mobile.jump = false;
      registry.set('mobileInput', mobile);
    }
    if (mobile.dash) {
      this.mobileDashQueued = true;
      mobile.dash = false;
      registry.set('mobileInput', mobile);
    }
    const jump = Phaser.Input.Keyboard.JustDown(this.keys.jump)
      || Phaser.Input.Keyboard.JustDown(this.keys.arrowU)
      || this.mobileJumpQueued;
    const dash = Phaser.Input.Keyboard.JustDown(this.keys.dash) || this.mobileDashQueued;
    this.mobileJumpQueued = false;
    this.mobileDashQueued = false;
    return {
      left: this.keys.left.isDown || this.keys.arrowL.isDown || mobile.left,
      right: this.keys.right.isDown || this.keys.arrowR.isDown || mobile.right,
      jump,
      dash,
    };
  }
}
