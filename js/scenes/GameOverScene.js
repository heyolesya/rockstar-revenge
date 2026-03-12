// GameOverScene.js — Classic arcade Game Over with continue countdown
// Used when the player dies mid-game (any level).
// Data passed via init(): { score: number, fromScene: 'Level1Scene' | 'Level2Scene' | 'Level3Scene' }
class GameOverScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameOverScene' });
  }

  init(data) {
    this.finalScore = (data && data.score) || 0;
    this.fromScene = (data && data.fromScene) || null;
  }

  create() {
    var self = this;
    this.canContinue = false;
    this.continued = false;
    this.countdownValue = 10;

    // ------------------------------------------------------------------
    // Black background
    // ------------------------------------------------------------------
    this.add.rectangle(240, 135, 480, 270, 0x000000).setDepth(0);

    // Scanlines
    for (var i = 0; i < 135; i++) {
      this.add.rectangle(240, i * 2, 480, 1, 0xffffff, 0.03).setDepth(1);
    }

    // ------------------------------------------------------------------
    // Music
    // ------------------------------------------------------------------
    if (window.audioManager) {
      window.audioManager.playGameOverMusic();
    }

    // ------------------------------------------------------------------
    // "GAME OVER" — slam-in animation
    // ------------------------------------------------------------------
    var gameOverText = this.add.text(240, 70, 'GAME OVER', {
      fontSize: '28px',
      fontFamily: 'monospace',
      color: '#ff0000',
      stroke: '#330000',
      strokeThickness: 4
    }).setOrigin(0.5).setDepth(10).setScale(3).setAlpha(0);

    this.tweens.add({
      targets: gameOverText,
      alpha: 1,
      scaleX: 1,
      scaleY: 1,
      duration: 500,
      ease: 'Back.easeOut',
      onComplete: function () {
        self.cameras.main.shake(200, 0.02);
      }
    });

    // ------------------------------------------------------------------
    // "CONTINUE?" text
    // ------------------------------------------------------------------
    this.continueText = this.add.text(240, 110, 'CONTINUE?', {
      fontSize: '14px',
      fontFamily: 'monospace',
      color: '#ffffff'
    }).setOrigin(0.5).setDepth(10).setAlpha(0);

    this.tweens.add({
      targets: this.continueText,
      alpha: 1,
      delay: 700,
      duration: 300
    });

    // ------------------------------------------------------------------
    // Countdown number — big and centered
    // ------------------------------------------------------------------
    this.countdownText = this.add.text(240, 155, '10', {
      fontSize: '36px',
      fontFamily: 'monospace',
      color: '#FFD700',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5).setDepth(10).setAlpha(0);

    this.tweens.add({
      targets: this.countdownText,
      alpha: 1,
      delay: 1000,
      duration: 300,
      onComplete: function () {
        self.canContinue = true;
        self.startCountdown();
      }
    });

    // ------------------------------------------------------------------
    // Score display (small)
    // ------------------------------------------------------------------
    this.smallScoreText = this.add.text(240, 200, 'SCORE: ' + this.finalScore, {
      fontSize: '8px',
      fontFamily: 'monospace',
      color: '#ffcc00'
    }).setOrigin(0.5).setDepth(10).setAlpha(0.7);

    // ------------------------------------------------------------------
    // "PRESS START TO CONTINUE" — blinking prompt
    // ------------------------------------------------------------------
    this.insertCoinText = this.add.text(240, 230, 'PRESS START TO CONTINUE', {
      fontSize: '8px',
      fontFamily: 'monospace',
      color: '#ffffff'
    }).setOrigin(0.5).setDepth(10).setAlpha(0);

    this.tweens.add({
      targets: this.insertCoinText,
      alpha: 1,
      delay: 1200,
      duration: 300,
      onComplete: function () {
        self.insertCoinBlink = self.tweens.add({
          targets: self.insertCoinText,
          alpha: { from: 1, to: 0.2 },
          duration: 500,
          yoyo: true,
          repeat: -1
        });
      }
    });

    // ------------------------------------------------------------------
    // Input for continue — SPACE, ENTER, or click/tap
    // ------------------------------------------------------------------
    this.input.keyboard.on('keydown-SPACE', function () { self.handleContinue(); });
    this.input.keyboard.on('keydown-ENTER', function () { self.handleContinue(); });
    this.input.on('pointerdown', function () { self.handleContinue(); });
  }

  // ====================================================================
  // COUNTDOWN
  // ====================================================================

  startCountdown() {
    var self = this;
    this.countdownTimer = this.time.addEvent({
      delay: 1000,
      repeat: 9,
      callback: function () {
        self.countdownValue--;
        if (self.countdownValue >= 0) {
          self.countdownText.setText('' + self.countdownValue);

          // Pulse animation on each tick
          self.countdownText.setScale(1.5);
          self.tweens.add({
            targets: self.countdownText,
            scaleX: 1,
            scaleY: 1,
            duration: 200,
            ease: 'Back.easeOut'
          });

          // Beep on each tick
          if (window.audioManager) window.audioManager.playMenuSelect();

          // Red flash on low numbers
          if (self.countdownValue <= 3) {
            self.countdownText.setColor('#ff3333');
          }
        }

        if (self.countdownValue <= 0) {
          self.canContinue = false;
          self.onCountdownEnd();
        }
      }
    });
  }

  // ====================================================================
  // HANDLE CONTINUE (player pressed input during countdown)
  // ====================================================================

  handleContinue() {
    if (!this.canContinue || this.continued) return;
    this.continued = true;
    this.canContinue = false;

    // Stop the countdown timer
    if (this.countdownTimer) this.countdownTimer.remove(false);

    if (window.audioManager) {
      window.audioManager.stopMusic();
      window.audioManager.playMenuSelect();
    }

    // Flash and continue from the level
    var flash = this.add.rectangle(240, 135, 480, 270, 0xffffff, 0).setDepth(200);
    var self = this;

    this.tweens.add({
      targets: flash,
      alpha: 0.8,
      duration: 150,
      yoyo: true,
      onComplete: function () {
        flash.destroy();
        // Reset health but keep score
        self.registry.set('health', 5);
        if (self.fromScene) {
          self.scene.start(self.fromScene);
        } else {
          self.scene.start('Level1Scene');
        }
      }
    });
  }

  // ====================================================================
  // COUNTDOWN EXPIRED — show final score, leaderboard, play again
  // ====================================================================

  onCountdownEnd() {
    var self = this;

    // Hide countdown elements
    this.continueText.setAlpha(0);
    this.countdownText.setAlpha(0);
    if (this.insertCoinBlink) this.insertCoinBlink.stop();
    this.insertCoinText.setAlpha(0);
    this.smallScoreText.setAlpha(0);

    // Show leaderboard entry (it already displays the score)
    this.time.delayedCall(300, function () {
      self.entryUI = Leaderboard.createEntryUI(self, 160, self.finalScore, function (initials) {
        Leaderboard.addScore(initials, self.finalScore);
        // Clean up entry UI before showing leaderboard
        if (self.entryUI) self.entryUI.destroy();
        Leaderboard.createDisplayUI(self, 100);
      });

      // PLAY AGAIN + CTA shown during initials entry
      self.showPlayAgain();
      self.createCTAButton();
    });
  }

  // ====================================================================
  // CTA BUTTON
  // ====================================================================

  createCTAButton() {
    var self = this;

    var ctaBg = this.add.rectangle(240, 248, 200, 18, 0xFF1493)
      .setInteractive({ useHandCursor: true }).setDepth(300);
    this.add.text(240, 248, 'WATCH THE REAL STORY', {
      fontFamily: 'monospace', fontSize: '7px', color: '#ffffff'
    }).setOrigin(0.5).setDepth(301);

    // Blinking shimmer
    self.tweens.add({
      targets: ctaBg,
      alpha: { from: 1, to: 0.4 },
      duration: 600,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    ctaBg.on('pointerover', function () { ctaBg.setFillStyle(0xFF69B4); });
    ctaBg.on('pointerout', function () { ctaBg.setFillStyle(0xFF1493); });
    ctaBg.on('pointerdown', function () {
      if (window.audioManager) window.audioManager.playMenuSelect();
      window.open('https://example.com/documentary', '_blank');
    });
  }

  // ====================================================================
  // PLAY AGAIN BUTTON
  // ====================================================================

  showPlayAgain() {
    var self = this;

    var replayBg = this.add.rectangle(240, 264, 100, 14, 0x444444)
      .setInteractive({ useHandCursor: true }).setDepth(300);
    this.add.text(240, 264, 'PLAY AGAIN', {
      fontFamily: 'monospace',
      fontSize: '6px',
      color: '#ffffff'
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
}
