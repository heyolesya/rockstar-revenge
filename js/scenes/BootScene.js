/**
 * BootScene.js
 * First scene loaded — generates all textures via SpriteFactory,
 * initialises the game registry, then transitions to TitleScene.
 */
class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }

    create() {
        // Show "LOADING..." text centered
        var loadText = this.add.text(240, 135, 'LOADING...', {
            fontSize: '16px',
            fontFamily: 'monospace',
            color: '#ffffff'
        }).setOrigin(0.5);

        // Generate all sprites
        SpriteFactory.createAll(this);

        // Initialize game registry with default values
        this.game.registry.set('score', 0);
        this.game.registry.set('health', 5);
        this.game.registry.set('notesCollected', 0);
        this.game.registry.set('level1Score', 0);
        this.game.registry.set('level2Score', 0);
        this.game.registry.set('level3Score', 0);

        // Transition after brief delay so the player sees the loading text
        this.time.delayedCall(500, function() {
            this.scene.start('TitleScene');
        }, [], this);
    }
}
