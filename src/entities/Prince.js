import { GAME } from '../data/constants.js';

export class Prince extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'prince-idle-0');
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setCollideWorldBounds(false);
    this.body.setSize(18, 26).setOffset(7, 4);
    this.setDepth(10);
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
    this.play('prince-idle');
    this.healthBar = scene.add.graphics().setDepth(20);
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
      this.drawHealthBar();
      return;
    }

    let vx = 0;
    if (input.left) { vx = -GAME.PLAYER_SPEED; this.facing = -1; }
    if (input.right) { vx = GAME.PLAYER_SPEED; this.facing = 1; }
    this.body.setVelocityX(vx);
    this.setFlipX(this.facing < 0);

    if (input.jump && this.canJump()) {
      this.body.setVelocityY(GAME.JUMP_VELOCITY);
      this.scene.audio?.playJump();
    }

    if (this.body.blocked.down) {
      this.lastGroundTime = this.scene.time.now;
    }

    if (input.dash && this.dashCooldown <= 0 && this.scene.powerups?.useDashCharge()) {
      this.startDash();
    }

    if (!this.body.blocked.down) {
      this.anims.play(this.body.velocity.y < 0 ? 'prince-jump' : 'prince-fall', true);
    } else if (vx !== 0) {
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

    this.drawHealthBar();
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

  drawHealthBar() {
    const g = this.healthBar;
    g.clear();
    const bx = this.x - 20;
    const by = this.y - 28;
    const pct = this.hp / this.maxHp;
    g.fillStyle(0x000000, 0.6);
    g.fillRect(bx - 1, by - 1, 42, 8);
    g.fillStyle(0xff0044, 1);
    g.fillRect(bx, by, 40, 6);
    g.fillStyle(0x00ff88, 1);
    g.fillRect(bx, by, 40 * pct, 6);
  }

  destroy(fromScene) {
    this.healthBar?.destroy();
    super.destroy(fromScene);
  }
}
