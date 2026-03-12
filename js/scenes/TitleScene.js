/**
 * TitleScene.js
 * Retro arcade title screen — TMNT / Konami 1989 style.
 * Shows the game title, blinking "PRESS START", background particles,
 * and the rockstar idle sprite floating gently.
 */
class TitleScene extends Phaser.Scene {
    constructor() {
        super({ key: 'TitleScene' });
    }

    create() {
        var self = this;

        // ---- Black background ----
        this.cameras.main.setBackgroundColor('#000000');

        // ---- Background particle sparkles ----
        // Phaser 3.60+ uses the new particle API (addParticleEmitter on a
        // ParticleEmitterManager via scene.add.particles).  We handle both
        // the legacy and modern API gracefully.
        this._createBackgroundParticles();

        // ---- Title image ----
        this.add.image(240, 75, 'game-name').setScale(0.085);

        // ---- Subtitle ----
        this.add.text(240, 168, 'AN 80s ARCADE GAME', {
            fontSize: '10px',
            fontFamily: 'monospace',
            color: '#FFFFFF',
            shadow: { offsetX: 1, offsetY: 1, color: '#333333', blur: 0, fill: true }
        }).setOrigin(0.5);

        // ---- Rockstar sprite (floating idle) ----
        var rockstar = this.add.image(240, 210, 'rockstar-idle');
        rockstar.setScale(1.2);
        this.tweens.add({
            targets: rockstar,
            y: 216,
            duration: 1200,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // ---- "PRESS START" blinking text ----
        var pressStart = this.add.text(240, 240, 'PRESS START', {
            fontSize: '14px',
            fontFamily: 'monospace',
            color: '#FFFFFF',
            shadow: { offsetX: 1, offsetY: 1, color: '#555555', blur: 0, fill: true }
        }).setOrigin(0.5);

        this.tweens.add({
            targets: pressStart,
            alpha: 0,
            duration: 500,
            yoyo: true,
            repeat: -1
        });

        // ---- Credit line ----
        this.add.text(240, 262, '2026 OLESIA PETROCHENKOVA', {
            fontSize: '7px',
            fontFamily: 'monospace',
            color: '#666666'
        }).setOrigin(0.5);

        // ---- Audio Manager ----
        if (typeof AudioManager !== 'undefined') {
            window.audioManager = new AudioManager();
            try { window.audioManager.playTitleMusic(); } catch (e) { /* silent */ }
        }

        // ---- Input handlers ----
        // Keyboard — SPACE or ENTER
        this._startKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this._enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);

        this._started = false;

        this._startKey.on('down', function() { self._goToGame(); });
        this._enterKey.on('down', function() { self._goToGame(); });

        // Pointer (touch / click)
        this.input.on('pointerdown', function() { self._goToGame(); });
    }

    /* ------------------------------------------------------------------
     *  Background sparkle particles
     * ----------------------------------------------------------------*/
    _createBackgroundParticles() {
        try {
            // Phaser 3.60+ new particle system
            if (typeof this.add.particles === 'function') {
                var emitter = this.add.particles(0, 0, 'particle-spark', {
                    x: { min: 0, max: 480 },
                    y: { min: 0, max: 270 },
                    lifespan: 4000,
                    speed: { min: 5, max: 20 },
                    scale: { start: 0.6, end: 0 },
                    alpha: { start: 0.5, end: 0 },
                    frequency: 200,
                    blendMode: 'ADD',
                    quantity: 1
                });
            }
        } catch (e) {
            // Particles are cosmetic; if anything fails, continue silently.
        }
    }

    /* ------------------------------------------------------------------
     *  Transition to CutsceneScene
     * ----------------------------------------------------------------*/
    _goToGame() {
        if (this._started) { return; }
        this._started = true;

        // Unlock audio context and play menu select SFX
        if (window.audioManager) {
            try { window.audioManager.unlock(); } catch (e) { /* silent */ }
            try { window.audioManager.playMenuSelect(); } catch (e) { /* silent */ }
        }

        // Brief flash transition
        this.cameras.main.flash(300, 255, 255, 255);

        var self = this;
        this.time.delayedCall(350, function() {
            self.scene.start('CutsceneScene', { cutscene: 'intro' });
        }, [], this);
    }

    /* ------------------------------------------------------------------
     *  Cleanup on scene shutdown
     * ----------------------------------------------------------------*/
    shutdown() {
        // Stop title music
        if (window.audioManager) {
            try { window.audioManager.stopMusic(); } catch (e) { /* silent */ }
        }

        // Remove input listeners
        if (this._startKey) { this._startKey.removeAllListeners(); }
        if (this._enterKey) { this._enterKey.removeAllListeners(); }
        this.input.off('pointerdown');
    }
}
