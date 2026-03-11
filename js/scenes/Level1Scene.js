// Level1Scene.js — "Headed for a Heartbreak" (1987-1991)
// Genre: Catcher game — dodge bad items, collect good ones on a concert stage
class Level1Scene extends Phaser.Scene {
  constructor() {
    super({ key: 'Level1Scene' });
  }

  create() {
    // ------------------------------------------------------------------
    // Registry defaults
    // ------------------------------------------------------------------
    if (this.registry.get('health') === undefined || this.registry.get('health') === null) {
      this.registry.set('health', 5);
    }
    if (!this.registry.get('score')) this.registry.set('score', 0);
    if (!this.registry.get('notesCollected')) this.registry.set('notesCollected', 0);

    // ------------------------------------------------------------------
    // Local state
    // ------------------------------------------------------------------
    this.currentHealth = this.registry.get('health');
    this.localScore = 0;
    this.notesCount = 0;
    this.gameOver = false;
    this.baseFallSpeed = 200;
    this.spawnDelay = 800;
    this.walkFrame = 0;
    this.walkTimer = 0;
    this.LEVEL_DURATION = 90; // seconds
    this.invulnerable = false;

    // ------------------------------------------------------------------
    // Background
    // ------------------------------------------------------------------
    this.add.sprite(240, 135, 'bg-stage').setOrigin(0.5);

    // Simple parallax stage lights — coloured transparent rectangles that sway
    var lightColors = [0xff0066, 0x00ccff, 0xffcc00, 0xff00ff];
    for (var i = 0; i < 4; i++) {
      var lx = 60 + i * 120;
      var light = this.add.rectangle(lx, -5, 60, 30, lightColors[i], 0.18);
      light.setOrigin(0.5, 0);
      this.tweens.add({
        targets: light,
        x: lx + Phaser.Math.Between(-40, 40),
        alpha: { from: 0.12, to: 0.28 },
        duration: 2000 + i * 400,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }

    // ------------------------------------------------------------------
    // Player
    // ------------------------------------------------------------------
    this.player = this.physics.add.sprite(240, 230, 'rockstar-idle');
    this.player.setCollideWorldBounds(true);
    this.player.body.setSize(
      Math.floor(this.player.width * 0.6),
      Math.floor(this.player.height * 0.7)
    );
    this.player.setDepth(10);

    // ------------------------------------------------------------------
    // Item groups
    // ------------------------------------------------------------------
    this.goodItems = this.physics.add.group();
    this.badItems = this.physics.add.group();

    // Overlap detection
    this.physics.add.overlap(this.player, this.goodItems, this.collectGood, null, this);
    this.physics.add.overlap(this.player, this.badItems, this.collectBad, null, this);

    // ------------------------------------------------------------------
    // Particle emitter (spark bursts on collect)
    // ------------------------------------------------------------------
    this.sparkEmitter = this.add.particles(0, 0, 'particle-spark', {
      speed: { min: 60, max: 140 },
      scale: { start: 1, end: 0 },
      lifespan: 350,
      blendMode: 'ADD',
      emitting: false
    });
    this.sparkEmitter.setDepth(50);

    // ------------------------------------------------------------------
    // Spawner timer
    // ------------------------------------------------------------------
    this.spawnerEvent = this.time.addEvent({
      delay: this.spawnDelay,
      callback: this.spawnItem,
      callbackScope: this,
      loop: true
    });

    // ------------------------------------------------------------------
    // Level timer (90 seconds)
    // ------------------------------------------------------------------
    this.levelTimer = this.time.addEvent({
      delay: this.LEVEL_DURATION * 1000,
      callback: this.levelComplete,
      callbackScope: this
    });

    // ------------------------------------------------------------------
    // Difficulty ramp — every 15 seconds
    // ------------------------------------------------------------------
    this.rampEvent = this.time.addEvent({
      delay: 15000,
      callback: this.rampDifficulty,
      callbackScope: this,
      loop: true
    });

    // ------------------------------------------------------------------
    // HUD
    // ------------------------------------------------------------------
    // Health bar
    this.hbFrame = this.add.sprite(55, 12, 'healthbar-frame')
      .setOrigin(0.5, 0.5).setScrollFactor(0).setDepth(100);
    this.hbFill = this.add.sprite(7, 6, 'healthbar-fill')
      .setOrigin(0, 0).setScrollFactor(0).setDepth(101);
    this.hbFillBaseWidth = this.hbFill.width;
    this.updateHealthBar();

    // Score text
    this.scoreText = this.add.text(460, 8, 'SCORE: 0', {
      fontSize: '10px',
      fontFamily: 'monospace',
      color: '#ffff00'
    }).setOrigin(1, 0).setScrollFactor(0).setDepth(100);

    // Notes counter
    this.notesText = this.add.text(10, 258, '\u266A 0', {
      fontSize: '8px',
      fontFamily: 'monospace',
      color: '#9966ff'
    }).setOrigin(0, 1).setScrollFactor(0).setDepth(100);

    // Timer
    this.timerText = this.add.text(240, 8, this.LEVEL_DURATION + 's', {
      fontSize: '10px',
      fontFamily: 'monospace',
      color: '#ffffff'
    }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(100);

    // Level indicator
    this.add.text(240, 22, 'LEVEL 1', {
      fontSize: '8px',
      fontFamily: 'monospace',
      color: '#aaaaaa'
    }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(100);

    // ------------------------------------------------------------------
    // Controls & Music
    // ------------------------------------------------------------------
    this.controls = new Controls(this);
    this.controls.setupForLevel(1);

    if (window.audioManager) {
      window.audioManager.playLevel1Music();
    }
  }

  // ====================================================================
  // SPAWN
  // ====================================================================
  spawnItem() {
    if (this.gameOver) return;

    var randomX = Phaser.Math.Between(30, 450);
    var elapsed = this.levelTimer.getElapsed() / 1000;
    var lateGame = elapsed >= 45;

    // Weighted random selection
    var roll = Math.random() * 100;
    var type, texture, isGood;

    if (!lateGame) {
      // Early: money 30, gold 18, star 10, note 17, bottle 15, syringe 10
      if (roll < 30)       { type = 'money';      texture = 'item-money';      isGood = true; }
      else if (roll < 48)  { type = 'goldrecord';  texture = 'item-goldrecord'; isGood = true; }
      else if (roll < 58)  { type = 'star';        texture = 'item-star';       isGood = true; }
      else if (roll < 75)  { type = 'note';        texture = 'item-note';       isGood = true; }
      else if (roll < 90)  { type = 'bottle';      texture = 'item-bottle';     isGood = false; }
      else                 { type = 'syringe';     texture = 'item-syringe';    isGood = false; }
    } else {
      // Late: money 25, gold 15, star 8, note 12, bottle 22, syringe 18
      if (roll < 25)       { type = 'money';      texture = 'item-money';      isGood = true; }
      else if (roll < 40)  { type = 'goldrecord';  texture = 'item-goldrecord'; isGood = true; }
      else if (roll < 48)  { type = 'star';        texture = 'item-star';       isGood = true; }
      else if (roll < 60)  { type = 'note';        texture = 'item-note';       isGood = true; }
      else if (roll < 82)  { type = 'bottle';      texture = 'item-bottle';     isGood = false; }
      else                 { type = 'syringe';     texture = 'item-syringe';    isGood = false; }
    }

    // Create item via the group so physics body stays managed correctly
    var group = isGood ? this.goodItems : this.badItems;
    var item = group.create(randomX, -20, texture);
    item.itemType = type;
    item.setDepth(5);

    // Slightly smaller body for forgiving collection
    item.body.setSize(
      Math.floor(item.width * 0.7),
      Math.floor(item.height * 0.7)
    );

    // Fall speed with random variance
    var vy = this.baseFallSpeed + Phaser.Math.Between(0, 100);
    var vx = Phaser.Math.Between(-30, 30);
    item.setVelocity(vx, vy);

    // Gentle spin for visual flair
    this.tweens.add({
      targets: item,
      angle: Phaser.Math.Between(-180, 180),
      duration: Phaser.Math.Between(1500, 3000),
      ease: 'Linear'
    });

    if (!isGood) {
      // Bad items get a subtle red-ish tint so experienced players can read them faster
      item.setTint(0xffcccc);
    }
  }

  // ====================================================================
  // COLLECT GOOD
  // ====================================================================
  collectGood(player, item) {
    if (this.gameOver) return;

    var pointsMap = { money: 100, goldrecord: 250, star: 500, note: 50 };
    var points = pointsMap[item.itemType] || 100;

    this.localScore += points;
    this.registry.set('score', this.registry.get('score') + points);

    if (item.itemType === 'note') {
      this.notesCount++;
      this.registry.set('notesCollected', this.registry.get('notesCollected') + 1);
      this.notesText.setText('\u266A ' + this.notesCount);
    }

    // Audio
    if (window.audioManager) window.audioManager.playCoinCollect();

    // Score HUD flash
    this.scoreText.setText('SCORE: ' + this.localScore);
    this.tweens.add({
      targets: this.scoreText,
      scaleX: 1.4,
      scaleY: 1.4,
      duration: 80,
      yoyo: true,
      ease: 'Quad.easeOut'
    });

    // Floating points text
    var colorMap = { money: '#00ff00', goldrecord: '#ffd700', star: '#ff66ff', note: '#9966ff' };
    var floatColor = colorMap[item.itemType] || '#ffff00';
    var floatText = this.add.text(item.x, item.y, '+' + points, {
      fontSize: '10px',
      fontFamily: 'monospace',
      color: floatColor,
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5).setDepth(60);

    this.tweens.add({
      targets: floatText,
      y: floatText.y - 30,
      alpha: 0,
      duration: 600,
      ease: 'Quad.easeOut',
      onComplete: function () { floatText.destroy(); }
    });

    // Spark burst
    this.sparkEmitter.emitParticleAt(item.x, item.y, 6);

    item.destroy();
  }

  // ====================================================================
  // COLLECT BAD
  // ====================================================================
  collectBad(player, item) {
    if (this.gameOver || this.invulnerable) {
      item.destroy();
      return;
    }

    var damage = item.itemType === 'syringe' ? 2 : 1;
    this.currentHealth = Math.max(0, this.currentHealth - damage);
    this.registry.set('health', this.currentHealth);

    // Audio
    if (window.audioManager) {
      if (item.itemType === 'syringe') {
        window.audioManager.playHurt();
      } else {
        window.audioManager.playBottleSmash();
      }
    }

    // Brief invulnerability to prevent instant stacking
    this.invulnerable = true;
    var self = this;
    this.time.delayedCall(400, function () { self.invulnerable = false; });

    // Flash player red
    this.player.setTint(0xff0000);
    this.time.delayedCall(200, function () {
      if (self.player && self.player.active) self.player.clearTint();
    });

    // Screen shake — stronger for syringe
    this.cameras.main.shake(damage === 2 ? 250 : 150, damage === 2 ? 0.015 : 0.008);

    // Update health bar
    this.updateHealthBar();

    // Floating damage text
    var dmgText = this.add.text(item.x, item.y, '-' + damage, {
      fontSize: '12px',
      fontFamily: 'monospace',
      color: '#ff3333',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5).setDepth(60);

    this.tweens.add({
      targets: dmgText,
      y: dmgText.y - 25,
      alpha: 0,
      duration: 500,
      ease: 'Quad.easeOut',
      onComplete: function () { dmgText.destroy(); }
    });

    item.destroy();

    if (this.currentHealth <= 0) {
      this.playerDeath();
    }
  }

  // ====================================================================
  // HEALTH BAR
  // ====================================================================
  updateHealthBar() {
    var ratio = Math.max(0, this.currentHealth / 5);
    this.hbFill.setScale(ratio, 1);

    // Tint depending on health level
    if (ratio <= 0.2) {
      this.hbFill.setTint(0xff0000);
    } else if (ratio <= 0.5) {
      this.hbFill.setTint(0xffaa00);
    } else {
      this.hbFill.clearTint();
    }
  }

  // ====================================================================
  // PLAYER DEATH
  // ====================================================================
  playerDeath() {
    if (this.gameOver) return;
    this.gameOver = true;

    // Stop all timers
    this.spawnerEvent.remove(false);
    this.levelTimer.remove(false);
    this.rampEvent.remove(false);

    if (window.audioManager) window.audioManager.stopMusic();

    // Freeze player
    this.player.setTexture('rockstar-hurt');
    this.player.setVelocity(0, 0);

    // Heavy screen shake
    this.cameras.main.shake(400, 0.025);

    // Red flash overlay
    var flash = this.add.rectangle(240, 135, 480, 270, 0xff0000, 0.6).setDepth(200);
    var self = this;

    this.tweens.add({
      targets: flash,
      alpha: 0,
      duration: 1000,
      ease: 'Quad.easeOut',
      onComplete: function () {
        flash.destroy();
        self.registry.set('level1Score', self.localScore);
        self.controls.destroy();
        self.scene.start('GameOverScene', { score: self.localScore });
      }
    });
  }

  // ====================================================================
  // LEVEL COMPLETE
  // ====================================================================
  levelComplete() {
    if (this.gameOver) return;
    this.gameOver = true;

    // Stop spawner & ramp
    this.spawnerEvent.remove(false);
    this.rampEvent.remove(false);

    if (window.audioManager) {
      window.audioManager.stopMusic();
      window.audioManager.playLevelComplete();
    }

    this.registry.set('level1Score', this.localScore);

    // Destroy remaining falling items gracefully
    this.goodItems.clear(true, true);
    this.badItems.clear(true, true);

    // Victory pose
    this.player.setVelocity(0, 0);

    // "LEVEL COMPLETE!" banner with punch-in animation
    var banner = this.add.text(240, 110, 'LEVEL COMPLETE!', {
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
    var summary = this.add.text(240, 140, 'SCORE: ' + this.localScore, {
      fontSize: '10px',
      fontFamily: 'monospace',
      color: '#ffffff'
    }).setOrigin(0.5).setDepth(200).setAlpha(0);

    this.tweens.add({
      targets: summary,
      alpha: 1,
      delay: 600,
      duration: 300
    });

    var self = this;
    this.time.delayedCall(2500, function () {
      self.controls.destroy();
      self.scene.start('CutsceneScene', { cutscene: 'level1to2' });
    });
  }

  // ====================================================================
  // DIFFICULTY RAMP
  // ====================================================================
  rampDifficulty() {
    if (this.gameOver) return;

    // Decrease spawn delay (minimum 300ms)
    this.spawnDelay = Math.max(300, this.spawnDelay - 100);

    // Increase base fall speed
    this.baseFallSpeed += 25;

    // Recreate spawner with new delay
    this.spawnerEvent.remove(false);
    this.spawnerEvent = this.time.addEvent({
      delay: this.spawnDelay,
      callback: this.spawnItem,
      callbackScope: this,
      loop: true
    });
  }

  // ====================================================================
  // UPDATE
  // ====================================================================
  update(time, delta) {
    if (this.gameOver) return;

    // ------------------------------------------------------------------
    // Player movement
    // ------------------------------------------------------------------
    var speed = 200;
    if (this.controls.left) {
      this.player.setVelocityX(-speed);
      this.player.setFlipX(true);
    } else if (this.controls.right) {
      this.player.setVelocityX(speed);
      this.player.setFlipX(false);
    } else {
      this.player.setVelocityX(0);
    }

    // ------------------------------------------------------------------
    // Walk animation (texture cycling every 150ms while moving)
    // ------------------------------------------------------------------
    var isMoving = this.controls.left || this.controls.right;
    if (isMoving) {
      this.walkTimer += delta;
      if (this.walkTimer >= 150) {
        this.walkTimer -= 150;
        this.walkFrame = (this.walkFrame + 1) % 4;
        this.player.setTexture('rockstar-walk-' + (this.walkFrame + 1));
      }
    } else {
      this.player.setTexture('rockstar-idle');
      this.walkFrame = 0;
      this.walkTimer = 0;
    }

    // ------------------------------------------------------------------
    // Clean up off-screen items
    // ------------------------------------------------------------------
    var cleanGroup = function (group) {
      var children = group.getChildren();
      for (var i = children.length - 1; i >= 0; i--) {
        if (children[i].y > 290) {
          children[i].destroy();
        }
      }
    };
    cleanGroup(this.goodItems);
    cleanGroup(this.badItems);

    // ------------------------------------------------------------------
    // Timer display
    // ------------------------------------------------------------------
    var remaining = Math.max(0, Math.ceil(
      (this.levelTimer.delay - this.levelTimer.getElapsed()) / 1000
    ));
    this.timerText.setText(remaining + 's');

    // Pulse timer red in last 10 seconds
    if (remaining <= 10) {
      this.timerText.setColor('#ff3333');
      // Add a subtle pulse effect
      if (!this.timerText.getData('pulsing')) {
        this.timerText.setData('pulsing', true);
        this.tweens.add({
          targets: this.timerText,
          scaleX: 1.3,
          scaleY: 1.3,
          duration: 500,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
        });
      }
    }
  }
}
