// Level3Scene.js - Side-scrolling brawler: "Smells Like the End" (1992-1994)
class Level3Scene extends Phaser.Scene {
  constructor() {
    super({ key: 'Level3Scene' });
  }

  create() {
    this.gameOver = false;

    // --- Background ---
    this.add.image(240, 135, 'bg-alley');

    // --- Rain particle system ---
    this.rainEmitter = this.add.particles(0, 0, 'particle-rain', {
      x: { min: 0, max: 480 },
      y: -10,
      speedY: { min: 200, max: 300 },
      speedX: { min: -40, max: -20 },
      lifespan: 2000,
      frequency: 50,
      quantity: 2,
      alpha: { start: 0.6, end: 0.1 }
    });

    // --- Player ---
    this.player = this.physics.add.sprite(100, 200, 'rockstar-idle');
    this.player.setCollideWorldBounds(true);
    this.player.body.setSize(
      Math.floor(this.player.width * 0.6),
      Math.floor(this.player.height * 0.8)
    );
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
      { count: 3, sides: ['left', 'right', 'right'] },
      { count: 3, sides: ['left', 'right', 'left'] },
      { count: 4, sides: ['right', 'left', 'right', 'left'] },
      { count: 5, sides: ['right', 'left', 'right', 'left', 'right'] }
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

    // --- HUD ---
    this.createHUD();

    // --- Controls ---
    this.controls = new Controls(this);
    this.controls.setupForLevel(3);

    // --- Music ---
    if (window.audioManager) {
      window.audioManager.playLevel3Music();
    }

    // --- Start wave 1 after 1-second delay ---
    var self = this;
    this.time.delayedCall(1000, function () {
      self.spawnWave(0);
    });

    // --- Clean up on scene shutdown ---
    this.events.on('shutdown', this.shutdown, this);
  }

  // =============================================
  //   HUD
  // =============================================

  createHUD() {
    // Health bar background
    this.add.rectangle(8, 8, 62, 10, 0x333333)
      .setOrigin(0, 0).setScrollFactor(0).setDepth(900);

    // Health bar border
    var border = this.add.rectangle(8, 8, 62, 10)
      .setOrigin(0, 0).setScrollFactor(0).setDepth(901);
    border.setStrokeStyle(1, 0xffffff);
    border.isFilled = false;

    // Health bar fill
    this.hudHealthFill = this.add.rectangle(9, 9, 60, 8, 0x33ff33)
      .setOrigin(0, 0).setScrollFactor(0).setDepth(902);
    this.updateHealthBar();

    // Score
    this.hudScore = this.add.text(472, 8, 'SCORE: ' + this.score, {
      fontFamily: 'monospace', fontSize: '8px', color: '#ffcc00'
    }).setOrigin(1, 0).setScrollFactor(0).setDepth(900);

    // Wave indicator
    this.hudWave = this.add.text(240, 8, 'WAVE 1/5', {
      fontFamily: 'monospace', fontSize: '8px', color: '#ffffff'
    }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(900);

    // Weapon indicator
    this.hudWeapon = this.add.text(8, 22, 'MIC STAND', {
      fontFamily: 'monospace', fontSize: '6px', color: '#aaaaaa'
    }).setOrigin(0, 0).setScrollFactor(0).setDepth(900);
  }

  updateHealthBar() {
    var pct = Math.max(0, this.currentHealth) / 5;
    this.hudHealthFill.width = Math.max(0, 60 * pct);
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
    this.hudWave.setText('WAVE ' + (this.currentWave + 1) + '/5');
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
    var txt = this.add.text(240, 100, 'WAVE ' + waveNum, {
      fontFamily: 'monospace', fontSize: '20px', color: '#ff4444',
      stroke: '#000000', strokeThickness: 3
    }).setOrigin(0.5).setAlpha(0).setDepth(800);

    this.tweens.add({
      targets: txt,
      alpha: 1,
      duration: 300,
      yoyo: true,
      hold: 1000,
      onComplete: function () { txt.destroy(); }
    });
  }

  spawnEnemy(side, waveIndex) {
    if (this.gameOver) return;

    var startX = (side === 'left') ? -30 : 510;
    var startY = Phaser.Math.Between(180, 230);

    var enemy = this.physics.add.sprite(startX, startY, 'grunge-idle');
    enemy.body.setSize(
      Math.floor(enemy.width * 0.6),
      Math.floor(enemy.height * 0.8)
    );

    var isHardWave = (waveIndex >= 3 && !this.hasPower);
    enemy.customData = {
      hp: isHardWave ? 4 : 3,
      maxHp: isHardWave ? 4 : 3,
      facing: (side === 'left') ? 1 : -1,
      state: 'walking',
      attackTimer: 0,
      attackExecuted: false,
      hurtTimer: 0,
      walkFrame: 0,
      walkTimer: 0,
      speedMultiplier: this.hasPower ? 0.6 : 1.0
    };

    enemy.setFlipX(side === 'right');
    this.enemies.add(enemy);
  }

  // =============================================
  //   NOTES MECHANIC (after wave 3)
  // =============================================

  checkNotesMechanic() {
    if (this.powerChecked) return;
    this.powerChecked = true;

    if (this.notesCollected >= 15) {
      this.activateGoldenPower();
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

    // Glow pulse
    this.tweens.add({
      targets: pickup,
      alpha: { from: 0.7, to: 1 },
      duration: 400,
      yoyo: true,
      repeat: -1
    });
  }

  collectPickup(player, pickup) {
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

    // Flash white
    enemy.setTintFill(0xffffff);
    var self = this;
    this.time.delayedCall(100, function () {
      if (enemy.active) {
        enemy.clearTint();
      }
    });

    if (enemy.customData.hp <= 0) {
      // --- DEFEATED ---
      enemy.customData.state = 'defeated';
      enemy.body.setVelocity(0, 0);

      // Collapse animation
      this.tweens.add({
        targets: enemy,
        scaleY: 0,
        alpha: 0,
        duration: 500,
        onComplete: function () {
          enemy.destroy();
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
      enemy.setTexture('grunge-hurt');

      // Knockback
      var knockDir = (enemy.x > this.player.x) ? 1 : -1;
      this.tweens.add({
        targets: enemy,
        x: enemy.x + knockDir * 20,
        duration: 150,
        ease: 'Power2'
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
    this.player.setTexture('rockstar-hurt');
    this.player.body.setVelocity(0, 0);

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
      enemy.setTexture('grunge-walk-' + data.walkFrame);
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
      enemy.setTexture('grunge-attack');
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
      enemy.setTexture('grunge-idle');
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
      enemy.setTexture('grunge-idle');
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
    this.player.body.setVelocity(0, 0);

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
    if (this.gameOver) return;

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

    // No vertical movement in this brawler
    this.player.body.setVelocityY(0);

    // --- Walk animation ---
    if (!this.isAttacking) {
      if (this.player.body.velocity.x !== 0) {
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
