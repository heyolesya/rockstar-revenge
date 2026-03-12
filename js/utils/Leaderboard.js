// Leaderboard.js - Arcade-style high score system with localStorage persistence
class Leaderboard {

  static STORAGE_KEY = 'shredTilDead_leaderboard';
  static MAX_ENTRIES = 10;

  /**
   * Get all leaderboard scores, sorted highest first.
   * @returns {Array<{name: string, score: number}>}
   */
  static getScores() {
    try {
      var raw = localStorage.getItem(Leaderboard.STORAGE_KEY);
      if (!raw) return [];
      var scores = JSON.parse(raw);
      if (!Array.isArray(scores)) return [];
      // Sanitize and sort
      scores = scores.filter(function (entry) {
        return entry && typeof entry.name === 'string' && typeof entry.score === 'number';
      });
      scores.sort(function (a, b) { return b.score - a.score; });
      return scores;
    } catch (e) {
      return [];
    }
  }

  /**
   * Add a new score entry, keep only top 10, save to localStorage.
   * @param {string} name - 3-letter initials
   * @param {number} score
   */
  static addScore(name, score) {
    var scores = Leaderboard.getScores();
    scores.push({ name: name, score: score });
    scores.sort(function (a, b) { return b.score - a.score; });
    scores = scores.slice(0, Leaderboard.MAX_ENTRIES);
    try {
      localStorage.setItem(Leaderboard.STORAGE_KEY, JSON.stringify(scores));
    } catch (e) {
      console.warn('Leaderboard: Could not save to localStorage', e);
    }
  }

  /**
   * Check if a score qualifies for the leaderboard.
   * @param {number} score
   * @returns {boolean}
   */
  static isHighScore(score) {
    var scores = Leaderboard.getScores();
    if (scores.length < Leaderboard.MAX_ENTRIES) return true;
    return score > scores[scores.length - 1].score;
  }

  /**
   * Create an arcade-style 3-letter initial entry UI.
   * @param {Phaser.Scene} scene - The Phaser scene to add elements to
   * @param {number} y - Vertical center position for the letter slots
   * @param {number} score - The score being entered (displayed)
   * @param {function} onComplete - Callback with the 3-letter initials string
   * @returns {{destroy: function}} - Object with destroy() to clean up
   */
  static createEntryUI(scene, y, score, onComplete) {
    var LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    var centerX = 240;
    var letterSpacing = 36;
    var elements = [];
    var keys = [];

    // Current letter indices (0 = A)
    var indices = [0, 0, 0];
    var selectedSlot = 0;

    // Title text
    var titleText = scene.add.text(centerX, y - 60, 'ENTER YOUR INITIALS', {
      fontFamily: 'monospace',
      fontSize: '14px',
      color: '#FFD700',
      align: 'center'
    }).setOrigin(0.5).setDepth(200);
    elements.push(titleText);

    // Score display
    var scoreText = scene.add.text(centerX, y - 40, 'SCORE: ' + score, {
      fontFamily: 'monospace',
      fontSize: '12px',
      color: '#FFFFFF',
      align: 'center'
    }).setOrigin(0.5).setDepth(200);
    elements.push(scoreText);

    // Up arrows
    var upArrows = [];
    for (var u = 0; u < 3; u++) {
      var ax = centerX + (u - 1) * letterSpacing;
      var upArrow = scene.add.text(ax, y - 20, '\u25B2', {
        fontFamily: 'monospace',
        fontSize: '12px',
        color: '#FFD700',
        align: 'center'
      }).setOrigin(0.5).setDepth(200);
      elements.push(upArrow);
      upArrows.push(upArrow);
    }

    // Letter slots
    var letterTexts = [];
    for (var i = 0; i < 3; i++) {
      var lx = centerX + (i - 1) * letterSpacing;
      var lt = scene.add.text(lx, y, LETTERS[indices[i]], {
        fontFamily: 'monospace',
        fontSize: '20px',
        color: '#FFD700',
        align: 'center'
      }).setOrigin(0.5).setDepth(200);
      elements.push(lt);
      letterTexts.push(lt);
    }

    // Down arrows
    var downArrows = [];
    for (var d = 0; d < 3; d++) {
      var dx = centerX + (d - 1) * letterSpacing;
      var downArrow = scene.add.text(dx, y + 20, '\u25BC', {
        fontFamily: 'monospace',
        fontSize: '12px',
        color: '#FFD700',
        align: 'center'
      }).setOrigin(0.5).setDepth(200);
      elements.push(downArrow);
      downArrows.push(downArrow);
    }

    // Underline / cursor indicator
    var cursorText = scene.add.text(centerX + (selectedSlot - 1) * letterSpacing, y + 14, '_', {
      fontFamily: 'monospace',
      fontSize: '20px',
      color: '#FFFFFF',
      align: 'center'
    }).setOrigin(0.5).setDepth(200);
    elements.push(cursorText);

    // Hint text
    var hintText = scene.add.text(centerX, y + 44, 'W/S or \u2191/\u2193 = CHANGE   A/D or \u2190/\u2192 = MOVE   ENTER = OK', {
      fontFamily: 'monospace',
      fontSize: '7px',
      color: '#AAAAAA',
      align: 'center'
    }).setOrigin(0.5).setDepth(200);
    elements.push(hintText);

    var confirmed = false;

    // Update display
    function updateDisplay() {
      for (var j = 0; j < 3; j++) {
        letterTexts[j].setText(LETTERS[indices[j]]);
        // Highlight selected slot
        if (j === selectedSlot) {
          letterTexts[j].setColor('#FFFFFF');
          upArrows[j].setColor('#FFFFFF');
          downArrows[j].setColor('#FFFFFF');
        } else {
          letterTexts[j].setColor('#FFD700');
          upArrows[j].setColor('#FFD700');
          downArrows[j].setColor('#FFD700');
        }
      }
      cursorText.x = centerX + (selectedSlot - 1) * letterSpacing;
    }

    // Blink cursor
    var blinkTimer = scene.time.addEvent({
      delay: 400,
      loop: true,
      callback: function () {
        if (!confirmed) {
          cursorText.visible = !cursorText.visible;
        }
      }
    });

    // Key handlers
    var keyUp = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
    var keyDown = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
    var keyLeft = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
    var keyRight = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
    var keyW = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    var keyS = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    var keyA = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    var keyD = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    var keyEnter = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    var keySpace = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    keys.push(keyUp, keyDown, keyLeft, keyRight, keyW, keyS, keyA, keyD, keyEnter, keySpace);

    function onUp() {
      if (confirmed) return;
      indices[selectedSlot] = (indices[selectedSlot] - 1 + 26) % 26;
      updateDisplay();
    }

    function onDown() {
      if (confirmed) return;
      indices[selectedSlot] = (indices[selectedSlot] + 1) % 26;
      updateDisplay();
    }

    function onLeft() {
      if (confirmed) return;
      selectedSlot = (selectedSlot - 1 + 3) % 3;
      updateDisplay();
    }

    function onRight() {
      if (confirmed) return;
      selectedSlot = (selectedSlot + 1) % 3;
      updateDisplay();
    }

    function onConfirm() {
      if (confirmed) return;
      confirmed = true;
      var initials = LETTERS[indices[0]] + LETTERS[indices[1]] + LETTERS[indices[2]];
      // Flash all letters white briefly
      for (var k = 0; k < 3; k++) {
        letterTexts[k].setColor('#FFFFFF');
      }
      cursorText.visible = false;
      if (onComplete) {
        onComplete(initials);
      }
    }

    keyUp.on('down', onUp);
    keyW.on('down', onUp);
    keyDown.on('down', onDown);
    keyS.on('down', onDown);
    keyLeft.on('down', onLeft);
    keyA.on('down', onLeft);
    keyRight.on('down', onRight);
    keyD.on('down', onRight);
    keyEnter.on('down', onConfirm);
    keySpace.on('down', onConfirm);

    updateDisplay();

    return {
      destroy: function () {
        confirmed = true;
        // Remove key listeners
        for (var ki = 0; ki < keys.length; ki++) {
          keys[ki].removeAllListeners();
          scene.input.keyboard.removeKey(keys[ki]);
        }
        keys = [];
        // Remove blink timer
        if (blinkTimer) {
          blinkTimer.remove(false);
        }
        // Destroy all display elements
        for (var ei = 0; ei < elements.length; ei++) {
          if (elements[ei] && elements[ei].destroy) {
            elements[ei].destroy();
          }
        }
        elements = [];
      }
    };
  }

  /**
   * Create a top-10 leaderboard display.
   * @param {Phaser.Scene} scene - The Phaser scene to add elements to
   * @param {number} y - Vertical start position for the header
   * @returns {{destroy: function}} - Object with destroy() to clean up
   */
  static createDisplayUI(scene, y) {
    var centerX = 240;
    var elements = [];
    var lineHeight = 16;

    // Header
    var header = scene.add.text(centerX, y, 'HIGH SCORES', {
      fontFamily: 'monospace',
      fontSize: '16px',
      color: '#FFD700',
      align: 'center'
    }).setOrigin(0.5).setDepth(200);
    elements.push(header);

    // Divider
    var divider = scene.add.text(centerX, y + 18, '----------', {
      fontFamily: 'monospace',
      fontSize: '10px',
      color: '#FFD700',
      align: 'center'
    }).setOrigin(0.5).setDepth(200);
    elements.push(divider);

    var scores = Leaderboard.getScores();

    if (scores.length === 0) {
      var emptyText = scene.add.text(centerX, y + 38, 'NO SCORES YET', {
        fontFamily: 'monospace',
        fontSize: '10px',
        color: '#AAAAAA',
        align: 'center'
      }).setOrigin(0.5).setDepth(200);
      elements.push(emptyText);
    } else {
      for (var i = 0; i < scores.length && i < 10; i++) {
        var rank = (i + 1) + '.';
        var name = scores[i].name;
        var sc = scores[i].score;
        // Pad rank to 3 chars, name is 3 chars, pad score
        var rankStr = rank.length < 3 ? rank + ' ' : rank;
        var scoreStr = String(sc);
        // Build line: "1.  AAA   1000"
        var line = rankStr + ' ' + name + '   ' + scoreStr;
        var color = (i === 0) ? '#FFD700' : '#FFFFFF';

        var entryText = scene.add.text(centerX, y + 34 + i * lineHeight, line, {
          fontFamily: 'monospace',
          fontSize: '11px',
          color: color,
          align: 'center'
        }).setOrigin(0.5).setDepth(200);
        elements.push(entryText);
      }
    }

    return {
      destroy: function () {
        for (var ei = 0; ei < elements.length; ei++) {
          if (elements[ei] && elements[ei].destroy) {
            elements[ei].destroy();
          }
        }
        elements = [];
      }
    };
  }
}
