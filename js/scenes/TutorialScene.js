/**
 * TutorialScene.js
 * Multi-page tutorial overlay — teaches controls for all 3 levels.
 * Only shows on first play in a browser session (tracked via sessionStorage).
 */
class TutorialScene extends Phaser.Scene {
  constructor() {
    super({ key: 'TutorialScene' });
  }

  create() {
    var self = this;

    // ---- State ----
    this.currentPage = 0;
    this.totalPages = 5;
    this.transitioning = false;

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

    // ---- Build all pages (hidden initially) ----
    this._buildPage1();
    this._buildPage2();
    this._buildPage3();
    this._buildPage4();
    this._buildPage5();

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
  //  PAGE BUILDERS
  // ==================================================================

  _buildPage1() {
    var elements = [];

    // Title
    elements.push(this.add.text(240, 40, 'HOW TO PLAY', {
      fontSize: '20px', fontFamily: 'monospace', color: '#FFD700',
      stroke: '#000000', strokeThickness: 3
    }).setOrigin(0.5).setDepth(100));

    // Decorative line
    elements.push(this.add.rectangle(240, 60, 200, 2, 0xFFD700, 0.6)
      .setDepth(100));

    // Arrow keys
    elements.push(this.add.text(240, 95, '<  >', {
      fontSize: '28px', fontFamily: 'monospace', color: '#FFFFFF',
      stroke: '#333333', strokeThickness: 2
    }).setOrigin(0.5).setDepth(100));

    elements.push(this.add.text(240, 125, 'MOVE LEFT / RIGHT', {
      fontSize: '10px', fontFamily: 'monospace', color: '#CCCCCC'
    }).setOrigin(0.5).setDepth(100));

    // Mobile hint
    elements.push(this.add.text(240, 150, '- MOBILE -', {
      fontSize: '7px', fontFamily: 'monospace', color: '#888888'
    }).setOrigin(0.5).setDepth(100));

    elements.push(this.add.text(240, 165, 'TAP LEFT / RIGHT SIDE OF SCREEN', {
      fontSize: '8px', fontFamily: 'monospace', color: '#AAAAAA'
    }).setOrigin(0.5).setDepth(100));

    // Continue prompt (blinking)
    var continueText = this.add.text(240, 220, 'PRESS ANY KEY TO CONTINUE', {
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
    elements.push(this.add.text(240, 245, '1 / 5', {
      fontSize: '7px', fontFamily: 'monospace', color: '#666666'
    }).setOrigin(0.5).setDepth(100));

    this._hideElements(elements);
    this.pageElements.push(elements);
  }

  _buildPage2() {
    var elements = [];

    // Title
    elements.push(this.add.text(240, 30, 'LEVEL 1 - THE CONCERT', {
      fontSize: '14px', fontFamily: 'monospace', color: '#FFD700',
      stroke: '#000000', strokeThickness: 3
    }).setOrigin(0.5).setDepth(100));

    elements.push(this.add.rectangle(240, 47, 220, 2, 0xFFD700, 0.6)
      .setDepth(100));

    // Rockstar sprite
    var rockstar = this.add.image(240, 75, 'rockstar-idle');
    rockstar.setScale(1.2).setDepth(100);
    elements.push(rockstar);

    // Catch items
    elements.push(this.add.text(240, 105, 'CATCH:', {
      fontSize: '10px', fontFamily: 'monospace', color: '#33FF33'
    }).setOrigin(0.5).setDepth(100));

    // Item icons row
    var itemNames = ['item-money', 'item-goldrecord', 'item-star', 'item-note'];
    var startX = 170;
    for (var i = 0; i < itemNames.length; i++) {
      try {
        var icon = this.add.image(startX + i * 48, 125, itemNames[i]);
        icon.setScale(1.2).setDepth(100);
        elements.push(icon);
      } catch (e) {
        // If texture missing, skip silently
      }
    }

    elements.push(this.add.text(240, 142, '$$$ Records Stars Notes', {
      fontSize: '7px', fontFamily: 'monospace', color: '#AAAAAA'
    }).setOrigin(0.5).setDepth(100));

    // Dodge items
    elements.push(this.add.text(240, 165, 'DODGE:', {
      fontSize: '10px', fontFamily: 'monospace', color: '#FF3333'
    }).setOrigin(0.5).setDepth(100));

    elements.push(this.add.text(240, 182, 'Bottles & Syringes', {
      fontSize: '9px', fontFamily: 'monospace', color: '#FF8888'
    }).setOrigin(0.5).setDepth(100));

    // Notes hint (highlighted)
    var notesHint = this.add.text(240, 208, 'Collect MUSICAL NOTES', {
      fontSize: '9px', fontFamily: 'monospace', color: '#9966FF',
      stroke: '#000000', strokeThickness: 2
    }).setOrigin(0.5).setDepth(100);
    elements.push(notesHint);

    // Blink the notes hint for emphasis
    this.tweens.add({
      targets: notesHint,
      alpha: 0.4,
      duration: 600,
      yoyo: true,
      repeat: -1
    });

    elements.push(this.add.text(240, 222, "They're the secret to winning!", {
      fontSize: '7px', fontFamily: 'monospace', color: '#CC99FF'
    }).setOrigin(0.5).setDepth(100));

    // Page indicator
    elements.push(this.add.text(240, 245, '2 / 5', {
      fontSize: '7px', fontFamily: 'monospace', color: '#666666'
    }).setOrigin(0.5).setDepth(100));

    this._hideElements(elements);
    this.pageElements.push(elements);
  }

  _buildPage3() {
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
      var dartboard = this.add.image(240, 90, 'dartboard');
      dartboard.setScale(1.0).setDepth(100);
      elements.push(dartboard);
    } catch (e) { /* silent */ }

    // Aim
    elements.push(this.add.text(240, 130, 'AIM with mouse / finger', {
      fontSize: '10px', fontFamily: 'monospace', color: '#FFFFFF'
    }).setOrigin(0.5).setDepth(100));

    // Crosshair icon
    try {
      var crosshairIcon = this.add.image(240, 155, 'crosshair');
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
    elements.push(this.add.text(240, 178, 'CLICK / TAP to throw darts', {
      fontSize: '10px', fontFamily: 'monospace', color: '#FFFFFF'
    }).setOrigin(0.5).setDepth(100));

    // Bullseye hint
    elements.push(this.add.text(240, 205, 'Hit the bullseye for max points!', {
      fontSize: '9px', fontFamily: 'monospace', color: '#FF00FF',
      stroke: '#000000', strokeThickness: 2
    }).setOrigin(0.5).setDepth(100));

    // Page indicator
    elements.push(this.add.text(240, 245, '3 / 5', {
      fontSize: '7px', fontFamily: 'monospace', color: '#666666'
    }).setOrigin(0.5).setDepth(100));

    this._hideElements(elements);
    this.pageElements.push(elements);
  }

  _buildPage4() {
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
      var rockstarAttack = this.add.image(240, 80, 'rockstar-attack-1');
      rockstarAttack.setScale(1.3).setDepth(100);
      elements.push(rockstarAttack);
    } catch (e) { /* silent */ }

    // Attack controls
    elements.push(this.add.text(240, 115, 'SPACE / TAP to ATTACK', {
      fontSize: '10px', fontFamily: 'monospace', color: '#FF4444',
      stroke: '#000000', strokeThickness: 2
    }).setOrigin(0.5).setDepth(100));

    // Arrow keys for movement
    elements.push(this.add.text(240, 140, '<  >  to MOVE', {
      fontSize: '10px', fontFamily: 'monospace', color: '#FFFFFF'
    }).setOrigin(0.5).setDepth(100));

    // Guitar pickup
    elements.push(this.add.text(240, 168, 'Pick up GUITARS for power hits!', {
      fontSize: '9px', fontFamily: 'monospace', color: '#FFCC00',
      stroke: '#000000', strokeThickness: 2
    }).setOrigin(0.5).setDepth(100));

    // Guitar icon
    try {
      var guitarIcon = this.add.image(240, 190, 'item-guitar');
      guitarIcon.setScale(1.5).setDepth(100);
      elements.push(guitarIcon);

      this.tweens.add({
        targets: guitarIcon,
        y: 186,
        duration: 500,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    } catch (e) { /* silent */ }

    // Secret power hint
    var secretText = this.add.text(240, 215, 'Your collected NOTES unlock a secret power...', {
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

    // Page indicator
    elements.push(this.add.text(240, 245, '4 / 5', {
      fontSize: '7px', fontFamily: 'monospace', color: '#666666'
    }).setOrigin(0.5).setDepth(100));

    this._hideElements(elements);
    this.pageElements.push(elements);
  }

  _buildPage5() {
    var elements = [];

    // Title
    elements.push(this.add.text(240, 70, 'READY TO ROCK?', {
      fontSize: '22px', fontFamily: 'monospace', color: '#FFD700',
      stroke: '#000000', strokeThickness: 4,
      shadow: { offsetX: 2, offsetY: 2, color: '#8B4513', blur: 0, fill: true }
    }).setOrigin(0.5).setDepth(100));

    // Decorative lines
    elements.push(this.add.rectangle(240, 92, 240, 2, 0xFFD700, 0.6)
      .setDepth(100));

    // Rockstar sprite
    try {
      var rockstar = this.add.image(240, 135, 'rockstar-idle');
      rockstar.setScale(1.8).setDepth(100);
      elements.push(rockstar);

      this.tweens.add({
        targets: rockstar,
        y: 140,
        duration: 1000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    } catch (e) { /* silent */ }

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
    elements.push(this.add.text(240, 245, '5 / 5', {
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
      // Last page — start the game
      this._startGame();
    }
  }

  _skipTutorial() {
    if (this.transitioning) return;
    this._startGame();
  }

  _startGame() {
    // Note: transitioning may already be true when called from _advancePage
    if (this._gameStarting) return;
    this._gameStarting = true;

    // Mark tutorial as seen
    try {
      sessionStorage.setItem('tutorialSeen', 'true');
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
    this.time.delayedCall(350, function () {
      self.scene.start('CutsceneScene', { cutscene: 'intro' });
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
