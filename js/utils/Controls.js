// Controls.js - Unified keyboard + touch input for all levels
class Controls {
  constructor(scene) {
    this.scene = scene;
    this.buttons = [];
    this._prevPointerDown = false;
    this._pointerJustDown = false;

    // Track virtual button states
    this._virtualLeft = false;
    this._virtualRight = false;
    this._virtualUp = false;
    this._virtualDown = false;
    this._virtualAttack = false;
    this._virtualSpecial = false;

    // Keyboard: cursor keys
    this.cursors = scene.input.keyboard.createCursorKeys();

    // Keyboard: WASD + SPACE + Z
    this.keys = scene.input.keyboard.addKeys({
      W: Phaser.Input.Keyboard.KeyCodes.W,
      A: Phaser.Input.Keyboard.KeyCodes.A,
      S: Phaser.Input.Keyboard.KeyCodes.S,
      D: Phaser.Input.Keyboard.KeyCodes.D,
      SPACE: Phaser.Input.Keyboard.KeyCodes.SPACE,
      Z: Phaser.Input.Keyboard.KeyCodes.Z
    });

    // Detect touch device
    this.isTouch = scene.sys.game.device.input.touch;

    // Track pointer state each frame for pointerJustDown
    scene.events.on('update', this._updatePointer, this);
  }

  _updatePointer() {
    var pointer = this.scene.input.activePointer;
    var isDown = pointer && pointer.isDown;
    this._pointerJustDown = isDown && !this._prevPointerDown;
    this._prevPointerDown = isDown;
  }

  /**
   * Generate a rounded-rect button texture via Phaser Graphics.
   */
  _makeButtonTexture(key, w, h, color) {
    if (this.scene.textures.exists(key)) return;
    var gfx = this.scene.add.graphics();
    gfx.fillStyle(color, 1);
    gfx.fillRoundedRect(0, 0, w, h, 6);
    // Draw an icon/label inside
    gfx.lineStyle(2, 0xffffff, 0.8);
    if (key === 'btn-left') {
      // Left arrow
      gfx.beginPath();
      gfx.moveTo(w * 0.65, h * 0.2);
      gfx.lineTo(w * 0.3, h * 0.5);
      gfx.lineTo(w * 0.65, h * 0.8);
      gfx.strokePath();
    } else if (key === 'btn-right') {
      // Right arrow
      gfx.beginPath();
      gfx.moveTo(w * 0.35, h * 0.2);
      gfx.lineTo(w * 0.7, h * 0.5);
      gfx.lineTo(w * 0.35, h * 0.8);
      gfx.strokePath();
    } else if (key === 'btn-attack') {
      // "A" circle
      gfx.strokeCircle(w * 0.5, h * 0.5, Math.min(w, h) * 0.3);
    } else if (key === 'btn-special') {
      // "S" star-ish
      gfx.strokeCircle(w * 0.5, h * 0.5, Math.min(w, h) * 0.2);
      gfx.lineStyle(2, 0xffff00, 0.8);
      gfx.strokeCircle(w * 0.5, h * 0.5, Math.min(w, h) * 0.35);
    }
    gfx.generateTexture(key, w, h);
    gfx.destroy();
  }

  /**
   * Create a virtual button sprite and wire up pointer events.
   */
  _createButton(key, x, y, w, h, color, onDown, onUp) {
    this._makeButtonTexture(key, w, h, color);
    var btn = this.scene.add.sprite(x, y, key);
    btn.setScrollFactor(0);
    btn.setDepth(1000);
    btn.setAlpha(0.3);
    btn.setInteractive();
    btn.on('pointerdown', function () {
      btn.setAlpha(0.6);
      if (onDown) onDown();
    });
    btn.on('pointerup', function () {
      btn.setAlpha(0.3);
      if (onUp) onUp();
    });
    btn.on('pointerout', function () {
      btn.setAlpha(0.3);
      if (onUp) onUp();
    });
    this.buttons.push(btn);
    return btn;
  }

  /**
   * Set up controls appropriate for the given level number.
   *   1 = side-scroller (left/right arrows only)
   *   2 = pointer/touch only (no buttons)
   *   3 = d-pad left/right + attack + special
   */
  setupForLevel(levelNumber) {
    // Remove any existing buttons first
    this._destroyButtons();

    if (!this.isTouch) return; // Keyboard-only devices need no virtual buttons

    var cam = this.scene.cameras.main;
    var gw = cam.width;
    var gh = cam.height;
    var bw = 40;
    var bh = 36;
    var pad = 6;
    var bottomY = gh - bh * 0.5 - pad;
    var self = this;

    if (levelNumber === 1) {
      // Left / Right at bottom-left
      this._createButton('btn-left', bw * 0.5 + pad, bottomY, bw, bh, 0x444444,
        function () { self._virtualLeft = true; },
        function () { self._virtualLeft = false; }
      );
      this._createButton('btn-right', bw * 1.5 + pad * 2, bottomY, bw, bh, 0x444444,
        function () { self._virtualRight = true; },
        function () { self._virtualRight = false; }
      );
    } else if (levelNumber === 2) {
      // No buttons -- pointer/touch only
    } else if (levelNumber === 3) {
      // D-pad left/right at bottom-left
      this._createButton('btn-left', bw * 0.5 + pad, bottomY, bw, bh, 0x444444,
        function () { self._virtualLeft = true; },
        function () { self._virtualLeft = false; }
      );
      this._createButton('btn-right', bw * 1.5 + pad * 2, bottomY, bw, bh, 0x444444,
        function () { self._virtualRight = true; },
        function () { self._virtualRight = false; }
      );
      // Attack + Special at bottom-right
      this._createButton('btn-attack', gw - bw * 1.5 - pad * 2, bottomY, bw, bh, 0x993333,
        function () { self._virtualAttack = true; },
        function () { self._virtualAttack = false; }
      );
      this._createButton('btn-special', gw - bw * 0.5 - pad, bottomY, bw, bh, 0x336699,
        function () { self._virtualSpecial = true; },
        function () { self._virtualSpecial = false; }
      );
    }
  }

  // --- Public getters ---

  get left() {
    return this.cursors.left.isDown || this.keys.A.isDown || this._virtualLeft;
  }

  get right() {
    return this.cursors.right.isDown || this.keys.D.isDown || this._virtualRight;
  }

  get up() {
    return this.cursors.up.isDown || this.keys.W.isDown || this._virtualUp;
  }

  get down() {
    return this.cursors.down.isDown || this.keys.S.isDown || this._virtualDown;
  }

  get attack() {
    return Phaser.Input.Keyboard.JustDown(this.keys.SPACE) || this._virtualAttack;
  }

  get special() {
    return Phaser.Input.Keyboard.JustDown(this.keys.Z) || this._virtualSpecial;
  }

  getPointerPosition() {
    var pointer = this.scene.input.activePointer;
    return {
      x: pointer.worldX,
      y: pointer.worldY
    };
  }

  get pointerJustDown() {
    return this._pointerJustDown;
  }

  // --- Cleanup ---

  _destroyButtons() {
    for (var i = 0; i < this.buttons.length; i++) {
      this.buttons[i].removeAllListeners();
      this.buttons[i].destroy();
    }
    this.buttons = [];
    this._virtualLeft = false;
    this._virtualRight = false;
    this._virtualUp = false;
    this._virtualDown = false;
    this._virtualAttack = false;
    this._virtualSpecial = false;
  }

  destroy() {
    this._destroyButtons();
    this.scene.events.off('update', this._updatePointer, this);
  }
}
