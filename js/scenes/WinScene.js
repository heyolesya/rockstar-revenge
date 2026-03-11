// WinScene.js - "Reinvention" victory ending
class WinScene extends Phaser.Scene {
  constructor() {
    super({ key: 'WinScene' });
  }

  create() {
    // --- Music ---
    if (window.audioManager) {
      window.audioManager.playWinMusic();
    }

    // --- Dark background ---
    this.add.rectangle(240, 135, 480, 270, 0x111122);

    var self = this;

    // --- Rockstar in fighting pose at center ---
    this.rockstar = this.add.sprite(240, 160, 'rockstar-attack-3');

    // --- After 1 second: scissors animation ---
    this.time.delayedCall(1000, function () {
      self.playScissorsAnimation();
    });
  }

  // =============================================
  //   SCISSORS / TRANSFORMATION
  // =============================================

  playScissorsAnimation() {
    var self = this;

    // Two diagonal lines crossing over the hair area
    var scissor1 = this.add.rectangle(140, 120, 60, 3, 0xcccccc)
      .setAngle(-30).setAlpha(0).setDepth(100);
    var scissor2 = this.add.rectangle(340, 120, 60, 3, 0xcccccc)
      .setAngle(30).setAlpha(0).setDepth(100);

    // Scissors converge from sides
    this.tweens.add({
      targets: scissor1,
      x: 240,
      alpha: 1,
      duration: 500,
      ease: 'Power2'
    });

    this.tweens.add({
      targets: scissor2,
      x: 240,
      alpha: 1,
      duration: 500,
      ease: 'Power2',
      onComplete: function () {
        // Snip flash
        var snipFlash = self.add.rectangle(240, 140, 100, 40, 0xffffff, 0.7).setDepth(101);
        self.tweens.add({
          targets: snipFlash,
          alpha: 0,
          duration: 300,
          onComplete: function () {
            snipFlash.destroy();
            scissor1.destroy();
            scissor2.destroy();
          }
        });

        // Swap to transformed texture
        self.rockstar.setTexture('rockstar-transformed');

        // Continue with the rest of the scene
        self.time.delayedCall(500, function () {
          self.playPostTransformation();
        });
      }
    });
  }

  // =============================================
  //   POST-TRANSFORMATION SEQUENCE
  // =============================================

  playPostTransformation() {
    var self = this;

    // --- Sunlight effect: yellow/orange triangles from top ---
    var sunRays = [];
    var rayColors = [0xffcc44, 0xffaa22, 0xffdd66, 0xff9911, 0xffee88];
    for (var i = 0; i < 5; i++) {
      var rx = 60 + i * 90;
      var triangle = this.add.triangle(
        rx, -20,
        0, 0,
        -20 - i * 4, 160,
        20 + i * 4, 160,
        rayColors[i]
      ).setAlpha(0).setDepth(10);
      sunRays.push(triangle);
    }

    this.tweens.add({
      targets: sunRays,
      alpha: 0.15,
      y: 40,
      duration: 2000,
      ease: 'Sine.easeOut'
    });

    // --- Grunge enemies walking off screen ---
    this.time.delayedCall(500, function () {
      self.spawnRetreat();
    });

    // --- Typewriter text crawl ---
    var lines = [
      { text: 'The hair metal era was over.', delay: 1500 },
      { text: 'But the music never died.', delay: 3500 },
      { text: 'The rockstar reinvented himself \u2014', delay: 5500 },
      { text: 'studying classical composition', delay: 7200 },
      { text: 'and orchestration.', delay: 8800 },
      { text: 'He proved that real musicians', delay: 10500 },
      { text: "don't fade away.", delay: 12200 },
      { text: 'They evolve.', delay: 13800 }
    ];

    var crawlStyle = {
      fontFamily: 'monospace', fontSize: '8px', color: '#cccccc',
      align: 'center', wordWrap: { width: 400 }
    };

    // Move rockstar up and shrink for text room
    this.tweens.add({
      targets: this.rockstar,
      y: 70,
      scaleX: 0.8,
      scaleY: 0.8,
      duration: 1000
    });

    for (var j = 0; j < lines.length; j++) {
      (function (line) {
        self.time.delayedCall(line.delay, function () {
          self.typewriterText(240, 110 + 14 * lines.indexOf(line), line.text, crawlStyle);
        });
      })(lines[j]);
    }

    // --- Final score ---
    var totalScore = this.registry.get('score') || 0;
    this.time.delayedCall(15500, function () {
      var scoreText = self.add.text(240, 230, 'FINAL SCORE: ' + totalScore, {
        fontFamily: 'monospace', fontSize: '10px', color: '#ffcc00',
        stroke: '#000000', strokeThickness: 2
      }).setOrigin(0.5).setAlpha(0).setDepth(200);

      self.tweens.add({
        targets: scoreText,
        alpha: 1,
        duration: 800
      });
    });

    // --- CTA Buttons ---
    this.time.delayedCall(17000, function () {
      self.showButtons();
    });
  }

  // =============================================
  //   GRUNGE RETREAT
  // =============================================

  spawnRetreat() {
    var positions = [
      { x: 120, target: -50 },
      { x: 360, target: 530 },
      { x: 200, target: -50 }
    ];

    for (var i = 0; i < positions.length; i++) {
      var enemy = this.add.sprite(positions[i].x, 200, 'grunge-idle')
        .setDepth(5).setAlpha(0.7);

      var walkFrame = 0;
      var self = this;

      // Walk animation
      (function (sprite) {
        self.time.addEvent({
          delay: 150,
          repeat: 10,
          callback: function () {
            walkFrame = (walkFrame % 4) + 1;
            if (sprite.active) {
              sprite.setTexture('grunge-walk-' + walkFrame);
            }
          }
        });
      })(enemy);

      // Walk off screen
      var goingLeft = positions[i].target < 0;
      enemy.setFlipX(!goingLeft);
      this.tweens.add({
        targets: enemy,
        x: positions[i].target,
        duration: 2500,
        ease: 'Linear',
        onComplete: function () { enemy.destroy(); }
      });
    }
  }

  // =============================================
  //   CTA BUTTONS
  // =============================================

  showButtons() {
    var self = this;

    // "WATCH THE FULL STORY" button
    var ctaBg = this.add.rectangle(240, 245, 200, 18, 0xffcc00)
      .setInteractive({ useHandCursor: true }).setDepth(300);
    var ctaText = this.add.text(240, 245, 'WATCH THE FULL STORY', {
      fontFamily: 'monospace', fontSize: '7px', color: '#000000'
    }).setOrigin(0.5).setDepth(301);

    ctaBg.on('pointerover', function () { ctaBg.setFillStyle(0xffdd44); });
    ctaBg.on('pointerout', function () { ctaBg.setFillStyle(0xffcc00); });
    ctaBg.on('pointerdown', function () {
      if (window.audioManager) window.audioManager.playMenuSelect();
      window.open('https://example.com/documentary', '_blank');
    });

    // "PLAY AGAIN" button
    var replayBg = this.add.rectangle(240, 262, 100, 14, 0x444444)
      .setInteractive({ useHandCursor: true }).setDepth(300);
    var replayText = this.add.text(240, 262, 'PLAY AGAIN', {
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
