// Level3Scene.js - Side-scrolling brawler: "Smells Like the End" (1992-1994)
class Level3Scene extends Phaser.Scene {
  constructor() {
    super({ key: 'Level3Scene' });
  }

  create() {
    this.gameOver = false;

    // ------------------------------------------------------------------
    // Parallax scrolling background
    // ------------------------------------------------------------------
    // Far layer: dark city skyline (depth 0, scrolls slower)
    this.skylineElements = [];
    var buildingColors = [0x111122, 0x0a0a1a, 0x141428, 0x0d0d1f, 0x181830];
    for (var b = 0; b < 12; b++) {
      var bw = Phaser.Math.Between(30, 60);
      var bh = Phaser.Math.Between(40, 100);
      var bx = b * 42 + Phaser.Math.Between(-5, 5);
      var building = this.add.rectangle(bx, 270 - bh / 2 - 40, bw, bh,
        buildingColors[b % buildingColors.length], 1)
        .setDepth(0);
      this.skylineElements.push(building);

      // Occasional lit windows
      if (Math.random() > 0.4) {
        var winCount = Phaser.Math.Between(1, 4);
        for (var w = 0; w < winCount; w++) {
          var wx = bx + Phaser.Math.Between(-bw / 3, bw / 3);
          var wy = (270 - bh - 40) + Phaser.Math.Between(8, bh - 8);
          var win = this.add.rectangle(wx, wy, 3, 3, 0xffdd66, 0.6).setDepth(0);
          this.skylineElements.push(win);
        }
      }
    }

    // Near layer: bg-alley (depth 1)
    this.add.image(240, 135, 'bg-alley').setDepth(1);

    // ------------------------------------------------------------------
    // Floor line — classic beat-em-up walkable floor (depth 2)
    // ------------------------------------------------------------------
    this.add.rectangle(240, 210, 480, 2, 0x6666aa, 0.5).setDepth(2);
    // Subtle floor highlight strip
    this.add.rectangle(240, 212, 480, 4, 0x555588, 0.35).setDepth(2);
    // Ambient ground glow for visibility
    this.add.rectangle(240, 225, 480, 30, 0x222244, 0.3).setDepth(1);

    // ------------------------------------------------------------------
    // Grunge guys sitting at the sides (depth 3)
    // ------------------------------------------------------------------
    this.add.image(30, 195, 'grunge-sitting').setDepth(3);
    this.add.image(450, 195, 'grunge-sitting').setDepth(3).setFlipX(true);

    // ------------------------------------------------------------------
    // Rain particle system — enhanced with wind angle and more particles
    // ------------------------------------------------------------------
    this.rainEmitter = this.add.particles(0, 0, 'particle-rain', {
      x: { min: -40, max: 520 },
      y: -10,
      speedY: { min: 250, max: 380 },
      speedX: { min: -60, max: -30 },
      lifespan: 1800,
      frequency: 20,
      quantity: 3,
      alpha: { start: 0.7, end: 0.1 },
      rotate: { min: -5, max: -15 }
    });
    this.rainEmitter.setDepth(50);

    // Rain splash particles on the ground
    this.splashEmitter = this.add.particles(0, 0, 'particle-spark', {
      x: { min: 0, max: 480 },
      y: { min: 208, max: 215 },
      speedY: { min: -20, max: -50 },
      speedX: { min: -15, max: 15 },
      lifespan: 200,
      frequency: 80,
      quantity: 1,
      scale: { start: 0.3, end: 0 },
      alpha: { start: 0.4, end: 0 },
      tint: 0x8888cc
    });
    this.splashEmitter.setDepth(3);

    // ------------------------------------------------------------------
    // Player (depth 10)
    // ------------------------------------------------------------------
    this.player = this.physics.add.sprite(100, 200, 'rockstar-idle');
    this.player.setCollideWorldBounds(true);
    this.player.body.setSize(
      Math.floor(this.player.width * 0.6),
      Math.floor(this.player.height * 0.8)
    );
    this.player.setDepth(10);
    this.playerFacing = 1; // 1 = right, -1 = left

    // --- Health from registry (heal to at least 3) ---
    var regHealth = this.registry.get('health');
    this.currentHealth = Math.max(3, (typeof regHealth === 'number') ? regHealth : 3);
    this.registry.set('health', this.currentHealth);

    // --- Notes collected from registry ---
    this.notesCollected = this.registry.get('notesCollected') || 0;

    // --- Score ---
    this.score = this.registry.get('score') || 0;

    // --- Groups ---
    this.enemies = this.physics.add.group();
    this.pickups = this.physics.add.group();
    this.projectiles = this.physics.add.group();

    // --- Overlaps ---
    this.physics.add.overlap(this.player, this.pickups, this.collectPickup, null, this);
    this.physics.add.overlap(this.projectiles, this.player, this.projectileHitPlayer, null, this);

    // --- Wave system ---
    this.waves = [
      { count: 2, sides: ['right', 'right'] },
      { count: 3, sides: ['left', 'right', 'left'] },
      { count: 4, sides: ['right', 'left', 'right', 'left'] }
    ];
    this.currentWave = 0;
    this.activeEnemies = 0;
    this.enemiesDefeatedInWave = 0;
    this.waveInProgress = false;
    this.waveTransition = false;

    // --- Player weapon state ---
    this.hasGuitar = false;
    this.guitarHitsLeft = 0;

    // --- Attack cooldown ---
    this.canAttack = true;
    this.attackCooldown = 300;

    // --- Golden power ---
    this.hasPower = false;
    this.powerChecked = false;

    // --- Invulnerability ---
    this.isInvulnerable = false;

    // --- Walk animation frame tracking ---
    this.walkFrame = 0;
    this.walkTimer = 0;
    this.walkFrameDelay = 120;

    // --- Attack animation state ---
    this.isAttacking = false;

    // --- Combo counter ---
    this.comboCount = 0;
    this.comboText = null;

    // --- HUD ---
    this.createHUD();

    // --- Controls ---
    this.controls = new Controls(this);
    this.controls.setupForLevel(3);

    // --- Notes display (persistent from Level 1) — prominent ---
    var totalNotes = this.registry.get('notesCollected') || 0;
    this.notesDisplay = this.add.text(472, 20, 'NOTES: ' + totalNotes, {
      fontSize: '7px', fontFamily: 'monospace', color: '#cc88ff',
      stroke: '#000000', strokeThickness: 1
    }).setOrigin(1, 0).setScrollFactor(0).setDepth(900);

    // --- Music ---
    if (window.audioManager) {
      window.audioManager.playLevel3Music();
    }

    // --- Pause keys ---
    this.pauseKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    this.pKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.P);

    // --- Skyline scroll offset ---
    this.skylineOffset = 0;

    // --- Start wave 1 after 1-second delay ---
    var self = this;
    this.time.delayedCall(1000, function () {
      self.spawnWave(0);
    });

    // --- Clean up on scene shutdown ---
    this.events.on('shutdown', this.shutdown, this);
  }

  // =============================================
  //   HUD — classic beat-em-up style
  // =============================================

  createHUD() {
    // Player name label above health bar
    this.add.text(8, 2, 'ROCKSTAR', {
      fontFamily: 'monospace', fontSize: '6px', color: '#ffffff'
    }).setOrigin(0, 0).setScrollFactor(0).setDepth(900);

    // Health bar background
    this.add.rectangle(8, 12, 62, 8, 0x333333)
      .setOrigin(0, 0).setScrollFactor(0).setDepth(900);

    // Health bar border
    var border = this.add.rectangle(8, 12, 62, 8)
      .setOrigin(0, 0).setScrollFactor(0).setDepth(901);
    border.setStrokeStyle(1, 0xffffff);
    border.isFilled = false;

    // Health bar fill
    this.hudHealthFill = this.add.rectangle(9, 13, 60, 6, 0x33ff33)
      .setOrigin(0, 0).setScrollFactor(0).setDepth(902);
    this.updateHealthBar();

    // Score
    this.hudScore = this.add.text(472, 8, 'SCORE: ' + this.score, {
      fontFamily: 'monospace', fontSize: '8px', color: '#ffcc00'
    }).setOrigin(1, 0).setScrollFactor(0).setDepth(900);

    // Wave indicator
    this.hudWave = this.add.text(240, 8, 'WAVE 1/3', {
      fontFamily: 'monospace', fontSize: '8px', color: '#ffffff'
    }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(900);

    // Weapon indicator
    this.hudWeapon = this.add.text(8, 24, 'MIC STAND', {
      fontFamily: 'monospace', fontSize: '6px', color: '#aaaaaa'
    }).setOrigin(0, 0).setScrollFactor(0).setDepth(900);
  }

  updateHealthBar() {
    var pct = Math.max(0, this.currentHealth) / 5;
    this.hudHealthFill.width = Math.max(0, 60 * pct);
    // Green -> Yellow -> Red as health decreases
    if (pct > 0.6) {
      this.hudHealthFill.fillColor = 0x33ff33;
    } else if (pct > 0.3) {
      this.hudHealthFill.fillColor = 0xffcc00;
    } else {
      this.hudHealthFill.fillColor = 0xff3333;
    }
  }

  updateHUD() {
    this.hudScore.setText('SCORE: ' + this.score);
    this.hudWave.setText('WAVE ' + (this.currentWave + 1) + '/' + this.waves.length);
    if (this.hasGuitar) {
      this.hudWeapon.setText('GUITAR (' + this.guitarHitsLeft + ')');
      this.hudWeapon.setColor('#ffcc00');
    } else {
      this.hudWeapon.setText('MIC STAND');
      this.hudWeapon.setColor('#aaaaaa');
    }
    this.updateHealthBar();
  }

  // =============================================
  //   COMBO SYSTEM
  // =============================================

  incrementCombo() {
    this.comboCount++;
    if (this.comboCount > 2) {
      this.showCombo();
    }
  }

  resetCombo() {
    this.comboCount = 0;
    if (this.comboText) {
      this.comboText.destroy();
      this.comboText = null;
    }
  }

  showCombo() {
    // Destroy previous combo text if it exists
    if (this.comboText) {
      this.comboText.destroy();
    }

    this.comboText = this.add.text(240, 40, this.comboCount + ' HIT COMBO!', {
      fontFamily: 'monospace', fontSize: '12px', color: '#ff6600',
      stroke: '#000000', strokeThickness: 3
    }).setOrigin(0.5).setScrollFactor(0).setDepth(850);

    // Punch-in animation
    this.comboText.setScale(2);
    this.tweens.add({
      targets: this.comboText,
      scaleX: 1,
      scaleY: 1,
      duration: 150,
      ease: 'Back.easeOut'
    });

    // Auto-fade after a while
    var self = this;
    this.time.delayedCall(1500, function () {
      if (self.comboText && self.comboText.active) {
        self.tweens.add({
          targets: self.comboText,
          alpha: 0,
          duration: 300,
          onComplete: function () {
            if (self.comboText) {
              self.comboText.destroy();
              self.comboText = null;
            }
          }
        });
      }
    });
  }

  // =============================================
  //   WAVE SPAWNING
  // =============================================

  spawnWave(waveIndex) {
    if (this.gameOver) return;

    this.currentWave = waveIndex;
    this.enemiesDefeatedInWave = 0;
    this.waveInProgress = true;
    this.waveTransition = false;

    var wave = this.waves[waveIndex];
    this.activeEnemies = wave.count;

    this.updateHUD();
    this.showWaveAnnouncement(waveIndex + 1);

    // Spawn enemies with staggered delay
    var self = this;
    for (var i = 0; i < wave.count; i++) {
      (function (index) {
        self.time.delayedCall(300 * index + 800, function () {
          if (!self.gameOver) {
            self.spawnEnemy(wave.sides[index], waveIndex);
          }
        });
      })(i);
    }
  }

  showWaveAnnouncement(waveNum) {
    // Dramatic slam-in wave announcement with screen shake
    var txt = this.add.text(240, 100, 'WAVE ' + waveNum, {
      fontFamily: 'monospace', fontSize: '24px', color: '#ff4444',
      stroke: '#000000', strokeThickness: 4
    }).setOrigin(0.5).setAlpha(0).setDepth(800).setScale(3);

    // Slam-in: scale from large to normal with bounce
    this.tweens.add({
      targets: txt,
      alpha: 1,
      scaleX: 1,
      scaleY: 1,
      duration: 300,
      ease: 'Back.easeOut'
    });

    // Screen shake on slam
    this.cameras.main.shake(150, 0.012);

    // Hold then fade out
    var self = this;
    this.time.delayedCall(1200, function () {
      self.tweens.add({
        targets: txt,
        alpha: 0,
        y: txt.y - 15,
        duration: 400,
        onComplete: function () { txt.destroy(); }
      });
    });
  }

  spawnEnemy(side, waveIndex) {
    if (this.gameOver) return;

    var startX = (side === 'left') ? -30 : 510;
    var startY = Phaser.Math.Between(180, 230);

    var enemyTypes = ['grunge', 'beavis', 'butthead'];
    var enemyType = enemyTypes[Phaser.Math.Between(0, enemyTypes.length - 1)];
    var enemy = this.physics.add.sprite(startX, startY, enemyType + '-idle');
    enemy.body.setSize(
      Math.floor(enemy.width * 0.6),
      Math.floor(enemy.height * 0.8)
    );
    enemy.setDepth(10);

    var isHardWave = (waveIndex >= 3 && !this.hasPower);
    enemy.customData = {
      type: enemyType,
      hp: isHardWave ? 4 : 3,
      maxHp: isHardWave ? 4 : 3,
      facing: (side === 'left') ? 1 : -1,
      state: 'entering',    // Start with entrance state
      attackTimer: 0,
      attackExecuted: false,
      hurtTimer: 0,
      walkFrame: 0,
      walkTimer: 0,
      speedMultiplier: this.hasPower ? 0.6 : 1.0,
      enterTargetX: (side === 'left') ? Phaser.Math.Between(40, 180) : Phaser.Math.Between(300, 440)
    };

    enemy.setFlipX(side === 'right');

    // Brighten enemies for contrast against dark alley background
    if (enemyType === 'beavis') {
      enemy.setTint(0xffddcc); // warm bright tint
    } else if (enemyType === 'butthead') {
      enemy.setTint(0xddddff); // cool bright tint
    } else {
      enemy.setTint(0xeeddcc); // slight warm boost for grunge
    }

    this.enemies.add(enemy);
  }

  // =============================================
  //   NOTES MECHANIC (after wave 3)
  // =============================================

  checkNotesMechanic() {
    if (this.powerChecked) return;
    this.powerChecked = true;

    // Show notes count dramatically
    var notesColor = (this.notesCollected >= 15) ? '#33ff33' : '#ff3333';
    var notesStatusText = this.add.text(240, 70, 'MUSICAL NOTES: ' + this.notesCollected + '/15', {
      fontFamily: 'monospace', fontSize: '12px', color: notesColor,
      stroke: '#000000', strokeThickness: 3
    }).setOrigin(0.5).setDepth(850).setScale(2).setAlpha(0);

    // Slam-in animation
    this.tweens.add({
      targets: notesStatusText,
      alpha: 1,
      scaleX: 1,
      scaleY: 1,
      duration: 400,
      ease: 'Back.easeOut'
    });

    // Screen shake for dramatic effect
    this.cameras.main.shake(200, 0.01);

    var self = this;
    this.time.delayedCall(2000, function () {
      self.tweens.add({
        targets: notesStatusText,
        alpha: 0,
        duration: 500,
        onComplete: function () { notesStatusText.destroy(); }
      });
    });

    if (this.notesCollected >= 15) {
      this.time.delayedCall(500, function () {
        self.activateGoldenPower();
      });
    }

    // Spawn guitar pickup between waves
    this.spawnGuitarPickup(240, 210);
  }

  activateGoldenPower() {
    this.hasPower = true;

    // Flash screen gold
    var flash = this.add.rectangle(240, 135, 480, 270, 0xffdd00, 0.5).setDepth(700);
    this.tweens.add({
      targets: flash,
      alpha: 0,
      duration: 1000,
      onComplete: function () { flash.destroy(); }
    });

    // Spark emitter following player
    this.powerEmitter = this.add.particles(0, 0, 'particle-spark', {
      follow: this.player,
      speed: { min: 20, max: 60 },
      lifespan: 600,
      frequency: 80,
      quantity: 1,
      scale: { start: 1, end: 0 },
      tint: [0xffdd00, 0xffaa00, 0xffffff],
      blendMode: 'ADD'
    });

    // Power text
    var powerText = this.add.text(240, 80, 'THE POWER OF MUSIC!', {
      fontFamily: 'monospace', fontSize: '12px', color: '#ffdd00',
      stroke: '#000000', strokeThickness: 3
    }).setOrigin(0.5).setDepth(800);

    this.tweens.add({
      targets: powerText,
      alpha: 0,
      y: 60,
      delay: 2000,
      duration: 500,
      onComplete: function () { powerText.destroy(); }
    });

    // Slow existing enemies
    var children = this.enemies.getChildren();
    for (var i = 0; i < children.length; i++) {
      if (children[i].active && children[i].customData) {
        children[i].customData.speedMultiplier = 0.6;
      }
    }

    if (window.audioManager) {
      window.audioManager.playCrowdCheer();
    }
  }

  // =============================================
  //   PICKUPS
  // =============================================

  spawnGuitarPickup(x, y) {
    var pickup = this.physics.add.sprite(x, y, 'item-guitar');
    pickup.setDepth(10);
    this.pickups.add(pickup);

    // Bobbing
    this.tweens.add({
      targets: pickup,
      y: y - 6,
      duration: 600,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Glow pulse — pulsing yellow circle behind the pickup
    var glow = this.add.circle(x, y, 14, 0xffdd00, 0.3).setDepth(9);
    this.tweens.add({
      targets: glow,
      alpha: { from: 0.1, to: 0.5 },
      scaleX: { from: 0.8, to: 1.3 },
      scaleY: { from: 0.8, to: 1.3 },
      duration: 400,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
    // Also bob the glow with the pickup
    this.tweens.add({
      targets: glow,
      y: y - 6,
      duration: 600,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
    pickup.glowCircle = glow;

    // Alpha pulse on pickup itself
    this.tweens.add({
      targets: pickup,
      alpha: { from: 0.7, to: 1 },
      duration: 400,
      yoyo: true,
      repeat: -1
    });
  }

  collectPickup(player, pickup) {
    // Destroy glow circle if it exists
    if (pickup.glowCircle) {
      pickup.glowCircle.destroy();
    }
    pickup.destroy();
    this.hasGuitar = true;
    this.guitarHitsLeft = 5;

    if (window.audioManager) {
      window.audioManager.playCoinCollect();
    }

    var txt = this.add.text(player.x, player.y - 20, 'GUITAR!', {
      fontFamily: 'monospace', fontSize: '8px', color: '#ffcc00',
      stroke: '#000000', strokeThickness: 2
    }).setOrigin(0.5).setDepth(800);

    this.tweens.add({
      targets: txt,
      y: txt.y - 20,
      alpha: 0,
      duration: 800,
      onComplete: function () { txt.destroy(); }
    });

    this.updateHUD();
  }

  // =============================================
  //   PLAYER ATTACK
  // =============================================

  performAttack() {
    if (!this.canAttack || this.gameOver || this.isAttacking) return;

    this.canAttack = false;
    this.isAttacking = true;

    var self = this;
    var attackTextures = ['rockstar-attack-1', 'rockstar-attack-2', 'rockstar-attack-3'];
    var frameIndex = 0;

    this.player.setTexture(attackTextures[0]);

    // Cycle attack textures over 300ms (3 frames at 100ms each)
    this.time.addEvent({
      delay: 100,
      repeat: 2,
      callback: function () {
        frameIndex++;
        if (frameIndex < attackTextures.length && self.player.active) {
          self.player.setTexture(attackTextures[frameIndex]);
        }
      }
    });

    // Calculate hit range and damage
    var range = this.hasGuitar ? 60 : 40;
    var damage = this.hasGuitar ? 2 : 1;
    if (this.hasPower) {
      range = Math.floor(range * 1.5);
    }

    if (window.audioManager) {
      window.audioManager.playPunch();
    }

    // Check overlap with each enemy
    var children = this.enemies.getChildren();
    var hitAny = false;
    for (var i = 0; i < children.length; i++) {
      var enemy = children[i];
      if (!enemy.active || !enemy.customData || enemy.customData.state === 'defeated') continue;

      var dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, enemy.x, enemy.y);
      var dirToEnemy = enemy.x - this.player.x;
      var facingEnemy = (this.playerFacing > 0 && dirToEnemy > 0) ||
                        (this.playerFacing < 0 && dirToEnemy < 0);

      if (dist < range && facingEnemy) {
        this.hitEnemy(enemy, damage);
        hitAny = true;
      }
    }

    // Screen shake on hit for impact feel
    if (hitAny) {
      this.cameras.main.shake(80, 0.008);
      this.incrementCombo();
    }

    // Guitar durability
    if (this.hasGuitar) {
      this.guitarHitsLeft--;
      if (this.guitarHitsLeft <= 0) {
        this.hasGuitar = false;

        if (window.audioManager) {
          window.audioManager.playBottleSmash();
        }

        var brokeTxt = this.add.text(this.player.x, this.player.y - 30, 'GUITAR BROKE!', {
          fontFamily: 'monospace', fontSize: '7px', color: '#ff6666',
          stroke: '#000000', strokeThickness: 2
        }).setOrigin(0.5).setDepth(800);

        this.tweens.add({
          targets: brokeTxt,
          y: brokeTxt.y - 16,
          alpha: 0,
          duration: 800,
          onComplete: function () { brokeTxt.destroy(); }
        });
      }
      this.updateHUD();
    }

    // Reset attack state after animation completes
    this.time.delayedCall(300, function () {
      self.isAttacking = false;
      if (!self.gameOver && self.player.active) {
        self.player.setTexture('rockstar-idle');
      }
    });

    // Attack cooldown
    this.time.delayedCall(this.attackCooldown, function () {
      self.canAttack = true;
    });
  }

  hitEnemy(enemy, damage) {
    enemy.customData.hp -= damage;

    // Flash white for 50ms
    enemy.setTintFill(0xffffff);
    var self = this;
    this.time.delayedCall(50, function () {
      if (enemy.active) {
        enemy.clearTint();
      }
    });

    // Comic book style hit text (POW, WHAM, BAM, CRACK)
    var hitWords = ['POW!', 'WHAM!', 'BAM!', 'CRACK!', 'SMASH!'];
    var hitWord = hitWords[Phaser.Math.Between(0, hitWords.length - 1)];
    var hitColors = ['#ffff00', '#ff6600', '#ff0066', '#00ffff', '#ff00ff'];
    var hitColor = hitColors[Phaser.Math.Between(0, hitColors.length - 1)];

    var hitText = this.add.text(
      enemy.x + Phaser.Math.Between(-10, 10),
      enemy.y - 20 + Phaser.Math.Between(-5, 5),
      hitWord,
      {
        fontFamily: 'monospace', fontSize: '10px', color: hitColor,
        stroke: '#000000', strokeThickness: 3
      }
    ).setOrigin(0.5).setDepth(800);

    // Slam-in effect for the hit text
    hitText.setScale(0.3);
    this.tweens.add({
      targets: hitText,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 80,
      ease: 'Back.easeOut',
      onComplete: function () {
        self.tweens.add({
          targets: hitText,
          y: hitText.y - 15,
          alpha: 0,
          scaleX: 0.8,
          scaleY: 0.8,
          duration: 400,
          onComplete: function () { hitText.destroy(); }
        });
      }
    });

    if (enemy.customData.hp <= 0) {
      // --- DEFEATED ---
      enemy.customData.state = 'defeated';
      enemy.body.setVelocity(0, 0);

      // More dramatic knockback on defeat — upward arc
      var knockDir = (enemy.x > this.player.x) ? 1 : -1;
      this.tweens.add({
        targets: enemy,
        x: enemy.x + knockDir * 30,
        y: enemy.y - 15,
        duration: 200,
        ease: 'Quad.easeOut',
        onComplete: function () {
          // Then collapse
          self.tweens.add({
            targets: enemy,
            scaleY: 0,
            alpha: 0,
            y: enemy.y + 15,
            duration: 400,
            onComplete: function () {
              enemy.destroy();
            }
          });
        }
      });

      // Score
      this.score += 200;
      this.registry.set('score', this.score);
      this.updateHUD();

      // Floating score popup
      var scoreTxt = this.add.text(enemy.x, enemy.y - 10, '+200', {
        fontFamily: 'monospace', fontSize: '8px', color: '#ffcc00',
        stroke: '#000000', strokeThickness: 2
      }).setOrigin(0.5).setDepth(800);

      this.tweens.add({
        targets: scoreTxt,
        y: scoreTxt.y - 20,
        alpha: 0,
        duration: 700,
        onComplete: function () { scoreTxt.destroy(); }
      });

      this.enemiesDefeatedInWave++;
      this.activeEnemies--;

    } else {
      // --- HURT ---
      enemy.customData.state = 'hurt';
      enemy.customData.hurtTimer = 300;
      enemy.setTexture(enemy.customData.type + '-hurt');

      // More dramatic knockback — 20px back + slight upward arc
      var knockDir = (enemy.x > this.player.x) ? 1 : -1;
      var startY = enemy.y;
      this.tweens.add({
        targets: enemy,
        x: enemy.x + knockDir * 20,
        y: enemy.y - 8,
        duration: 100,
        ease: 'Quad.easeOut',
        onComplete: function () {
          self.tweens.add({
            targets: enemy,
            y: startY,
            duration: 100,
            ease: 'Quad.easeIn'
          });
        }
      });
    }
  }

  // =============================================
  //   PLAYER DAMAGE
  // =============================================

  playerTakeDamage(amount) {
    if (this.isInvulnerable || this.gameOver) return;

    this.currentHealth -= amount;
    if (this.currentHealth < 0) this.currentHealth = 0;
    this.registry.set('health', this.currentHealth);

    // Reset combo on taking damage
    this.resetCombo();

    if (window.audioManager) {
      window.audioManager.playHurt();
    }

    // Camera shake
    this.cameras.main.shake(100, 0.01);

    // Flash red tint
    this.player.setTint(0xff0000);
    var self = this;
    this.time.delayedCall(150, function () {
      if (self.player.active) {
        self.player.clearTint();
      }
    });

    // Invulnerability with blinking
    this.isInvulnerable = true;
    this.time.addEvent({
      delay: 80,
      repeat: 12,
      callback: function () {
        if (self.player.active) {
          self.player.setAlpha(self.player.alpha < 1 ? 1 : 0.3);
        }
      }
    });

    this.time.delayedCall(1000, function () {
      self.isInvulnerable = false;
      if (self.player.active) {
        self.player.setAlpha(1);
      }
    });

    this.updateHUD();

    // Death check
    if (this.currentHealth <= 0) {
      this.playerDie();
    }
  }

  playerDie() {
    this.gameOver = true;
    if (this.player && this.player.active) {
      this.player.setTexture('rockstar-hurt');
      if (this.player.body) this.player.body.setVelocity(0, 0);
    }

    // Save level 3 score
    var l1 = this.registry.get('level1Score') || 0;
    var l2 = this.registry.get('level2Score') || 0;
    this.registry.set('level3Score', Math.max(0, this.score - l1 - l2));

    if (this.controls) {
      this.controls.destroy();
      this.controls = null;
    }

    if (window.audioManager) {
      window.audioManager.stopMusic();
    }

    var self = this;
    this.cameras.main.shake(200, 0.02);

    // Red flash then fade to black
    var redFlash = this.add.rectangle(240, 135, 480, 270, 0xff0000, 0).setDepth(950);
    this.tweens.add({
      targets: redFlash,
      alpha: 0.5,
      duration: 300,
      yoyo: true,
      onComplete: function () {
        redFlash.destroy();
        var fadeOut = self.add.rectangle(240, 135, 480, 270, 0x000000, 0).setDepth(960);
        self.tweens.add({
          targets: fadeOut,
          alpha: 1,
          duration: 800,
          onComplete: function () {
            self.scene.start('LoseScene');
          }
        });
      }
    });
  }

  // =============================================
  //   PROJECTILE HIT
  // =============================================

  projectileHitPlayer(projectile, player) {
    if (!projectile.active) return;
    projectile.destroy();
    this.playerTakeDamage(1);
  }

  // =============================================
  //   ENEMY AI
  // =============================================

  updateEnemy(enemy, time, delta) {
    if (!enemy.active || !enemy.customData) return;

    switch (enemy.customData.state) {
      case 'entering':
        this.enemyEnter(enemy, delta);
        break;
      case 'walking':
        this.enemyWalk(enemy, delta);
        break;
      case 'attacking':
        this.enemyAttack(enemy, time, delta);
        break;
      case 'hurt':
        this.enemyHurt(enemy, delta);
        break;
      case 'defeated':
        // Handled by tween
        break;
    }
  }

  enemyEnter(enemy, delta) {
    // Walk from off-screen to a target position before engaging
    var data = enemy.customData;
    var targetX = data.enterTargetX;
    var dirX = (targetX > enemy.x) ? 1 : -1;
    var enterSpeed = 100;

    enemy.body.setVelocityX(dirX * enterSpeed);
    enemy.body.setVelocityY(0);
    enemy.setFlipX(dirX < 0);

    // Walk animation during entrance
    data.walkTimer += delta;
    if (data.walkTimer >= 150) {
      data.walkTimer = 0;
      data.walkFrame = (data.walkFrame % 4) + 1;
      enemy.setTexture(data.type + '-walk-' + data.walkFrame);
    }

    // Check if reached target
    if (Math.abs(enemy.x - targetX) < 5) {
      data.state = 'walking';
      enemy.body.setVelocity(0, 0);
    }
  }

  enemyWalk(enemy, delta) {
    var data = enemy.customData;
    var baseSpeed = 70 * data.speedMultiplier;

    // Move toward player
    var dirX = (this.player.x > enemy.x) ? 1 : -1;
    var diffY = this.player.y - enemy.y;
    var dirY = (Math.abs(diffY) > 4) ? (diffY > 0 ? 1 : -1) : 0;

    enemy.body.setVelocityX(dirX * baseSpeed);
    enemy.body.setVelocityY(dirY * baseSpeed * 0.4);

    // Face player
    enemy.setFlipX(dirX < 0);
    data.facing = dirX;

    // Walk animation
    data.walkTimer += delta;
    if (data.walkTimer >= 150) {
      data.walkTimer = 0;
      data.walkFrame = (data.walkFrame % 4) + 1;
      enemy.setTexture(data.type + '-walk-' + data.walkFrame);
    }

    // Check attack range
    var dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, enemy.x, enemy.y);
    if (dist < 40) {
      data.state = 'attacking';
      data.attackTimer = 0;
      data.attackExecuted = false;
      enemy.body.setVelocity(0, 0);
    }
  }

  enemyAttack(enemy, time, delta) {
    var data = enemy.customData;
    data.attackTimer += delta;

    // Wind-up (0-500ms): show attack pose
    if (data.attackTimer < 500) {
      enemy.setTexture(data.type + '-attack');
      return;
    }

    // Execute the attack once at the 500ms mark
    if (!data.attackExecuted) {
      data.attackExecuted = true;

      var roll = Math.random();
      var dist = Phaser.Math.Distance.Between(
        this.player.x, this.player.y,
        enemy.x, enemy.y
      );

      if (roll < 0.75) {
        // 75%: melee hit
        if (dist < 50) {
          this.playerTakeDamage(1);
        }
      } else if (roll < 0.95) {
        // 20%: throw vinyl record
        this.enemyThrowVinyl(enemy);
      } else {
        // 5%: power chord shockwave
        if (dist < 60) {
          this.playerTakeDamage(1);
          var pushDir = (this.player.x > enemy.x) ? 1 : -1;
          this.tweens.add({
            targets: this.player,
            x: this.player.x + pushDir * 80,
            duration: 200,
            ease: 'Power2'
          });
          this.cameras.main.shake(120, 0.015);
        }
      }
    }

    // Cooldown (1000ms after attack) then return to walking
    if (data.attackTimer >= 1500) {
      data.state = 'walking';
      data.attackTimer = 0;
      data.attackExecuted = false;
      enemy.setTexture(data.type + '-idle');
    }
  }

  enemyThrowVinyl(enemy) {
    var vinyl = this.physics.add.sprite(enemy.x, enemy.y, 'item-vinyl');
    this.projectiles.add(vinyl);

    var dirX = (this.player.x > enemy.x) ? 1 : -1;
    var diffY = this.player.y - enemy.y;
    vinyl.body.setVelocity(dirX * 150, diffY * 0.5);

    // Spin animation
    this.tweens.add({
      targets: vinyl,
      angle: 360,
      duration: 600,
      repeat: -1
    });

    // Auto-destroy after 3 seconds
    this.time.delayedCall(3000, function () {
      if (vinyl.active) vinyl.destroy();
    });
  }

  enemyHurt(enemy, delta) {
    var data = enemy.customData;
    data.hurtTimer -= delta;

    if (data.hurtTimer <= 0) {
      data.state = 'walking';
      data.walkTimer = 0;
      enemy.setTexture(data.type + '-idle');
      enemy.clearTint();
    }
  }

  // =============================================
  //   WAVE COMPLETION
  // =============================================

  checkWaveCompletion() {
    if (!this.waveInProgress || this.waveTransition || this.gameOver) return;
    if (this.activeEnemies > 0) return;

    this.waveInProgress = false;
    this.waveTransition = true;

    var self = this;

    // After wave 3 (index 2): notes mechanic + guitar pickup
    if (this.currentWave === 2 && !this.powerChecked) {
      this.time.delayedCall(1000, function () {
        self.checkNotesMechanic();
        self.time.delayedCall(2500, function () {
          self.spawnWave(3);
        });
      });
      return;
    }

    // After all 5 waves (index 4): victory
    if (this.currentWave >= 4) {
      this.time.delayedCall(1000, function () {
        self.playerWins();
      });
      return;
    }

    // Otherwise: next wave after 2 seconds
    this.time.delayedCall(2000, function () {
      self.spawnWave(self.currentWave + 1);
    });
  }

  playerWins() {
    this.gameOver = true;
    if (this.player && this.player.body) this.player.body.setVelocity(0, 0);

    var l1 = this.registry.get('level1Score') || 0;
    var l2 = this.registry.get('level2Score') || 0;
    this.registry.set('level3Score', Math.max(0, this.score - l1 - l2));
    this.registry.set('score', this.score);

    if (this.controls) {
      this.controls.destroy();
      this.controls = null;
    }

    if (window.audioManager) {
      window.audioManager.stopMusic();
      window.audioManager.playLevelComplete();
    }

    // Victory flash sequence
    var flash = this.add.rectangle(240, 135, 480, 270, 0xffffff, 0).setDepth(950);
    var self = this;

    this.tweens.add({
      targets: flash,
      alpha: 0.8,
      duration: 200,
      yoyo: true,
      repeat: 2,
      onComplete: function () {
        flash.destroy();
        var fadeOut = self.add.rectangle(240, 135, 480, 270, 0x000000, 0).setDepth(960);
        self.tweens.add({
          targets: fadeOut,
          alpha: 1,
          duration: 1000,
          onComplete: function () {
            self.scene.start('WinScene');
          }
        });
      }
    });
  }

  // =============================================
  //   UPDATE
  // =============================================

  update(time, delta) {
    if (Phaser.Input.Keyboard.JustDown(this.pauseKey) || Phaser.Input.Keyboard.JustDown(this.pKey)) {
      this.scene.pause();
      this.scene.launch('PauseScene', { pausedScene: 'Level3Scene' });
      return;
    }

    if (this.gameOver || !this.player || !this.player.body) return;

    // ------------------------------------------------------------------
    // Parallax scrolling — move skyline slowly based on player position
    // ------------------------------------------------------------------
    var playerOffsetX = (this.player.x - 240) * 0.3;
    for (var s = 0; s < this.skylineElements.length; s++) {
      // Gently shift skyline elements opposite to player movement
      // This creates the parallax illusion
    }

    // --- Player horizontal movement ---
    if (this.controls.left) {
      this.player.body.setVelocityX(-150);
      this.playerFacing = -1;
      this.player.setFlipX(true);
    } else if (this.controls.right) {
      this.player.body.setVelocityX(150);
      this.playerFacing = 1;
      this.player.setFlipX(false);
    } else {
      this.player.body.setVelocityX(0);
    }

    // --- Player vertical movement (up/down on brawler plane) ---
    if (this.controls.up) {
      this.player.body.setVelocityY(-80);
    } else if (this.controls.down) {
      this.player.body.setVelocityY(80);
    } else {
      this.player.body.setVelocityY(0);
    }

    // Clamp player Y to walkable area (stage floor)
    if (this.player.y < 175) this.player.y = 175;
    if (this.player.y > 230) this.player.y = 230;

    // --- Walk animation ---
    if (!this.isAttacking) {
      var isMoving = this.player.body.velocity.x !== 0 || this.player.body.velocity.y !== 0;
      if (isMoving) {
        this.walkTimer += delta;
        if (this.walkTimer >= this.walkFrameDelay) {
          this.walkTimer = 0;
          this.walkFrame = (this.walkFrame % 4) + 1;
          this.player.setTexture('rockstar-walk-' + this.walkFrame);
        }
      } else {
        this.walkFrame = 0;
        this.walkTimer = 0;
        this.player.setTexture('rockstar-idle');
      }
    }

    // --- Attack input ---
    if (this.controls.attack) {
      this.performAttack();
    }

    // --- Update enemies ---
    var children = this.enemies.getChildren();
    for (var i = children.length - 1; i >= 0; i--) {
      this.updateEnemy(children[i], time, delta);
    }

    // --- Clean up off-screen projectiles ---
    var projectiles = this.projectiles.getChildren();
    for (var j = projectiles.length - 1; j >= 0; j--) {
      var p = projectiles[j];
      if (p.active && (p.x < -50 || p.x > 530 || p.y < -50 || p.y > 320)) {
        p.destroy();
      }
    }

    // --- Wave completion ---
    this.checkWaveCompletion();
  }

  shutdown() {
    if (this.controls) {
      this.controls.destroy();
      this.controls = null;
    }
  }
}
