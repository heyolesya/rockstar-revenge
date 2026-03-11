// GameOverScene.js — Game Over / Overdose screen
// Dark, dramatic game-over with siren sound and retry option
class GameOverScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameOverScene' });
  }

  create() {
    // ------------------------------------------------------------------
    // Receive data
    // ------------------------------------------------------------------
    this.finalScore = (this.scene.settings.data && this.scene.settings.data.score) || 0;
    this.canRestart = false;

    // ------------------------------------------------------------------
    // Red flash — dramatic entry
    // ------------------------------------------------------------------
    var flash = this.add.rectangle(240, 135, 480, 270, 0xff0000, 0.8).setDepth(100);

    var self = this;
    this.tweens.add({
      targets: flash,
      alpha: 0,
      duration: 800,
      ease: 'Quad.easeOut',
      onComplete: function () {
        flash.destroy();
      }
    });

    // ------------------------------------------------------------------
    // Black background (under the flash)
    // ------------------------------------------------------------------
    this.add.rectangle(240, 135, 480, 270, 0x000000, 1).setDepth(0);

    // Subtle scanline / noise overlay for gritty feel
    for (var i = 0; i < 135; i++) {
      this.add.rectangle(240, i * 2, 480, 1, 0x000000, 0.15 + Math.random() * 0.08)
        .setDepth(1);
    }

    // ------------------------------------------------------------------
    // Siren audio
    // ------------------------------------------------------------------
    if (window.audioManager) {
      window.audioManager.playSiren();
    }

    // ------------------------------------------------------------------
    // Red pulse effect — periodic ambient red flash
    // ------------------------------------------------------------------
    this.redPulse = this.add.rectangle(240, 135, 480, 270, 0xff0000, 0).setDepth(2);
    this.tweens.add({
      targets: this.redPulse,
      alpha: { from: 0, to: 0.12 },
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // ------------------------------------------------------------------
    // "GAME OVER" title
    // ------------------------------------------------------------------
    this.gameOverText = this.add.text(240, 80, 'GAME OVER', {
      fontSize: '24px',
      fontFamily: 'monospace',
      color: '#ff0000',
      stroke: '#330000',
      strokeThickness: 3
    }).setOrigin(0.5).setDepth(10).setAlpha(0);

    // Slam-in animation
    this.gameOverText.setScale(3);
    this.tweens.add({
      targets: this.gameOverText,
      alpha: 1,
      scale: 1,
      duration: 500,
      delay: 400,
      ease: 'Back.easeOut',
      onComplete: function () {
        // Screen shake on slam
        self.cameras.main.shake(300, 0.02);
      }
    });

    // ------------------------------------------------------------------
    // "OVERDOSE" subtitle
    // ------------------------------------------------------------------
    this.overdoseText = this.add.text(240, 115, 'OVERDOSE', {
      fontSize: '12px',
      fontFamily: 'monospace',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5).setDepth(10).setAlpha(0);

    this.tweens.add({
      targets: this.overdoseText,
      alpha: 1,
      delay: 1000,
      duration: 400
    });

    // ------------------------------------------------------------------
    // Final score
    // ------------------------------------------------------------------
    this.scoreDisplay = this.add.text(240, 150, 'FINAL SCORE: ' + this.finalScore, {
      fontSize: '10px',
      fontFamily: 'monospace',
      color: '#ffff00'
    }).setOrigin(0.5).setDepth(10).setAlpha(0);

    this.tweens.add({
      targets: this.scoreDisplay,
      alpha: 1,
      delay: 1500,
      duration: 400
    });

    // ------------------------------------------------------------------
    // Retry prompt (blinking)
    // ------------------------------------------------------------------
    this.retryText = this.add.text(240, 200, 'PRESS START TO RETRY', {
      fontSize: '10px',
      fontFamily: 'monospace',
      color: '#ffffff'
    }).setOrigin(0.5).setDepth(10).setAlpha(0);

    // Appear after a brief delay, then blink
    this.tweens.add({
      targets: this.retryText,
      alpha: 1,
      delay: 2200,
      duration: 300,
      onComplete: function () {
        self.canRestart = true;

        // Blink loop
        self.tweens.add({
          targets: self.retryText,
          alpha: { from: 1, to: 0.2 },
          duration: 600,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
        });
      }
    });

    // ------------------------------------------------------------------
    // Decorative "static" — random small rectangles for TV-static feel
    // ------------------------------------------------------------------
    this.staticGroup = [];
    for (var s = 0; s < 20; s++) {
      var sx = Phaser.Math.Between(0, 480);
      var sy = Phaser.Math.Between(0, 270);
      var sr = this.add.rectangle(sx, sy, Phaser.Math.Between(1, 4), 1, 0xffffff, 0)
        .setDepth(3);
      this.staticGroup.push(sr);

      this.tweens.add({
        targets: sr,
        alpha: { from: 0, to: 0.15 },
        x: sx + Phaser.Math.Between(-20, 20),
        duration: Phaser.Math.Between(200, 600),
        yoyo: true,
        repeat: -1,
        delay: Phaser.Math.Between(0, 1000)
      });
    }

    // ------------------------------------------------------------------
    // Restart input — keyboard (SPACE / ENTER) and pointer
    // ------------------------------------------------------------------
    this.input.keyboard.on('keydown-SPACE', function () {
      self.restartGame();
    });
    this.input.keyboard.on('keydown-ENTER', function () {
      self.restartGame();
    });
    this.input.on('pointerdown', function () {
      self.restartGame();
    });
  }

  // ====================================================================
  // RESTART GAME
  // ====================================================================
  restartGame() {
    if (!this.canRestart) return;
    this.canRestart = false; // prevent double-trigger

    // Reset registry
    this.registry.set('score', 0);
    this.registry.set('health', 5);
    this.registry.set('notesCollected', 0);
    this.registry.set('level1Score', 0);
    this.registry.set('level2Score', 0);
    this.registry.set('level3Score', 0);

    if (window.audioManager) {
      window.audioManager.stopMusic();
    }

    // Brief white flash before restart for visual punctuation
    var flash = this.add.rectangle(240, 135, 480, 270, 0xffffff, 0).setDepth(200);
    var self = this;

    this.tweens.add({
      targets: flash,
      alpha: 0.8,
      duration: 150,
      yoyo: true,
      onComplete: function () {
        flash.destroy();
        self.scene.start('Level1Scene');
      }
    });
  }
}
