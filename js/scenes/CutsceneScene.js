// CutsceneScene.js - Reusable narrative transition scene
class CutsceneScene extends Phaser.Scene {
  constructor() {
    super({ key: 'CutsceneScene' });
  }

  init(data) {
    this.cutsceneId = (data && data.cutscene) ? data.cutscene : 'intro';
  }

  create() {
    this.canSkip = false;
    this.skipped = false;
    this.textQueue = [];
    this.activeTypewriters = [];

    // Minimum 2-second delay before skipping allowed
    var self = this;
    this.time.delayedCall(2000, function () {
      self.canSkip = true;
    });

    // Set up skip listeners
    this.input.keyboard.on('keydown-SPACE', this.handleSkip, this);
    this.input.on('pointerdown', this.handleSkip, this);

    // Route to appropriate cutscene
    switch (this.cutsceneId) {
      case 'intro':
        this.playIntro();
        break;
      case 'level1to2':
        this.playLevel1to2();
        break;
      case 'level2to3':
        this.playLevel2to3();
        break;
      default:
        this.playIntro();
        break;
    }

    // Cleanup on shutdown
    this.events.on('shutdown', function () {
      self.input.keyboard.off('keydown-SPACE', self.handleSkip, self);
    });
  }

  // =============================================
  //   TYPEWRITER HELPER
  // =============================================

  typewriterText(x, y, text, style, delay) {
    if (typeof delay === 'undefined') delay = 40;

    var textObj = this.add.text(x, y, '', style).setOrigin(0.5);
    var i = 0;
    var self = this;

    var event = this.time.addEvent({
      delay: delay,
      repeat: text.length - 1,
      callback: function () {
        if (i < text.length) {
          textObj.text += text[i];
          i++;
        }
      }
    });

    this.activeTypewriters.push({ event: event, textObj: textObj, fullText: text });
    return textObj;
  }

  // =============================================
  //   SKIP HANDLER
  // =============================================

  handleSkip() {
    if (!this.canSkip || this.skipped) return;

    // If there is a pending transition (tapToContinue is showing), execute it
    if (this.pendingTransition) {
      this.skipped = true;
      this.executeTransition();
      return;
    }

    // Otherwise, complete all typewriters instantly and show tap prompt
    for (var i = 0; i < this.activeTypewriters.length; i++) {
      var tw = this.activeTypewriters[i];
      if (tw.event) {
        tw.event.remove(false);
      }
      if (tw.textObj && tw.textObj.active) {
        tw.textObj.setText(tw.fullText);
      }
    }

    // Show tap to continue immediately
    if (!this.tapPromptShown) {
      this.showTapToContinue();
    }
  }

  showTapToContinue() {
    if (this.tapPromptShown) return;
    this.tapPromptShown = true;

    this.tapText = this.add.text(240, 250, 'TAP TO CONTINUE', {
      fontFamily: 'monospace', fontSize: '8px', color: '#888888'
    }).setOrigin(0.5).setDepth(100);

    // Blink
    this.tweens.add({
      targets: this.tapText,
      alpha: { from: 1, to: 0.3 },
      duration: 500,
      yoyo: true,
      repeat: -1
    });

    this.pendingTransition = true;
  }

  executeTransition() {
    if (window.audioManager) {
      window.audioManager.playMenuSelect();
    }

    var fadeOut = this.add.rectangle(240, 135, 480, 270, 0x000000, 0).setDepth(999);
    var self = this;
    this.tweens.add({
      targets: fadeOut,
      alpha: 1,
      duration: 400,
      onComplete: function () {
        var actualTarget = self.targetScene;
        var tutorialLevel = null;

        if (actualTarget === 'Level1Scene') tutorialLevel = 1;
        else if (actualTarget === 'Level2Scene') tutorialLevel = 2;
        else if (actualTarget === 'Level3Scene') tutorialLevel = 3;

        if (tutorialLevel) {
          var seen = false;
          try { seen = sessionStorage.getItem('tutorial' + tutorialLevel + 'Seen') === 'true'; } catch (e) {}
          if (!seen) {
            self.scene.start('TutorialScene', { level: tutorialLevel });
            return;
          }
        }

        self.scene.start(actualTarget);
      }
    });
  }

  // =============================================
  //   INTRO CUTSCENE
  // =============================================

  playIntro() {
    this.targetScene = 'Level1Scene';

    // Black background
    this.add.rectangle(240, 135, 480, 270, 0x000000);

    var self = this;
    var baseStyle = {
      fontFamily: 'monospace', fontSize: '10px', color: '#ffcc00',
      align: 'center', wordWrap: { width: 400 }
    };

    // Line 1: "THE YEAR IS 1987."
    this.typewriterText(240, 80, 'THE YEAR IS 1987.', baseStyle);

    // Line 2: "THE SUNSET STRIP." (after line 1 finishes ~720ms)
    this.time.delayedCall(1200, function () {
      self.typewriterText(240, 100, 'THE SUNSET STRIP.', baseStyle);
    });

    // Line 3: "HAIR METAL RULES THE WORLD."
    this.time.delayedCall(2400, function () {
      self.typewriterText(240, 120, 'HAIR METAL RULES THE WORLD.', baseStyle);
    });

    // Rockstar walks from left to center
    this.time.delayedCall(3200, function () {
      var rockstar = self.add.sprite(-50, 180, 'rockstar-idle');
      var walkFrame = 0;

      // Walk animation
      var walkAnim = self.time.addEvent({
        delay: 150,
        repeat: -1,
        callback: function () {
          walkFrame = (walkFrame % 4) + 1;
          if (rockstar.active) {
            rockstar.setTexture('rockstar-walk-' + walkFrame);
          }
        }
      });

      self.tweens.add({
        targets: rockstar,
        x: 240,
        duration: 2000,
        ease: 'Linear',
        onComplete: function () {
          walkAnim.remove(false);
          if (rockstar.active) {
            rockstar.setTexture('rockstar-idle');
          }
        }
      });
    });

    // Show tap to continue after 5 seconds
    this.time.delayedCall(5500, function () {
      self.showTapToContinue();
    });
  }

  // =============================================
  //   LEVEL 1 TO 2 CUTSCENE
  // =============================================

  playLevel1to2() {
    this.targetScene = 'Level2Scene';

    // Dark background
    this.add.rectangle(240, 135, 480, 270, 0x111111);

    var self = this;
    var l1Score = this.registry.get('level1Score') || 0;
    var notesCollected = this.registry.get('notesCollected') || 0;

    // "LEVEL 1 COMPLETE" in yellow, large
    var titleText = this.add.text(240, 50, 'LEVEL 1 COMPLETE', {
      fontFamily: 'monospace', fontSize: '14px', color: '#ffcc00',
      stroke: '#000000', strokeThickness: 2
    }).setOrigin(0.5).setAlpha(0);

    this.tweens.add({
      targets: titleText,
      alpha: 1,
      duration: 500
    });

    // Score tally
    this.time.delayedCall(800, function () {
      self.add.text(240, 80, 'SCORE: ' + l1Score, {
        fontFamily: 'monospace', fontSize: '10px', color: '#ffffff'
      }).setOrigin(0.5);
    });

    // Notes collected (subtle purple)
    this.time.delayedCall(1200, function () {
      self.add.text(240, 96, 'Notes collected: ' + notesCollected, {
        fontFamily: 'monospace', fontSize: '7px', color: '#aa66cc'
      }).setOrigin(0.5);
    });

    // Narrative typewriter text
    this.time.delayedCall(2000, function () {
      self.typewriterText(240, 130, 'The crowd loves you.', {
        fontFamily: 'monospace', fontSize: '9px', color: '#cccccc',
        align: 'center', wordWrap: { width: 400 }
      });
    });

    this.time.delayedCall(3500, function () {
      self.typewriterText(240, 148, 'But not everyone is a fan...', {
        fontFamily: 'monospace', fontSize: '9px', color: '#cccccc',
        align: 'center', wordWrap: { width: 400 }
      });
    });

    // Vocalist portrait
    this.time.delayedCall(3000, function () {
      var portrait = self.add.image(240, 200, 'vocalist-portrait-2').setAlpha(0).setScale(0.6);
      self.tweens.add({
        targets: portrait,
        alpha: 1,
        scale: 0.8,
        duration: 600,
        ease: 'Back.easeOut'
      });
    });

    // Tap to continue
    this.time.delayedCall(6000, function () {
      self.showTapToContinue();
    });
  }

  // =============================================
  //   LEVEL 2 TO 3 CUTSCENE
  // =============================================

  playLevel2to3() {
    this.targetScene = 'Level3Scene';

    // Dark background
    var bg = this.add.rectangle(240, 135, 480, 270, 0x1a1a2e);

    var self = this;
    var l2Score = this.registry.get('level2Score') || 0;

    // "LEVEL 2 COMPLETE" in yellow
    var titleText = this.add.text(240, 50, 'LEVEL 2 COMPLETE', {
      fontFamily: 'monospace', fontSize: '14px', color: '#ffcc00',
      stroke: '#000000', strokeThickness: 2
    }).setOrigin(0.5).setAlpha(0);

    this.tweens.add({
      targets: titleText,
      alpha: 1,
      duration: 500
    });

    // Score tally
    this.time.delayedCall(800, function () {
      self.add.text(240, 80, 'SCORE: ' + l2Score, {
        fontFamily: 'monospace', fontSize: '10px', color: '#ffffff'
      }).setOrigin(0.5);
    });

    // Narrative
    this.time.delayedCall(2000, function () {
      self.typewriterText(240, 120, 'That felt good.', {
        fontFamily: 'monospace', fontSize: '9px', color: '#cccccc',
        align: 'center', wordWrap: { width: 400 }
      });
    });

    this.time.delayedCall(3500, function () {
      self.typewriterText(240, 140, 'But something darker is coming', {
        fontFamily: 'monospace', fontSize: '9px', color: '#cccccc',
        align: 'center', wordWrap: { width: 400 }
      });
    });

    this.time.delayedCall(5000, function () {
      self.typewriterText(240, 158, 'from Seattle...', {
        fontFamily: 'monospace', fontSize: '9px', color: '#aa4444',
        align: 'center', wordWrap: { width: 400 }
      });
    });

    // Rain effect starts during this cutscene
    this.time.delayedCall(4500, function () {
      self.add.particles(0, 0, 'particle-rain', {
        x: { min: 0, max: 480 },
        y: -10,
        speedY: { min: 150, max: 250 },
        speedX: { min: -30, max: -10 },
        lifespan: 2000,
        frequency: 60,
        quantity: 2,
        alpha: { start: 0.4, end: 0.05 }
      });
    });

    // Background darkens
    var darkenOverlay = this.add.rectangle(240, 135, 480, 270, 0x000000, 0).setDepth(50);
    this.time.delayedCall(4000, function () {
      self.tweens.add({
        targets: darkenOverlay,
        alpha: 0.4,
        duration: 3000
      });
    });

    // Tap to continue
    this.time.delayedCall(7000, function () {
      self.showTapToContinue();
    });
  }
}
