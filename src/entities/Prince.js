import { GAME } from '../data/constants.js';

export class Prince extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'prince-idle-0');
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setCollideWorldBounds(false);
    this.setScale(2);
    this.setDepth(20);
    this.setDragX(600);
    this.setMaxVelocity(320, 700);
    this.body.setSize(18, 26).setOffset(7, 4);

    this.hp = GAME.MAX_HP;
    this.maxHp = GAME.MAX_HP;
    this.facing = 1;
    this.dashing = false;
    this.dashTimer = 0;
    this.dashCooldown = 0;
    this.invuln = 0;
    this.dead = false;
    this.damageFlash = 0;
    this.lastGroundTime = 0;
    this.coyoteMs = 120;
    this.jumpBuffer = false;
    this.play('prince-idle');
  }

  preUpdate(time, delta) {
    super.preUpdate(time, delta);
  }

  update(input, delta) {
    if (this.dead) return;
    if (this.invuln > 0) this.invuln -= delta;
    if (this.dashCooldown > 0) this.dashCooldown -= delta;

    if (this.dashing) {
      this.dashTimer -= delta;
      this.body.setVelocityX(this.facing * GAME.DASH_SPEED);
      this.body.setVelocityY(0);
      this.anims.play('prince-dash', true);
      if (this.dashTimer <= 0) {
        this.dashing = false;
        this.body.setAllowGravity(true);
      }
      return;
    }

    if (input.left) { this.facing = -1; this.setVelocityX(-GAME.PLAYER_SPEED); }
    else if (input.right) { this.facing = 1; this.setVelocityX(GAME.PLAYER_SPEED); }
    else { this.setVelocityX(0); }
    this.setFlipX(this.facing < 0);

    if (input.jump) this.jumpBuffer = true;

    const onGround = this.body.blocked.down;
    if (onGround) this.lastGroundTime = this.scene.time.now;

    if (this.jumpBuffer && this.canJump()) {
      this.setVelocityY(GAME.JUMP_VELOCITY);
      this.jumpBuffer = false;
      this.scene.audio?.playJump();
    }
    if (!input.jump) this.jumpBuffer = false;

    if (input.dash && this.dashCooldown <= 0 && this.scene.powerups?.useDashCharge()) {
      this.startDash();
    }

    if (!onGround) {
      this.anims.play(this.body.velocity.y < 0 ? 'prince-jump' : 'prince-fall', true);
    } else if (this.body.velocity.x !== 0) {
      this.anims.play('prince-run', true);
    } else {
      this.anims.play('prince-idle', true);
    }

    if (this.damageFlash > 0) {
      this.damageFlash -= delta;
      this.setTint(0xff4466);
    } else {
      this.clearTint();
    }
  }

  canJump() {
    return this.body.blocked.down || (this.scene.time.now - this.lastGroundTime < this.coyoteMs);
  }

  startDash() {
    this.dashing = true;
    this.dashTimer = GAME.DASH_DURATION;
    this.dashCooldown = GAME.DASH_COOLDOWN;
    this.body.setAllowGravity(false);
    this.scene.audio?.playDash();
    this.scene.fx?.shake(0.004, 80);
  }

  takeDamage(amount) {
    if (this.dead || this.invuln > 0 || this.scene.powerups?.isShielded()) return false;
    this.hp = Math.max(0, this.hp - amount);
    this.invuln = 800;
    this.damageFlash = 200;
    this.anims.play('prince-damage', true);
    this.scene.audio?.playDamage();
    this.scene.fx?.shake(0.008, 120);
    this.scene.fx?.flash(0xff0022, 0.25);
    if (this.hp <= 0) this.die();
    return true;
  }

  heal(amount) {
    this.hp = Math.min(this.maxHp, this.hp + amount);
  }

  die() {
    this.dead = true;
    this.anims.play('prince-death', true);
    this.body.setVelocity(0, 0);
    this.body.setAllowGravity(false);
    this.scene.audio?.playDeath();
    this.scene.time.delayedCall(1200, () => this.scene.onPlayerDeath());
  }
}
