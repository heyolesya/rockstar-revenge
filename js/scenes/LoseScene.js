// LoseScene.js - "Casualty of Grunge" defeat ending
class LoseScene extends Phaser.Scene {
  constructor() {
    super({ key: 'LoseScene' });
  }

  create() {
    // --- Music ---
    if (window.audioManager) {
      window.audioManager.playUnhappyEndMusic();
    }

    // --- Unhappy alley backdrop ---
    var backdrop = this.add.image(240, 135, 'bg-unhappy-end');
    backdrop.setDisplaySize(480, 270).setDepth(0);

    // --- Grunge guys in the back (behind hero) ---
    this.grungeCrouch = this.add.image(260, 140, 'grunge-hires-2')
      .setFlipX(true).setScale(0.13).setDepth(5);
    var grungeLeft = this.add.image(190, 155, 'grunge-hires-1')
      .setFlipX(false).setScale(0.14).setDepth(6);
    var grungeRight = this.add.image(330, 158, 'grunge-hires-3')
      .setFlipX(true).setScale(0.14).setDepth(6);

    // --- Fallen rockstar in the puddle (front, on top) ---
    this.rockstar = this.add.image(240, 195, 'fallen-hero')
      .setScale(0.1).setDepth(15);

    this.grunges = [grungeLeft, this.grungeCrouch, grungeRight];

    // --- After 3 seconds: fade to text crawl ---
    var self = this;
    this.time.delayedCall(3000, function () {
      self.fadeToTextCrawl();
    });
  }

  // =============================================
  //   FADE TO TEXT CRAWL
  // =============================================

  fadeToTextCrawl() {
    var self = this;

    // Dim overlay for text readability
    var dimOverlay = this.add.rectangle(240, 135, 480, 270, 0x000000, 0).setDepth(50);

    this.tweens.add({
      targets: dimOverlay,
      alpha: 0.6,
      duration: 1500,
      onComplete: function () {
        // Fade out characters
        self.tweens.add({
          targets: [self.rockstar].concat(self.grunges),
          alpha: 0,
          duration: 500
        });

        self.time.delayedCall(600, function () {
          self.playTextCrawl();
        });
      }
    });
  }

  // =============================================
  //   TEXT CRAWL
  // =============================================

  playTextCrawl() {
    var self = this;
    var crawlStyle = {
      fontFamily: 'monospace', fontSize: '8px', color: '#cccccc',
      align: 'center', wordWrap: { width: 400 },
      stroke: '#000000', strokeThickness: 2
    };

    var lines = [
      { text: 'Another casualty of grunge.', delay: 0 },
      { text: 'The label dropped him.', delay: 2000 },
      { text: 'The crowds moved on.', delay: 3800 },
      { text: 'But was this really', delay: 5800 },
      { text: 'the end of the story?', delay: 7400 }
    ];

    // Store story text objects for cleanup
    this.storyTexts = [];
    for (var i = 0; i < lines.length; i++) {
      (function (line, index) {
        self.time.delayedCall(line.delay, function () {
          var t = self.typewriterText(240, 80 + index * 18, line.text, crawlStyle);
          self.storyTexts.push(t);
        });
      })(lines[i], i);
    }

    // Final score
    var totalScore = this.registry.get('score') || 0;
    this.time.delayedCall(9500, function () {
      self.finalScoreText = self.add.text(240, 200, 'FINAL SCORE: ' + totalScore, {
        fontFamily: 'monospace', fontSize: '10px', color: '#ffcc00',
        stroke: '#000000', strokeThickness: 2
      }).setOrigin(0.5).setAlpha(0).setDepth(200);

      self.tweens.add({
        targets: self.finalScoreText,
        alpha: 1,
        duration: 800
      });
    });

    // Leaderboard entry, then buttons
    self.time.delayedCall(10500, function() {
      // Hide story text and final score to make room
      for (var k = 0; k < self.storyTexts.length; k++) {
        self.storyTexts[k].setAlpha(0);
      }
      if (self.finalScoreText) self.finalScoreText.setAlpha(0);

      // Dark overlay for leaderboard readability
      self.add.rectangle(240, 135, 480, 270, 0x000000, 0.7).setDepth(190);

      var totalScore2 = self.registry.get('score') || 0;
      self.entryUI = Leaderboard.createEntryUI(self, 160, totalScore2, function(initials) {
        Leaderboard.addScore(initials, totalScore2);
        if (self.entryUI) self.entryUI.destroy();
        Leaderboard.createDisplayUI(self, 100);
      });

      // PLAY AGAIN + CTA shown during initials entry
      self.showButtons();
      self.createCTAButton();
    });
  }

  // =============================================
  //   CTA BUTTON (shown during initials entry)
  // =============================================

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

  showButtons() {
    var self = this;

    // "PLAY AGAIN" button only
    var replayBg = this.add.rectangle(240, 264, 100, 14, 0x444444)
      .setInteractive({ useHandCursor: true }).setDepth(300);
    this.add.text(240, 264, 'PLAY AGAIN', {
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
