// Level2Scene.js — "Revenge of the Dart" (1992)
// Genre: Target/Aim dart throwing at a moving dartboard in a bar
class Level2Scene extends Phaser.Scene {
  constructor() {
    super({ key: 'Level2Scene' });
  }

  create() {
    // ------------------------------------------------------------------
    // Local state
    // ------------------------------------------------------------------
    this.dartsThrown = 0;
    this.bullseyeCount = 0;
    this.cooldown = false;
    this.localScore = 0;
    this.levelDone = false;
    this.MAX_DARTS = 10;
    this.thrownDarts = [];

    // ------------------------------------------------------------------
    // Background
    // ------------------------------------------------------------------
    this.add.sprite(240, 135, 'bg-bar').setOrigin(0.5);

    // Dim atmospheric overlay for bar mood
    this.add.rectangle(240, 135, 480, 270, 0x000000, 0.15).setDepth(0);

    // ------------------------------------------------------------------
    // Dartboard
    // ------------------------------------------------------------------
    this.dartboard = this.add.sprite(240, 120, 'dartboard');
    this.dartboard.setDepth(2);

    // Pin Ulrich face to dartboard center (surprise reveal!)
    this.ulrichFace = this.add.image(240, 120, 'ulrich-face');
    this.ulrichFace.setDepth(3);
    this.ulrichFace.setScale(0.5);

    // Circle mask so the square image fits the round dartboard
    this.faceMaskGfx = this.make.graphics();
    this.faceMaskGfx.fillCircle(240, 120, 30);
    this.ulrichFace.setMask(this.faceMaskGfx.createGeometryMask());

    // Dartboard movement tweens — horizontal sway
    this.tweens.add({
      targets: this.dartboard,
      x: { from: 140, to: 340 },
      duration: 2500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Vertical bob
    this.tweens.add({
      targets: this.dartboard,
      y: { from: 100, to: 140 },
      duration: 3500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // ------------------------------------------------------------------
    // Crosshair (follows pointer)
    // ------------------------------------------------------------------
    this.crosshair = this.add.sprite(240, 135, 'crosshair');
    this.crosshair.setDepth(100);

    // Hide default cursor
    this.input.setDefaultCursor('none');

    // ------------------------------------------------------------------
    // Particle emitter for hit effects
    // ------------------------------------------------------------------
    this.sparkEmitter = this.add.particles(0, 0, 'particle-spark', {
      speed: { min: 40, max: 120 },
      scale: { start: 0.8, end: 0 },
      lifespan: 300,
      blendMode: 'ADD',
      emitting: false
    });
    this.sparkEmitter.setDepth(50);

    // ------------------------------------------------------------------
    // Input: dart throwing on pointer down
    // ------------------------------------------------------------------
    var self = this;
    this.input.on('pointerdown', function (pointer) {
      self.throwDart(pointer);
    });

    // ------------------------------------------------------------------
    // HUD
    // ------------------------------------------------------------------
    // Score
    this.scoreText = this.add.text(460, 8, 'SCORE: 0', {
      fontSize: '10px',
      fontFamily: 'monospace',
      color: '#ffff00'
    }).setOrigin(1, 0).setScrollFactor(0).setDepth(100);

    // Darts counter
    this.dartsText = this.add.text(10, 8, 'DARTS: 10/10', {
      fontSize: '10px',
      fontFamily: 'monospace',
      color: '#ffffff'
    }).setOrigin(0, 0).setScrollFactor(0).setDepth(100);

    // Level indicator
    this.add.text(240, 8, 'LEVEL 2', {
      fontSize: '8px',
      fontFamily: 'monospace',
      color: '#aaaaaa'
    }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(100);

    // Instruction hint (fades out)
    this.hintText = this.add.text(240, 250, 'CLICK TO THROW DARTS!', {
      fontSize: '8px',
      fontFamily: 'monospace',
      color: '#888888'
    }).setOrigin(0.5).setScrollFactor(0).setDepth(100);

    this.tweens.add({
      targets: this.hintText,
      alpha: 0,
      delay: 3000,
      duration: 1000
    });

    // ------------------------------------------------------------------
    // Controls & Music
    // ------------------------------------------------------------------
    // Notes display (persistent from Level 1)
    var totalNotes = this.registry.get('notesCollected') || 0;
    this.notesDisplay = this.add.text(10, 258, '\u266A ' + totalNotes, {
      fontSize: '8px', fontFamily: 'monospace', color: '#9966ff'
    }).setScrollFactor(0).setDepth(100);

    this.controls = new Controls(this);
    this.controls.setupForLevel(2);

    if (window.audioManager) {
      window.audioManager.playLevel2Music();
    }

    // Pause keys
    this.pauseKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    this.pKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.P);
  }

  // ====================================================================
  // THROW DART
  // ====================================================================
  throwDart(pointer) {
    if (this.cooldown || this.dartsThrown >= this.MAX_DARTS || this.levelDone) return;

    // Target position = current crosshair position
    var targetX = this.crosshair.x;
    var targetY = this.crosshair.y;

    // Create dart at bottom center (player's hand position)
    var dart = this.add.sprite(240, 260, 'dart');
    dart.setDepth(3);
    dart.setScale(0.8);

    // Point dart toward target
    var angle = Phaser.Math.Angle.Between(240, 260, targetX, targetY);
    dart.setRotation(angle + Math.PI / 2); // adjust for sprite orientation

    // Play throw sound
    if (window.audioManager) window.audioManager.playDartThrow();

    // Set cooldown
    this.cooldown = true;
    this.dartsThrown++;

    // Update darts counter immediately
    var remaining = this.MAX_DARTS - this.dartsThrown;
    this.dartsText.setText('DARTS: ' + remaining + '/' + this.MAX_DARTS);

    // Tween dart to target
    var self = this;
    this.tweens.add({
      targets: dart,
      x: targetX,
      y: targetY,
      duration: 300,
      ease: 'Power2',
      onComplete: function () {
        self.onDartLanded(dart, targetX, targetY);
      }
    });
  }

  // ====================================================================
  // ON DART LANDED
  // ====================================================================
  onDartLanded(dart, landX, landY) {
    // Calculate distance from dart to dartboard center (current position)
    var boardX = this.dartboard.x;
    var boardY = this.dartboard.y;
    var dist = Phaser.Math.Distance.Between(landX, landY, boardX, boardY);

    var points = 0;
    var label = '';
    var labelColor = '#ffffff';

    if (dist < 10) {
      // BULLSEYE
      points = 1000;
      label = 'BULLSEYE! +1000';
      labelColor = '#ff00ff';
      this.bullseyeCount++;

      if (window.audioManager) window.audioManager.playBullseye();

      // Heavy screen shake for bullseye
      this.cameras.main.shake(300, 0.02);

      // Tint dartboard progressively redder with each bullseye
      var redShift = Math.min(this.bullseyeCount * 40, 200);
      this.dartboard.setTint(
        Phaser.Display.Color.GetColor(255, 255 - redShift, 255 - redShift)
      );

      // Large spark burst
      this.sparkEmitter.emitParticleAt(landX, landY, 15);

      // Flash effect
      var flash = this.add.rectangle(240, 135, 480, 270, 0xffffff, 0.3).setDepth(200);
      this.tweens.add({
        targets: flash,
        alpha: 0,
        duration: 200,
        onComplete: function () { flash.destroy(); }
      });

    } else if (dist < 30) {
      // INNER ring
      points = 500;
      label = 'INNER +500';
      labelColor = '#ffff00';

      if (window.audioManager) window.audioManager.playDartHit();

      this.cameras.main.shake(150, 0.008);
      this.sparkEmitter.emitParticleAt(landX, landY, 8);

    } else if (dist < 55) {
      // OUTER ring
      points = 250;
      label = 'OUTER +250';
      labelColor = '#00ff88';

      if (window.audioManager) window.audioManager.playDartHit();

      this.cameras.main.shake(100, 0.005);
      this.sparkEmitter.emitParticleAt(landX, landY, 5);

    } else {
      // MISS
      points = 0;
      label = 'MISS';
      labelColor = '#666666';

      // No screen shake, small dust puff at wall
    }

    // Add score
    if (points > 0) {
      this.localScore += points;
      this.registry.set('score', this.registry.get('score') + points);
      this.scoreText.setText('SCORE: ' + this.localScore);

      // Score text punch
      this.tweens.add({
        targets: this.scoreText,
        scaleX: 1.4,
        scaleY: 1.4,
        duration: 80,
        yoyo: true,
        ease: 'Quad.easeOut'
      });
    }

    // Floating label
    var floatText = this.add.text(landX, landY - 10, label, {
      fontSize: points >= 1000 ? '12px' : '10px',
      fontFamily: 'monospace',
      color: labelColor,
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5).setDepth(60);

    this.tweens.add({
      targets: floatText,
      y: floatText.y - 35,
      alpha: 0,
      duration: 800,
      ease: 'Quad.easeOut',
      onComplete: function () { floatText.destroy(); }
    });

    // Fade out and destroy the dart after landing
    var self2 = this;
    this.tweens.add({
      targets: dart,
      alpha: 0,
      duration: 400,
      delay: 200,
      onComplete: function () { dart.destroy(); }
    });

    // Clear cooldown after a short pause
    var self = this;
    this.time.delayedCall(700, function () {
      self.cooldown = false;

      // Check if all darts have been thrown
      if (self.dartsThrown >= self.MAX_DARTS) {
        self.levelEnd();
      }
    });
  }

  // ====================================================================
  // LEVEL END
  // ====================================================================
  levelEnd() {
    if (this.levelDone) return;
    this.levelDone = true;

    if (window.audioManager) {
      window.audioManager.stopMusic();
      window.audioManager.playLevelComplete();
    }

    this.registry.set('level2Score', this.localScore);

    // Restore cursor
    this.input.setDefaultCursor('default');
    this.crosshair.setVisible(false);

    // "LEVEL 2 COMPLETE!" banner
    var banner = this.add.text(240, 100, 'LEVEL 2 COMPLETE!', {
      fontSize: '16px',
      fontFamily: 'monospace',
      color: '#ffff00',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5).setDepth(200).setAlpha(0).setScale(0.3);

    this.tweens.add({
      targets: banner,
      alpha: 1,
      scale: 1,
      duration: 400,
      ease: 'Back.easeOut'
    });

    // Score summary
    var summary = this.add.text(240, 130, 'SCORE: ' + this.localScore, {
      fontSize: '10px',
      fontFamily: 'monospace',
      color: '#ffffff'
    }).setOrigin(0.5).setDepth(200).setAlpha(0);

    this.tweens.add({
      targets: summary,
      alpha: 1,
      delay: 500,
      duration: 300
    });

    // Bullseye count display
    if (this.bullseyeCount > 0) {
      var bsText = this.add.text(240, 148, 'BULLSEYES: ' + this.bullseyeCount, {
        fontSize: '8px',
        fontFamily: 'monospace',
        color: '#ff00ff'
      }).setOrigin(0.5).setDepth(200).setAlpha(0);

      this.tweens.add({
        targets: bsText,
        alpha: 1,
        delay: 800,
        duration: 300
      });
    }

    // Click to continue prompt
    var self = this;
    this.time.delayedCall(1500, function () {
      var continueText = self.add.text(240, 200, 'CLICK TO CONTINUE', {
        fontSize: '8px',
        fontFamily: 'monospace',
        color: '#ffffff'
      }).setOrigin(0.5).setDepth(200);

      self.tweens.add({
        targets: continueText,
        alpha: { from: 1, to: 0.3 },
        duration: 500,
        yoyo: true,
        repeat: -1
      });

      var transition = function () {
        self.input.off('pointerdown', transition);
        self.input.keyboard.off('keydown', transition);
        self.controls.destroy();
        self.scene.start('CutsceneScene', { cutscene: 'level2to3' });
      };
      self.input.on('pointerdown', transition);
      self.input.keyboard.on('keydown', transition);
    });
  }

  // ====================================================================
  // UPDATE
  // ====================================================================
  update(time, delta) {
    if (Phaser.Input.Keyboard.JustDown(this.pauseKey) || Phaser.Input.Keyboard.JustDown(this.pKey)) {
      this.scene.pause();
      this.scene.launch('PauseScene', { pausedScene: 'Level2Scene' });
      return;
    }

    // Move crosshair to follow pointer
    if (!this.levelDone) {
      var pointer = this.input.activePointer;
      this.crosshair.x = pointer.worldX;
      this.crosshair.y = pointer.worldY;

      // Subtle crosshair pulse
      var pulse = 1 + Math.sin(time * 0.006) * 0.08;
      this.crosshair.setScale(pulse);
    }

    // Ulrich face and mask follow dartboard position
    if (this.ulrichFace) {
      this.ulrichFace.x = this.dartboard.x;
      this.ulrichFace.y = this.dartboard.y;
      if (this.faceMaskGfx) {
        this.faceMaskGfx.clear();
        this.faceMaskGfx.fillCircle(this.dartboard.x, this.dartboard.y, 30);
      }
    }
  }
}
