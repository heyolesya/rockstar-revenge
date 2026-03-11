// LoseScene.js - "Casualty of Grunge" defeat ending
class LoseScene extends Phaser.Scene {
  constructor() {
    super({ key: 'LoseScene' });
  }

  create() {
    // --- Music ---
    if (window.audioManager) {
      window.audioManager.playLoseMusic();
    }

    // --- Dark alley background ---
    this.add.rectangle(240, 135, 480, 270, 0x0a0a12);

    // --- Fallen rockstar ---
    this.rockstar = this.add.sprite(200, 220, 'rockstar-hurt')
      .setAngle(12).setDepth(20);

    // --- Grunge enemies standing around ---
    var grungePositions = [
      { x: 140, flipX: false },
      { x: 260, flipX: true },
      { x: 320, flipX: true }
    ];

    this.grunges = [];
    for (var i = 0; i < grungePositions.length; i++) {
      var g = this.add.sprite(grungePositions[i].x, 200, 'grunge-idle')
        .setFlipX(grungePositions[i].flipX).setDepth(15);
      this.grunges.push(g);
    }

    // --- After 2 seconds: fade to black ---
    var self = this;
    this.time.delayedCall(2000, function () {
      self.fadeToOffice();
    });
  }

  // =============================================
  //   FADE TO OFFICE SEQUENCE
  // =============================================

  fadeToOffice() {
    var self = this;
    var fadeOverlay = this.add.rectangle(240, 135, 480, 270, 0x000000, 0).setDepth(500);

    this.tweens.add({
      targets: fadeOverlay,
      alpha: 1,
      duration: 1500,
      onComplete: function () {
        // Destroy alley elements
        self.rockstar.destroy();
        for (var i = 0; i < self.grunges.length; i++) {
          self.grunges[i].destroy();
        }
        self.grunges = [];

        // Build office scene behind the black overlay
        self.buildOfficeScene();

        // Fade the overlay back out to reveal the office
        self.tweens.add({
          targets: fadeOverlay,
          alpha: 0,
          duration: 800,
          onComplete: function () {
            fadeOverlay.destroy();
            // Start the stamp animation
            self.time.delayedCall(500, function () {
              self.playStampAnimation();
            });
          }
        });
      }
    });
  }

  // =============================================
  //   OFFICE SCENE
  // =============================================

  buildOfficeScene() {
    // Office background - dark walls
    this.add.rectangle(240, 135, 480, 270, 0x2a1f14).setDepth(0);

    // Wall upper section
    this.add.rectangle(240, 80, 480, 160, 0x3d2e1f).setDepth(1);

    // Desk - brown rectangle filling lower portion
    this.add.rectangle(240, 230, 480, 80, 0x5c3a1e).setDepth(10);

    // Desk edge highlight
    this.add.rectangle(240, 191, 480, 3, 0x7a5232).setDepth(11);

    // Paper on desk
    this.add.rectangle(240, 220, 50, 65, 0xeeeecc).setDepth(12);

    // Lines on paper
    for (var i = 0; i < 5; i++) {
      this.add.rectangle(240, 200 + i * 8, 36, 1, 0xccccaa).setDepth(13);
    }

    // --- Gold records on wall ---
    this.goldRecords = [];
    var recordPositions = [120, 240, 360];
    for (var j = 0; j < 3; j++) {
      var record = this.add.circle(recordPositions[j], 60, 12, 0xdaa520).setDepth(5);
      // Inner ring
      this.add.circle(recordPositions[j], 60, 5, 0xb8860b).setDepth(6);
      this.goldRecords.push(record);
    }
  }

  // =============================================
  //   CONTRACT TERMINATED STAMP
  // =============================================

  playStampAnimation() {
    var self = this;

    // "CONTRACT TERMINATED" slams down from above
    var stampText = this.add.text(240, -60, 'CONTRACT\nTERMINATED', {
      fontFamily: 'monospace', fontSize: '16px', color: '#cc0000',
      align: 'center', stroke: '#000000', strokeThickness: 1
    }).setOrigin(0.5).setDepth(100).setScale(3);

    this.tweens.add({
      targets: stampText,
      y: 130,
      scaleX: 1,
      scaleY: 1,
      duration: 300,
      ease: 'Bounce.easeOut',
      onComplete: function () {
        // Camera shake on impact
        self.cameras.main.shake(200, 0.02);

        if (window.audioManager) {
          window.audioManager.playPunch();
        }

        // Crack and drop gold records
        self.time.delayedCall(600, function () {
          self.crackGoldRecords();
        });

        // Start text crawl after records fall
        self.time.delayedCall(2500, function () {
          self.playTextCrawl();
        });
      }
    });
  }

  // =============================================
  //   GOLD RECORDS CRACKING
  // =============================================

  crackGoldRecords() {
    var self = this;
    var recordPositions = [120, 240, 360];

    for (var i = 0; i < this.goldRecords.length; i++) {
      var record = this.goldRecords[i];
      var rx = recordPositions[i];

      // Add crack line across the record
      var crack = this.add.rectangle(rx, 60, 20, 2, 0x000000)
        .setAngle(-30 + i * 30).setDepth(7);

      // Records fall after crack appears (staggered)
      (function (rec, crk, idx) {
        self.time.delayedCall(300 * idx, function () {
          // Crack sound
          if (window.audioManager) {
            window.audioManager.playBottleSmash();
          }

          self.tweens.add({
            targets: [rec, crk],
            y: 300,
            alpha: 0,
            duration: 800,
            ease: 'Quad.easeIn',
            delay: 200
          });
        });
      })(record, crack, i);
    }
  }

  // =============================================
  //   TEXT CRAWL
  // =============================================

  playTextCrawl() {
    var self = this;
    var crawlStyle = {
      fontFamily: 'monospace', fontSize: '8px', color: '#cccccc',
      align: 'center', wordWrap: { width: 400 }
    };

    var lines = [
      { text: 'Another casualty of grunge.', delay: 0 },
      { text: 'The label dropped him.', delay: 2000 },
      { text: 'The crowds moved on.', delay: 3800 },
      { text: 'But was this really', delay: 5800 },
      { text: 'the end of the story?', delay: 7400 }
    ];

    for (var i = 0; i < lines.length; i++) {
      (function (line, index) {
        self.time.delayedCall(line.delay, function () {
          self.typewriterText(240, 160 + index * 14, line.text, crawlStyle);
        });
      })(lines[i], i);
    }

    // Final score
    var totalScore = this.registry.get('score') || 0;
    this.time.delayedCall(9500, function () {
      var scoreText = self.add.text(240, 232, 'FINAL SCORE: ' + totalScore, {
        fontFamily: 'monospace', fontSize: '10px', color: '#ffcc00',
        stroke: '#000000', strokeThickness: 2
      }).setOrigin(0.5).setAlpha(0).setDepth(200);

      self.tweens.add({
        targets: scoreText,
        alpha: 1,
        duration: 800
      });
    });

    // Buttons
    this.time.delayedCall(11000, function () {
      self.showButtons();
    });
  }

  // =============================================
  //   CTA BUTTONS
  // =============================================

  showButtons() {
    var self = this;

    // "FIND OUT WHAT REALLY HAPPENED" button
    var ctaBg = this.add.rectangle(240, 248, 220, 18, 0xffcc00)
      .setInteractive({ useHandCursor: true }).setDepth(300);
    this.add.text(240, 248, 'FIND OUT WHAT REALLY HAPPENED', {
      fontFamily: 'monospace', fontSize: '6px', color: '#000000'
    }).setOrigin(0.5).setDepth(301);

    ctaBg.on('pointerover', function () { ctaBg.setFillStyle(0xffdd44); });
    ctaBg.on('pointerout', function () { ctaBg.setFillStyle(0xffcc00); });
    ctaBg.on('pointerdown', function () {
      if (window.audioManager) window.audioManager.playMenuSelect();
      window.open('https://example.com/documentary', '_blank');
    });

    // "PLAY AGAIN" button
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
