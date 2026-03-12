/**
 * BootScene.js
 * First scene loaded — preloads PNG sprites, generates remaining textures
 * via SpriteFactory, initialises the game registry, then transitions to TitleScene.
 */
class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }

    preload() {
        // Show "LOADING..." text centered during preload
        this.add.text(240, 135, 'LOADING...', {
            fontSize: '16px',
            fontFamily: 'monospace',
            color: '#ffffff'
        }).setOrigin(0.5);

        // Player sprites (vocalist character sheet)
        this.load.image('rockstar-idle',     'img/sprites/rockstar-idle.png');
        this.load.image('rockstar-walk-1',   'img/sprites/rockstar-walk-1.png');
        this.load.image('rockstar-walk-2',   'img/sprites/rockstar-walk-2.png');
        this.load.image('rockstar-walk-3',   'img/sprites/rockstar-walk-3.png');
        this.load.image('rockstar-walk-4',   'img/sprites/rockstar-walk-4.png');
        this.load.image('rockstar-attack-1', 'img/sprites/rockstar-attack-1.png');
        this.load.image('rockstar-attack-2', 'img/sprites/rockstar-attack-2.png');
        this.load.image('rockstar-attack-3', 'img/sprites/rockstar-attack-3.png');
        this.load.image('rockstar-hurt',     'img/sprites/rockstar-hurt.png');

        // Enemy sprites (grunge-guy sheet)
        this.load.image('grunge-idle',   'img/sprites/grunge-idle.png');
        this.load.image('grunge-walk-1', 'img/sprites/grunge-walk-1.png');
        this.load.image('grunge-walk-2', 'img/sprites/grunge-walk-2.png');
        this.load.image('grunge-walk-3', 'img/sprites/grunge-walk-3.png');
        this.load.image('grunge-walk-4', 'img/sprites/grunge-walk-4.png');
        this.load.image('grunge-attack', 'img/sprites/grunge-attack.png');
        this.load.image('grunge-hurt',   'img/sprites/grunge-hurt.png');
        this.load.image('grunge-sitting','img/sprites/grunge-sitting.png');

        // Beavis sprites (Level 3 enemy)
        this.load.image('beavis-idle',   'img/sprites/beavis-idle.png');
        this.load.image('beavis-walk-1', 'img/sprites/beavis-walk-1.png');
        this.load.image('beavis-walk-2', 'img/sprites/beavis-walk-2.png');
        this.load.image('beavis-walk-3', 'img/sprites/beavis-walk-3.png');
        this.load.image('beavis-walk-4', 'img/sprites/beavis-walk-4.png');
        this.load.image('beavis-attack', 'img/sprites/beavis-attack.png');
        this.load.image('beavis-hurt',   'img/sprites/beavis-hurt.png');

        // Butt-Head sprites (Level 3 enemy)
        this.load.image('butthead-idle',   'img/sprites/butthead-idle.png');
        this.load.image('butthead-walk-1', 'img/sprites/butthead-walk-1.png');
        this.load.image('butthead-walk-2', 'img/sprites/butthead-walk-2.png');
        this.load.image('butthead-walk-3', 'img/sprites/butthead-walk-3.png');
        this.load.image('butthead-walk-4', 'img/sprites/butthead-walk-4.png');
        this.load.image('butthead-attack', 'img/sprites/butthead-attack.png');
        this.load.image('butthead-hurt',   'img/sprites/butthead-hurt.png');

        // Stage background
        this.load.image('bg-stage', 'img/sprites/bg-stage.png');

        // Band members (Level 1)
        this.load.image('band-drummer',   'img/sprites/band-drummer.png');
        this.load.image('band-guitarist', 'img/sprites/band-guitarist.png');
        this.load.image('band-bassist',   'img/sprites/band-bassist.png');

        // Ulrich face (Level 2 dartboard)
        this.load.image('ulrich-face', 'img/sprites/ulrich-face.png');

        // Vocalist portraits (cutscenes)
        this.load.image('vocalist-portrait-1', 'img/sprites/vocalist-portrait-1.png');
        this.load.image('vocalist-portrait-2', 'img/sprites/vocalist-portrait-2.png');

        // Game name image (title screen)
        this.load.image('game-name', 'img/pixel-transparent/game-name-2.png');

        // Level backdrops
        this.load.image('bg-bar',   'img/sprites/bar-backdrop.png');
        this.load.image('bg-alley', 'img/sprites/alley-backdrop.png');

        // Vocalist 90s spritesheet (transformed hero for WinScene)
        this.load.spritesheet('vocalist-90s', 'img/pixel-transparent/vocalist-90s.png', {
            frameWidth: 409,
            frameHeight: 1024
        });

        // Hi-res individual character images for end scenes
        this.load.image('vocalist-hires', 'img/pixel-transparent/vocalist-hurt.png');
        this.load.image('fallen-hero', 'img/pixel-transparent/fallen-hero-cropped.png');
        this.load.image('vocalist-90s-fist', 'img/pixel-transparent/vocalist-90s-fist.png');
        this.load.image('vocalist-hires-idle', 'img/pixel-transparent/vocalist-hires-idle.png');
        this.load.image('vocalist-hires-walk-1', 'img/pixel-transparent/vocalist-hires-walk-1.png');
        this.load.image('vocalist-hires-walk-2', 'img/pixel-transparent/vocalist-hires-walk-2.png');
        this.load.image('vocalist-hires-walk-3', 'img/pixel-transparent/vocalist-hires-walk-3.png');
        this.load.image('grunge-hires-1', 'img/pixel-transparent/grunge-char-1.png');
        this.load.image('grunge-hires-2', 'img/pixel-transparent/grunge-char-2.png');
        this.load.image('grunge-hires-3', 'img/pixel-transparent/grunge-char-3.png');

        // End screen backdrops
        this.load.image('bg-happy-end', 'img/pixel/happy-end-backdrop.png');
        this.load.image('bg-unhappy-end', 'img/pixel/unhappy-backdrop.png');
    }

    create() {
        // Generate remaining programmatic textures (PNG-loaded keys are skipped by _tex())
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
