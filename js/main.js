// main.js - Phaser 3 Game Configuration and Entry Point

var config = {
  type: Phaser.AUTO,
  width: 480,
  height: 270,
  parent: 'game-container',
  pixelArt: true,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: [
    BootScene,
    TitleScene,
    Level1Scene,
    Level2Scene,
    Level3Scene,
    CutsceneScene,
    WinScene,
    LoseScene,
    GameOverScene
  ],
  input: {
    activePointers: 2
  }
};

var game = new Phaser.Game(config);
