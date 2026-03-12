// WinScene.js - "Reinvention" victory ending
class WinScene extends Phaser.Scene {
  constructor() {
    super({ key: 'WinScene' });
  }

  create() {
    var self = this;

    // --- Music ---
    if (window.audioManager) {
      window.audioManager.playHappyEndMusic();
    }

    // --- Concert backdrop (crowd with lights) ---
    this.add.image(240, 135, 'bg-happy-end').setDisplaySize(480, 270).setDepth(0);

    // --- Old hero walks in from left (hi-res sprites) ---
    this.rockstar = this.add.sprite(-50, 200, 'vocalist-hires-walk-1').setScale(0.2).setDepth(20);

    // Walk animation: cycle through hi-res walk frames
    this.walkFrame = 0;
    this.walkFrames = ['vocalist-hires-walk-1', 'vocalist-hires-walk-2', 'vocalist-hires-walk-3', 'vocalist-hires-walk-2'];
    this.walkTimer = this.time.addEvent({
      delay: 200,
      loop: true,
      callback: function () {
        self.walkFrame = (self.walkFrame + 1) % self.walkFrames.length;
        self.rockstar.setTexture(self.walkFrames[self.walkFrame]);
      }
    });

    // Tween: walk from left to x=180
    this.tweens.add({
      targets: this.rockstar,
      x: 180,
      duration: 2000,
      ease: 'Linear',
      onComplete: function () {
        // Stop walk animation, set idle
        if (self.walkTimer) {
          self.walkTimer.remove(false);
          self.walkTimer = null;
        }
        self.rockstar.setTexture('vocalist-hires-idle');

        // After 1 second: transformation
        self.time.delayedCall(1000, function () {
          self.playTransformation();
        });
      }
    });
  }

  // =============================================
  //   TRANSFORMATION (flash + texture swap)
  // =============================================

  playTransformation() {
    var self = this;

    // White flash effect
    var flash = this.add.rectangle(240, 135, 480, 270, 0xffffff, 0.9).setDepth(100);
    this.tweens.add({
      targets: flash,
      alpha: 0,
      duration: 400,
      ease: 'Power2',
      onComplete: function () {
        flash.destroy();
      }
    });

    // Swap texture to vocalist-90s fist pose (individually cropped, no clipping)
    this.rockstar.setTexture('vocalist-90s-fist');
    this.rockstar.setScale(0.2);

    // Walk new hero to center
    this.tweens.add({
      targets: this.rockstar,
      x: 240,
      duration: 1000,
      ease: 'Linear',
      onComplete: function () {
        self.playFinalPose();
      }
    });

    // Slight bob during walk to center
    this.tweens.add({
      targets: this.rockstar,
      y: { from: 200, to: 197 },
      duration: 250,
      yoyo: true,
      repeat: 1,
      ease: 'Sine.easeInOut'
    });
  }

  // =============================================
  //   FINAL POSE
  // =============================================

  playFinalPose() {
    var self = this;

    // Triumphant upward tween
    this.tweens.add({
      targets: this.rockstar,
      y: 195,
      duration: 500,
      ease: 'Back.easeOut'
    });

    // Scale pulse
    this.tweens.add({
      targets: this.rockstar,
      scaleX: 0.22,
      scaleY: 0.22,
      duration: 400,
      yoyo: true,
      ease: 'Sine.easeInOut',
      onComplete: function () {
        self.rockstar.setScale(0.2);
        // Start text crawl after pose settles
        self.playPostTransformation();
      }
    });
  }

  // =============================================
  //   POST-TRANSFORMATION SEQUENCE
  // =============================================

  playPostTransformation() {
    var self = this;

    // --- Dim overlay behind text for readability ---
    var textBg = this.add.rectangle(240, 60, 400, 100, 0x000000, 0.5).setDepth(50);

    // --- Typewriter text crawl (above the hero) ---
    var lines = [
      { text: 'The hair metal era was over.', delay: 1500 },
      { text: 'But the music never died.', delay: 3500 },
      { text: 'Neither did you.', delay: 5500 },
      { text: 'Short hair. Big dream.', delay: 7200 }
    ];

    var crawlStyle = {
      fontFamily: 'monospace', fontSize: '8px', color: '#ffffff',
      align: 'center', wordWrap: { width: 400 },
      stroke: '#000000', strokeThickness: 2
    };

    // Store story text objects for cleanup
    this.storyTexts = [textBg];
    for (var j = 0; j < lines.length; j++) {
      (function (line, idx) {
        self.time.delayedCall(line.delay, function () {
          var t = self.typewriterText(240, 30 + 14 * idx, line.text, crawlStyle);
          self.storyTexts.push(t);
        });
      })(lines[j], j);
    }

    // --- Final score ---
    var totalScore = this.registry.get('score') || 0;
    this.time.delayedCall(9000, function () {
      self.finalScoreText = self.add.text(240, 100, 'FINAL SCORE: ' + totalScore, {
        fontFamily: 'monospace', fontSize: '10px', color: '#ffcc00',
        stroke: '#000000', strokeThickness: 2
      }).setOrigin(0.5).setAlpha(0).setDepth(200);

      self.tweens.add({
        targets: self.finalScoreText,
        alpha: 1,
        duration: 800
      });
    });

    // --- Leaderboard entry + CTA at 10.5s ---
    this.time.delayedCall(10500, function () {
      self.showLeaderboardAndCTA();
    });
  }

  // =============================================
  //   LEADERBOARD + CTA (shown together)
  // =============================================

  showLeaderboardAndCTA() {
    var self = this;

    // Hide story text and final score
    for (var k = 0; k < this.storyTexts.length; k++) {
      this.storyTexts[k].setAlpha(0);
    }
    if (this.finalScoreText) this.finalScoreText.setAlpha(0);

    // Hide rockstar
    this.rockstar.setAlpha(0);

    // Dark overlay for readability
    this.add.rectangle(240, 135, 480, 270, 0x000000, 0.7).setDepth(190);

    // Create leaderboard entry UI
    var leaderboardScore = this.registry.get('score') || 0;
    this.entryUI = Leaderboard.createEntryUI(this, 140, leaderboardScore, function (initials) {
      Leaderboard.addScore(initials, leaderboardScore);
      if (self.entryUI) self.entryUI.destroy();
      Leaderboard.createDisplayUI(self, 80);
    });

    // --- PLAY AGAIN + CTA shown together during initials entry ---
    this.showPlayAgain();
    this.createCTAButton();
  }

  // =============================================
  //   CTA BUTTON (glam/rock style)
  // =============================================

  createCTAButton() {
    var self = this;

    // Base rectangle - dark purple
    var ctaBase = this.add.rectangle(240, 254, 210, 20, 0x880088)
      .setDepth(300);

    // Hot pink highlight overlay
    var ctaHighlight = this.add.rectangle(240, 254, 206, 16, 0xFF1493)
      .setInteractive({ useHandCursor: true }).setDepth(301);

    // Button text
    var ctaText = this.add.text(240, 254, 'WATCH THE REAL STORY', {
      fontFamily: 'monospace',
      fontSize: '8px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 1
    }).setOrigin(0.5).setDepth(302);

    // Blinking shimmer tween on the highlight
    this.tweens.add({
      targets: ctaHighlight,
      alpha: { from: 1, to: 0.5 },
      duration: 600,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Scale pulse on the base for extra glam
    this.tweens.add({
      targets: [ctaBase, ctaHighlight, ctaText],
      scaleX: { from: 1, to: 1.03 },
      scaleY: { from: 1, to: 1.03 },
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Hover effects
    ctaHighlight.on('pointerover', function () {
      ctaHighlight.setFillStyle(0xFF69B4);
    });
    ctaHighlight.on('pointerout', function () {
      ctaHighlight.setFillStyle(0xFF1493);
    });
    ctaHighlight.on('pointerdown', function () {
      if (window.audioManager) window.audioManager.playMenuSelect();
      window.open('https://example.com/documentary', '_blank');
    });
  }

  // =============================================
  //   PLAY AGAIN (after initials confirmed)
  // =============================================

  showPlayAgain() {
    var self = this;

    var replayBg = this.add.rectangle(240, 232, 100, 14, 0x444444)
      .setInteractive({ useHandCursor: true }).setDepth(300);
    this.add.text(240, 232, 'PLAY AGAIN', {
      fontFamily: 'monospace', fontSize: '6px', color: '#ffffff'
    }).setOrigin(0.5).setDepth(301);

    replayBg.on('pointerover', function () { replayBg.setFillStyle(0x666666); });
    replayBg.on('pointerout', function () { replayBg.setFillStyle(0x444444); });
    replayBg.on('pointerdown', function () {
      if (window.audioManager) {
        window.audioManager.stopMusic();
        window.audioManager.playMenuSelect();
      }
      self.registry.set('score', 0);
      self.registry.set('health', 5);
      self.registry.set('notesCollected', 0);
      self.registry.set('level1Score', 0);
      self.registry.set('level2Score', 0);
      self.registry.set('level3Score', 0);
      self.scene.start('BootScene');
    });
  }

  // =============================================
  //   TYPEWRITER HELPER
  // =============================================

  typewriterText(x, y, text, style, delay) {
    if (typeof delay === 'undefined') delay = 40;

    var textObj = this.add.text(x, y, '', style).setOrigin(0.5).setDepth(150);
    var i = 0;

    this.time.addEvent({
      delay: delay,
      repeat: text.length - 1,
      callback: function () {
        if (i < text.length) {
          textObj.text += text[i];
          i++;
        }
      }
    });

    return textObj;
  }
}
