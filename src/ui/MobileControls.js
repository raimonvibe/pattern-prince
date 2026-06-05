import { getLayout, isMobileView } from './UILayout.js';

export class MobileControls {
  constructor(scene) {
    this.scene = scene;
    this.input = { left: false, right: false };
    this.jumpPulse = false;
    this.dashPulse = false;
    this.buttons = [];
    this.container = scene.add.container(0, 0).setScrollFactor(0).setDepth(850);

    this.buildControls();
    this.updateVisibility();
    this.layout();
  }

  buildControls() {
    const defs = [
      { label: '◀', key: 'left', aria: 'Move left' },
      { label: '▶', key: 'right', aria: 'Move right' },
      { label: '⚡', key: 'dash', aria: 'Dash' },
      { label: '▲', key: 'jump', aria: 'Jump' },
    ];

    defs.forEach(({ label, key }) => {
      const bg = this.scene.add.circle(0, 0, 28, 0x001100, 0.6).setStrokeStyle(2, 0x00ff88);
      const txt = this.scene.add.text(0, 0, label, { fontSize: '20px', color: '#00ff88' }).setOrigin(0.5);
      bg.setInteractive({ useHandCursor: true });
      txt.setInteractive({ useHandCursor: true });

      const press = (pointer) => {
        pointer.event?.stopPropagation?.();
        if (key === 'jump') this.jumpPulse = true;
        else if (key === 'dash') this.dashPulse = true;
        else this.input[key] = true;
        bg.setFillStyle(0x00ff88, 0.85);
        txt.setColor('#001100');
        this.scene.scene.get('GameScene')?.audio?.unlock?.();
      };
      const release = () => {
        if (key === 'left' || key === 'right') this.input[key] = false;
        bg.setFillStyle(0x001100, 0.6);
        txt.setColor('#00ff88');
      };

      [bg, txt].forEach((el) => {
        el.on('pointerdown', press);
        el.on('pointerup', release);
        el.on('pointerout', release);
      });

      this.container.add([bg, txt]);
      this.buttons.push({ bg, txt, key });
    });
  }

  updateVisibility() {
    this.visible = isMobileView(this.scene);
    this.container.setVisible(this.visible);
  }

  layout() {
    if (!this.visible) return;
    const L = getLayout(this.scene);
    if (!L.controls) return;

    const [leftBtn, rightBtn, dashBtn, jumpBtn] = this.buttons;
    const [l1, l2] = L.controls.left;
    const dashDef = L.controls.right[0];
    const jumpDef = L.controls.right[1];

    this.placeButton(leftBtn, l1.x, l1.y, l1.size, '18px');
    this.placeButton(rightBtn, l2.x, l2.y, l2.size, '18px');
    this.placeButton(dashBtn, dashDef.x, dashDef.y, dashDef.size, '15px');
    this.placeButton(jumpBtn, jumpDef.x, jumpDef.y, jumpDef.size, '22px');
  }

  placeButton(btn, x, y, size, fontSize = '20px') {
    btn.bg.setPosition(x, y);
    btn.bg.setRadius(size / 2);
    btn.txt.setPosition(x, y);
    btn.txt.setFontSize(fontSize);
  }

  getInput() {
    if (!this.visible) return { left: false, right: false, jump: false, dash: false };
    const jump = this.jumpPulse;
    const dash = this.dashPulse;
    this.jumpPulse = false;
    this.dashPulse = false;
    return { left: this.input.left, right: this.input.right, jump, dash };
  }

  destroy() {
    this.container?.destroy();
  }
}
