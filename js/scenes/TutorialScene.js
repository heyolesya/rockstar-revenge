/**
 * TutorialScene.js
 * Per-level tutorial overlay — shows controls relevant to the upcoming level.
 * Accepts { level: N } via init(). Tracked separately per level in sessionStorage:
 *   tutorial1Seen, tutorial2Seen, tutorial3Seen
 * Keep visual style: black bg, gold title, white text, scanlines, page counter, ESC to skip.
 */
class TutorialScene extends Phaser.Scene {
  constructor() {
    super({ key: 'TutorialScene' });
  }

  init(data) {
    this.level = (data && data.level) ? data.level : 1;
  }

  create() {
    var self = this;

    // ---- State ----
    this.currentPage = 0;
    this.transitioning = false;
    this._gameStarting = false;

    // ---- Dark overlay background ----
    this.cameras.main.setBackgroundColor('#000000');
    this.overlay = this.add.rectangle(240, 135, 480, 270, 0x000000, 0.85);
    this.overlay.setDepth(0);

    // ---- Decorative scanline effect ----
    for (var i = 0; i < 27; i++) {
      this.add.rectangle(240, i * 10 + 5, 480, 1, 0xffffff, 0.03)
        .setDepth(1);
    }

    // ---- Page container group ----
    this.pageElements = [];

    // ---- Build pages for the current level only ----
    if (this.level === 1) {
      this._buildLevel1Page1();
      this._buildLevel1Page2();
    } else if (this.level === 2) {
      this._buildLevel2Page1();
    } else if (this.level === 3) {
      this._buildLevel3Page1();
      this._buildLevel3Page2();
    }

    this.totalPages = this.pageElements.length;

    // ---- Show first page ----
    this._showPage(0);

    // ---- Skip text at bottom ----
    this.skipText = this.add.text(240, 262, 'PRESS ESC TO SKIP', {
      fontSize: '6px',
      fontFamily: 'monospace',
      color: '#555555'
    }).setOrigin(0.5).setDepth(200);

    // ---- Input: advance or skip ----
    this.input.keyboard.on('keydown', function (event) {
      if (event.key === 'Escape') {
        self._skipTutorial();
      } else {
        self._advancePage();
      }
    });

    this.input.on('pointerdown', function () {
      self._advancePage();
    });
  }

  // ==================================================================
  //  PAGE BUILDERS — LEVEL 1
  // ==================================================================

  _buildLevel1Page1() {
    var elements = [];

    // Title
    elements.push(this.add.text(240, 40, 'LEVEL 1 - THE CONCERT', {
      fontSize: '14px', fontFamily: 'monospace', color: '#FFD700',
      stroke: '#000000', strokeThickness: 3
    }).setOrigin(0.5).setDepth(100));

    elements.push(this.add.rectangle(240, 57, 240, 2, 0xFFD700, 0.6)
      .setDepth(100));

    // Arrow keys
    elements.push(this.add.text(240, 90, '<  >', {
      fontSize: '28px', fontFamily: 'monospace', color: '#FFFFFF',
      stroke: '#333333', strokeThickness: 2
    }).setOrigin(0.5).setDepth(100));

    elements.push(this.add.text(240, 118, 'MOVE LEFT / RIGHT', {
      fontSize: '10px', fontFamily: 'monospace', color: '#CCCCCC'
    }).setOrigin(0.5).setDepth(100));

    // Mobile hint
    elements.push(this.add.text(240, 140, '- MOBILE -', {
      fontSize: '7px', fontFamily: 'monospace', color: '#888888'
    }).setOrigin(0.5).setDepth(100));

    elements.push(this.add.text(240, 153, 'TAP LEFT / RIGHT SIDE OF SCREEN', {
      fontSize: '8px', fontFamily: 'monospace', color: '#AAAAAA'
    }).setOrigin(0.5).setDepth(100));

    // Continue prompt (blinking)
    var continueText = this.add.text(240, 210, 'PRESS ANY KEY TO CONTINUE', {
      fontSize: '8px', fontFamily: 'monospace', color: '#FFFFFF'
    }).setOrigin(0.5).setDepth(100);

    this.tweens.add({
      targets: continueText,
      alpha: 0,
      duration: 500,
      yoyo: true,
      repeat: -1
    });

    elements.push(continueText);

    // Page indicator
    elements.push(this.add.text(240, 245, '1 / 2', {
      fontSize: '7px', fontFamily: 'monospace', color: '#666666'
    }).setOrigin(0.5).setDepth(100));

    this._hideElements(elements);
    this.pageElements.push(elements);
  }

  _buildLevel1Page2() {
    var elements = [];

    elements.push(this.add.text(240, 28, 'LEVEL 1 - THE CONCERT', {
      fontSize: '14px', fontFamily: 'monospace', color: '#FFD700',
      stroke: '#000000', strokeThickness: 3
    }).setOrigin(0.5).setDepth(100));

    elements.push(this.add.rectangle(240, 44, 240, 2, 0xFFD700, 0.6)
      .setDepth(100));

    // Catch items
    elements.push(this.add.text(240, 62, 'CATCH:', {
      fontSize: '10px', fontFamily: 'monospace', color: '#33FF33'
    }).setOrigin(0.5).setDepth(100));

    var itemNames = ['item-money', 'item-goldrecord', 'item-star', 'item-note'];
    var startX = 170;
    for (var i = 0; i < itemNames.length; i++) {
      try {
        var icon = this.add.image(startX + i * 48, 85, itemNames[i]);
        icon.setScale(1.2).setDepth(100);
        elements.push(icon);
      } catch (e) { /* silent */ }
    }

    elements.push(this.add.text(240, 102, '$$$ Records Stars Notes', {
      fontSize: '7px', fontFamily: 'monospace', color: '#AAAAAA'
    }).setOrigin(0.5).setDepth(100));

    // Dodge items
    elements.push(this.add.text(240, 122, 'DODGE:', {
      fontSize: '10px', fontFamily: 'monospace', color: '#FF3333'
    }).setOrigin(0.5).setDepth(100));

    elements.push(this.add.text(240, 138, 'Bottles & Syringes', {
      fontSize: '9px', fontFamily: 'monospace', color: '#FF8888'
    }).setOrigin(0.5).setDepth(100));

    // Notes hint (highlighted, blinking)
    var notesHint = this.add.text(240, 165, 'Collect MUSICAL NOTES', {
      fontSize: '9px', fontFamily: 'monospace', color: '#9966FF',
      stroke: '#000000', strokeThickness: 2
    }).setOrigin(0.5).setDepth(100);
    elements.push(notesHint);

    this.tweens.add({
      targets: notesHint,
      alpha: 0.4,
      duration: 600,
      yoyo: true,
      repeat: -1
    });

    elements.push(this.add.text(240, 180, "They determine your fate later!", {
      fontSize: '7px', fontFamily: 'monospace', color: '#CC99FF'
    }).setOrigin(0.5).setDepth(100));

    // Continue prompt (blinking)
    var continueText = this.add.text(240, 210, 'PRESS ANY KEY TO START', {
      fontSize: '8px', fontFamily: 'monospace', color: '#FFFFFF'
    }).setOrigin(0.5).setDepth(100);

    this.tweens.add({
      targets: continueText,
      alpha: 0,
      duration: 500,
      yoyo: true,
      repeat: -1
    });

    elements.push(continueText);

    // Page indicator
    elements.push(this.add.text(240, 245, '2 / 2', {
      fontSize: '7px', fontFamily: 'monospace', color: '#666666'
    }).setOrigin(0.5).setDepth(100));

    this._hideElements(elements);
    this.pageElements.push(elements);
  }

  // ==================================================================
  //  PAGE BUILDERS — LEVEL 2
  // ==================================================================

  _buildLevel2Page1() {
    var elements = [];

    // Title
    elements.push(this.add.text(240, 30, 'LEVEL 2 - REVENGE', {
      fontSize: '14px', fontFamily: 'monospace', color: '#FFD700',
      stroke: '#000000', strokeThickness: 3
    }).setOrigin(0.5).setDepth(100));

    elements.push(this.add.rectangle(240, 47, 200, 2, 0xFFD700, 0.6)
      .setDepth(100));

    // Dartboard sprite
    try {
      var dartboard = this.add.image(240, 100, 'dartboard');
      dartboard.setScale(1.0).setDepth(100);
      elements.push(dartboard);
    } catch (e) { /* silent */ }

    // Aim
    elements.push(this.add.text(240, 140, 'AIM with mouse / finger', {
      fontSize: '10px', fontFamily: 'monospace', color: '#FFFFFF'
    }).setOrigin(0.5).setDepth(100));

    // Crosshair icon
    try {
      var crosshairIcon = this.add.image(240, 163, 'crosshair');
      crosshairIcon.setDepth(100);
      elements.push(crosshairIcon);

      this.tweens.add({
        targets: crosshairIcon,
        scaleX: 1.2,
        scaleY: 1.2,
        duration: 500,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    } catch (e) { /* silent */ }

    // Throw
    elements.push(this.add.text(240, 185, 'CLICK / TAP to throw darts', {
      fontSize: '10px', fontFamily: 'monospace', color: '#FFFFFF'
    }).setOrigin(0.5).setDepth(100));

    // Bullseye hint
    elements.push(this.add.text(240, 208, 'Hit the bullseye for max points!', {
      fontSize: '9px', fontFamily: 'monospace', color: '#FF00FF',
      stroke: '#000000', strokeThickness: 2
    }).setOrigin(0.5).setDepth(100));

    // Page indicator
    elements.push(this.add.text(240, 245, '1 / 1', {
      fontSize: '7px', fontFamily: 'monospace', color: '#666666'
    }).setOrigin(0.5).setDepth(100));

    this._hideElements(elements);
    this.pageElements.push(elements);
  }

  // ==================================================================
  //  PAGE BUILDERS — LEVEL 3
  // ==================================================================

  _buildLevel3Page1() {
    var elements = [];

    // Title
    elements.push(this.add.text(240, 30, 'LEVEL 3 - THE FIGHT', {
      fontSize: '14px', fontFamily: 'monospace', color: '#FFD700',
      stroke: '#000000', strokeThickness: 3
    }).setOrigin(0.5).setDepth(100));

    elements.push(this.add.rectangle(240, 47, 200, 2, 0xFFD700, 0.6)
      .setDepth(100));

    // Rockstar attack sprite
    try {
      var rockstarAttack = this.add.image(240, 82, 'rockstar-attack-1');
      rockstarAttack.setScale(1.3).setDepth(100);
      elements.push(rockstarAttack);
    } catch (e) { /* silent */ }

    // Movement
    elements.push(this.add.text(240, 118, '<  >  to MOVE', {
      fontSize: '10px', fontFamily: 'monospace', color: '#FFFFFF'
    }).setOrigin(0.5).setDepth(100));

    // Attack controls
    elements.push(this.add.text(240, 140, 'SPACE / Z  to ATTACK', {
      fontSize: '10px', fontFamily: 'monospace', color: '#FF4444',
      stroke: '#000000', strokeThickness: 2
    }).setOrigin(0.5).setDepth(100));

    // Build combos
    elements.push(this.add.text(240, 162, 'Hit enemies in a row to build COMBOS!', {
      fontSize: '8px', fontFamily: 'monospace', color: '#FFCC00'
    }).setOrigin(0.5).setDepth(100));

    // Continue prompt (blinking)
    var continueText = this.add.text(240, 210, 'PRESS ANY KEY TO CONTINUE', {
      fontSize: '8px', fontFamily: 'monospace', color: '#FFFFFF'
    }).setOrigin(0.5).setDepth(100);

    this.tweens.add({
      targets: continueText,
      alpha: 0,
      duration: 500,
      yoyo: true,
      repeat: -1
    });

    elements.push(continueText);

    // Page indicator
    elements.push(this.add.text(240, 245, '1 / 2', {
      fontSize: '7px', fontFamily: 'monospace', color: '#666666'
    }).setOrigin(0.5).setDepth(100));

    this._hideElements(elements);
    this.pageElements.push(elements);
  }

  _buildLevel3Page2() {
    var elements = [];

    elements.push(this.add.text(240, 30, 'LEVEL 3 - THE FIGHT', {
      fontSize: '14px', fontFamily: 'monospace', color: '#FFD700',
      stroke: '#000000', strokeThickness: 3
    }).setOrigin(0.5).setDepth(100));

    elements.push(this.add.rectangle(240, 47, 200, 2, 0xFFD700, 0.6)
      .setDepth(100));

    // Guitar pickup
    elements.push(this.add.text(240, 78, 'Pick up GUITARS for power hits!', {
      fontSize: '9px', fontFamily: 'monospace', color: '#FFCC00',
      stroke: '#000000', strokeThickness: 2
    }).setOrigin(0.5).setDepth(100));

    // Guitar icon (floating)
    try {
      var guitarIcon = this.add.image(240, 108, 'item-guitar');
      guitarIcon.setScale(1.5).setDepth(100);
      elements.push(guitarIcon);

      this.tweens.add({
        targets: guitarIcon,
        y: 104,
        duration: 500,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    } catch (e) { /* silent */ }

    // Notes power
    var secretText = this.add.text(240, 148, 'Your collected NOTES unlock a secret power...', {
      fontSize: '7px', fontFamily: 'monospace', color: '#9966FF',
      stroke: '#000000', strokeThickness: 2
    }).setOrigin(0.5).setDepth(100);
    elements.push(secretText);

    this.tweens.add({
      targets: secretText,
      alpha: 0.3,
      duration: 800,
      yoyo: true,
      repeat: -1
    });

    elements.push(this.add.text(240, 164, 'Musical notes determine your fate!', {
      fontSize: '7px', fontFamily: 'monospace', color: '#CC99FF'
    }).setOrigin(0.5).setDepth(100));

    // PRESS START (big and blinking)
    var pressStart = this.add.text(240, 200, 'PRESS START', {
      fontSize: '16px', fontFamily: 'monospace', color: '#FFFFFF',
      stroke: '#000000', strokeThickness: 3,
      shadow: { offsetX: 1, offsetY: 1, color: '#555555', blur: 0, fill: true }
    }).setOrigin(0.5).setDepth(100);

    this.tweens.add({
      targets: pressStart,
      alpha: 0,
      duration: 500,
      yoyo: true,
      repeat: -1
    });

    elements.push(pressStart);

    // Page indicator
    elements.push(this.add.text(240, 245, '2 / 2', {
      fontSize: '7px', fontFamily: 'monospace', color: '#666666'
    }).setOrigin(0.5).setDepth(100));

    this._hideElements(elements);
    this.pageElements.push(elements);
  }

  // ==================================================================
  //  PAGE NAVIGATION
  // ==================================================================

  _showPage(index) {
    // Hide all pages
    for (var p = 0; p < this.pageElements.length; p++) {
      this._hideElements(this.pageElements[p]);
    }

    // Show requested page
    if (index >= 0 && index < this.pageElements.length) {
      var elements = this.pageElements[index];
      for (var i = 0; i < elements.length; i++) {
        elements[i].setVisible(true);
        elements[i].setAlpha(0);
      }

      // Fade in with slight stagger
      for (var j = 0; j < elements.length; j++) {
        this.tweens.add({
          targets: elements[j],
          alpha: 1,
          duration: 300,
          delay: j * 30,
          ease: 'Power2'
        });
      }
    }
  }

  _hideElements(elements) {
    for (var i = 0; i < elements.length; i++) {
      elements[i].setVisible(false);
    }
  }

  _advancePage() {
    if (this.transitioning) return;
    this.transitioning = true;

    var self = this;

    if (this.currentPage < this.totalPages - 1) {
      // Advance to next page
      this.currentPage++;
      this._showPage(this.currentPage);

      this.time.delayedCall(400, function () {
        self.transitioning = false;
      });
    } else {
      // Last page — start the level
      this._startLevel();
    }
  }

  _skipTutorial() {
    if (this._gameStarting) return;
    this._startLevel();
  }

  _startLevel() {
    if (this._gameStarting) return;
    this._gameStarting = true;

    // Mark this level's tutorial as seen
    try {
      sessionStorage.setItem('tutorial' + this.level + 'Seen', 'true');
    } catch (e) {
      // sessionStorage may be unavailable in some contexts
    }

    // Audio feedback
    if (window.audioManager) {
      try { window.audioManager.playMenuSelect(); } catch (e) { /* silent */ }
    }

    // Flash transition
    this.cameras.main.flash(300, 255, 255, 255);

    var self = this;
    var targetScene = 'Level1Scene';
    if (self.level === 2) targetScene = 'Level2Scene';
    else if (self.level === 3) targetScene = 'Level3Scene';

    this.time.delayedCall(350, function () {
      self.scene.start(targetScene);
    });
  }

  // ==================================================================
  //  CLEANUP
  // ==================================================================

  shutdown() {
    this.input.keyboard.removeAllListeners();
    this.input.off('pointerdown');
  }
}
