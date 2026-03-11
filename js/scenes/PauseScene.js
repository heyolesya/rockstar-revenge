/**
 * PauseScene.js
 * Overlay pause menu — launched OVER the active gameplay scene.
 * Provides Resume, Restart Level, and Quit to Title options.
 */
class PauseScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PauseScene' });
  }

  init(data) {
    this.pausedScene = (data && data.pausedScene) ? data.pausedScene : null;
  }

  create() {
    var self = this;

    // ---- Semi-transparent dark overlay ----
    this.overlay = this.add.rectangle(240, 135, 480, 270, 0x000000, 0.7);
    this.overlay.setDepth(0);

    // ---- Scanline decoration ----
    for (var i = 0; i < 27; i++) {
      this.add.rectangle(240, i * 10 + 5, 480, 1, 0xffffff, 0.02)
        .setDepth(1);
    }

    // ---- "PAUSED" title ----
    this.add.text(240, 70, 'PAUSED', {
      fontSize: '28px',
      fontFamily: 'monospace',
      color: '#FFD700',
      stroke: '#000000',
      strokeThickness: 4,
      shadow: { offsetX: 2, offsetY: 2, color: '#8B4513', blur: 0, fill: true }
    }).setOrigin(0.5).setDepth(100);

    // ---- Decorative line ----
    this.add.rectangle(240, 92, 160, 2, 0xFFD700, 0.6).setDepth(100);

    // ---- Menu options ----
    var menuY = 130;
    var menuSpacing = 32;

    this.resumeBtn = this._createMenuOption(240, menuY, 'RESUME', function () {
      self._resume();
    });

    this.restartBtn = this._createMenuOption(240, menuY + menuSpacing, 'RESTART LEVEL', function () {
      self._restartLevel();
    });

    this.quitBtn = this._createMenuOption(240, menuY + menuSpacing * 2, 'QUIT TO TITLE', function () {
      self._quitToTitle();
    });

    // ---- Keyboard shortcuts ----
    this.escKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    this.pKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.P);

    this.escKey.on('down', function () { self._resume(); });
    this.pKey.on('down', function () { self._resume(); });

    // ---- Hint text ----
    this.add.text(240, 250, 'P / ESC to resume', {
      fontSize: '6px',
      fontFamily: 'monospace',
      color: '#555555'
    }).setOrigin(0.5).setDepth(100);
  }

  // ==================================================================
  //  MENU OPTION FACTORY
  // ==================================================================

  _createMenuOption(x, y, label, callback) {
    var text = this.add.text(x, y, label, {
      fontSize: '12px',
      fontFamily: 'monospace',
      color: '#FFFFFF',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5).setDepth(100);

    text.setInteractive({ useHandCursor: true });

    text.on('pointerover', function () {
      text.setColor('#FFD700');
      text.setScale(1.15);
    });

    text.on('pointerout', function () {
      text.setColor('#FFFFFF');
      text.setScale(1.0);
    });

    text.on('pointerdown', function () {
      if (callback) callback();
    });

    return text;
  }

  // ==================================================================
  //  ACTIONS
  // ==================================================================

  _resume() {
    if (!this.pausedScene) return;

    // Play menu select SFX
    if (window.audioManager) {
      try { window.audioManager.playMenuSelect(); } catch (e) { /* silent */ }
    }

    this.scene.stop('PauseScene');
    this.scene.resume(this.pausedScene);
  }

  _restartLevel() {
    if (!this.pausedScene) return;

    // Play menu select SFX
    if (window.audioManager) {
      try { window.audioManager.playMenuSelect(); } catch (e) { /* silent */ }
      try { window.audioManager.stopMusic(); } catch (e) { /* silent */ }
    }

    // Restore cursor in case we were in Level 2
    try { this.input.setDefaultCursor('default'); } catch (e) { /* silent */ }

    var sceneToRestart = this.pausedScene;
    this.scene.stop('PauseScene');
    this.scene.stop(sceneToRestart);
    this.scene.start(sceneToRestart);
  }

  _quitToTitle() {
    // Play menu select SFX
    if (window.audioManager) {
      try { window.audioManager.playMenuSelect(); } catch (e) { /* silent */ }
      try { window.audioManager.stopMusic(); } catch (e) { /* silent */ }
    }

    // Restore cursor in case we were in Level 2
    try { this.input.setDefaultCursor('default'); } catch (e) { /* silent */ }

    // Reset registry to defaults
    this.registry.set('score', 0);
    this.registry.set('health', 5);
    this.registry.set('notesCollected', 0);
    this.registry.set('level1Score', 0);
    this.registry.set('level2Score', 0);
    this.registry.set('level3Score', 0);

    // Stop the paused scene and go to title
    if (this.pausedScene) {
      this.scene.stop(this.pausedScene);
    }
    this.scene.stop('PauseScene');
    this.scene.start('TitleScene');
  }

  // ==================================================================
  //  CLEANUP
  // ==================================================================

  shutdown() {
    if (this.escKey) this.escKey.removeAllListeners();
    if (this.pKey) this.pKey.removeAllListeners();
  }
}
