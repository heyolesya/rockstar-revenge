// AudioManager.js - Pure Web Audio API sound effects and chiptune music
class AudioManager {
  constructor() {
    this._ctx = null;
    this._musicInterval = null;
    this._musicOscillators = [];
    this._musicGains = [];
  }

  // --- Internal helpers ---

  _getCtx() {
    if (!this._ctx) {
      this._ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    return this._ctx;
  }

  unlock() {
    try {
      var ctx = this._getCtx();
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
    } catch (e) { /* swallow */ }
  }

  /**
   * Play an oscillator note.
   * @param {number} freq - Frequency in Hz
   * @param {string} type - 'sine','square','sawtooth','triangle'
   * @param {number} startTime - AudioContext time to start
   * @param {number} duration - In seconds
   * @param {number} volume - 0 to 1
   * @returns {OscillatorNode}
   */
  _playTone(freq, type, startTime, duration, volume) {
    var ctx = this._getCtx();
    var osc = ctx.createOscillator();
    var gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, startTime);
    gain.gain.setValueAtTime(volume, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(startTime);
    osc.stop(startTime + duration + 0.05);
    return osc;
  }

  /**
   * Play white noise burst.
   */
  _playNoise(startTime, duration, volume) {
    var ctx = this._getCtx();
    var bufferSize = Math.floor(ctx.sampleRate * duration);
    var buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    var data = buffer.getChannelData(0);
    for (var i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * volume;
    }
    var source = ctx.createBufferSource();
    source.buffer = buffer;
    var gain = ctx.createGain();
    gain.gain.setValueAtTime(volume, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
    source.connect(gain);
    gain.connect(ctx.destination);
    source.start(startTime);
    source.stop(startTime + duration + 0.05);
    return source;
  }

  // =====================
  //   SOUND EFFECTS
  // =====================

  playCoinCollect() {
    try {
      var ctx = this._getCtx();
      var t = ctx.currentTime;
      // Ascending C5 (523) -> E5 (659), square wave, 100ms
      this._playTone(523.25, 'square', t, 0.05, 0.15);
      this._playTone(659.25, 'square', t + 0.05, 0.05, 0.15);
    } catch (e) { /* swallow */ }
  }

  playHurt() {
    try {
      var ctx = this._getCtx();
      var t = ctx.currentTime;
      // Descending sawtooth buzz
      var osc = ctx.createOscillator();
      var gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(400, t);
      osc.frequency.linearRampToValueAtTime(100, t + 0.2);
      gain.gain.setValueAtTime(0.2, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.25);
    } catch (e) { /* swallow */ }
  }

  playBottleSmash() {
    try {
      var ctx = this._getCtx();
      var t = ctx.currentTime;
      // White noise burst 150ms
      this._playNoise(t, 0.15, 0.25);
      // High crackle
      this._playTone(2000, 'square', t, 0.03, 0.08);
      this._playTone(3000, 'square', t + 0.02, 0.03, 0.06);
    } catch (e) { /* swallow */ }
  }

  playDartThrow() {
    try {
      var ctx = this._getCtx();
      var t = ctx.currentTime;
      // Filtered noise sweep (whoosh) 200ms
      var bufferSize = Math.floor(ctx.sampleRate * 0.2);
      var buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      var data = buffer.getChannelData(0);
      for (var i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1);
      }
      var source = ctx.createBufferSource();
      source.buffer = buffer;
      var filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(500, t);
      filter.frequency.linearRampToValueAtTime(4000, t + 0.2);
      filter.Q.setValueAtTime(2, t);
      var gain = ctx.createGain();
      gain.gain.setValueAtTime(0.15, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
      source.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      source.start(t);
      source.stop(t + 0.25);
    } catch (e) { /* swallow */ }
  }

  playDartHit() {
    try {
      var ctx = this._getCtx();
      var t = ctx.currentTime;
      // Low sine 80Hz thud, short decay
      this._playTone(80, 'sine', t, 0.1, 0.3);
    } catch (e) { /* swallow */ }
  }

  playBullseye() {
    try {
      var ctx = this._getCtx();
      var t = ctx.currentTime;
      // C-E-G arpeggio fanfare, square wave, 300ms total
      this._playTone(523.25, 'square', t, 0.1, 0.15);
      this._playTone(659.25, 'square', t + 0.1, 0.1, 0.15);
      this._playTone(783.99, 'square', t + 0.2, 0.15, 0.15);
    } catch (e) { /* swallow */ }
  }

  playPunch() {
    try {
      var ctx = this._getCtx();
      var t = ctx.currentTime;
      // Noise + low sine impact, 100ms
      this._playNoise(t, 0.08, 0.2);
      this._playTone(60, 'sine', t, 0.1, 0.25);
    } catch (e) { /* swallow */ }
  }

  playCrowdCheer() {
    try {
      var ctx = this._getCtx();
      var t = ctx.currentTime;
      // Filtered noise with slow attack/decay, 500ms
      var bufferSize = Math.floor(ctx.sampleRate * 0.5);
      var buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      var data = buffer.getChannelData(0);
      for (var i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1);
      }
      var source = ctx.createBufferSource();
      source.buffer = buffer;
      var filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1200, t);
      filter.Q.setValueAtTime(0.5, t);
      var gain = ctx.createGain();
      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(0.2, t + 0.15);
      gain.gain.setValueAtTime(0.2, t + 0.3);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
      source.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      source.start(t);
      source.stop(t + 0.55);
    } catch (e) { /* swallow */ }
  }

  playSiren() {
    try {
      var ctx = this._getCtx();
      var t = ctx.currentTime;
      // Alternating 600Hz/800Hz sine, 2 seconds
      var osc = ctx.createOscillator();
      var gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, t);
      // Alternate every 0.25s for 2 seconds
      for (var i = 0; i < 8; i++) {
        var freq = (i % 2 === 0) ? 600 : 800;
        osc.frequency.setValueAtTime(freq, t + i * 0.25);
      }
      gain.gain.setValueAtTime(0.12, t);
      gain.gain.setValueAtTime(0.12, t + 1.8);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 2.0);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 2.05);
    } catch (e) { /* swallow */ }
  }

  playLevelComplete() {
    try {
      var ctx = this._getCtx();
      var t = ctx.currentTime;
      // Ascending C-E-G-C arpeggio, 500ms
      this._playTone(523.25, 'square', t, 0.12, 0.15);
      this._playTone(659.25, 'square', t + 0.12, 0.12, 0.15);
      this._playTone(783.99, 'square', t + 0.24, 0.12, 0.15);
      this._playTone(1046.50, 'square', t + 0.36, 0.2, 0.18);
    } catch (e) { /* swallow */ }
  }

  playMenuSelect() {
    try {
      var ctx = this._getCtx();
      var t = ctx.currentTime;
      // Single C5 square wave blip, 50ms
      this._playTone(523.25, 'square', t, 0.05, 0.12);
    } catch (e) { /* swallow */ }
  }

  // =====================
  //   MUSIC
  // =====================

  _stopMusicOscillators() {
    for (var i = 0; i < this._musicOscillators.length; i++) {
      try { this._musicOscillators[i].stop(); } catch (e) { /* already stopped */ }
    }
    this._musicOscillators = [];
    for (var j = 0; j < this._musicGains.length; j++) {
      try { this._musicGains[j].disconnect(); } catch (e) { /* swallow */ }
    }
    this._musicGains = [];
  }

  stopMusic() {
    if (this._musicInterval) {
      clearInterval(this._musicInterval);
      this._musicInterval = null;
    }
    this._stopMusicOscillators();
  }

  /**
   * Internal sequencer: plays a pattern of notes in a loop.
   * @param {Array} pattern - Array of {freq, type, duration} objects (freq=0 means rest)
   * @param {number} bpm - Beats per minute
   * @param {number} volume
   */
  _startSequencer(pattern, bpm, volume) {
    this.stopMusic();
    var self = this;
    var stepDuration = 60 / bpm; // seconds per beat
    var stepIndex = 0;

    var playStep = function () {
      try {
        var ctx = self._getCtx();
        var t = ctx.currentTime;
        var note = pattern[stepIndex % pattern.length];
        if (note.freq > 0) {
          var osc = ctx.createOscillator();
          var gain = ctx.createGain();
          osc.type = note.type || 'square';
          osc.frequency.setValueAtTime(note.freq, t);
          var dur = note.duration || stepDuration * 0.8;
          gain.gain.setValueAtTime(volume, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(t);
          osc.stop(t + dur + 0.05);
          self._musicOscillators.push(osc);
          self._musicGains.push(gain);
          // Cleanup references for stopped oscillators (keep array manageable)
          if (self._musicOscillators.length > 32) {
            self._musicOscillators = self._musicOscillators.slice(-16);
            self._musicGains = self._musicGains.slice(-16);
          }
        }
        stepIndex++;
      } catch (e) { /* swallow */ }
    };

    // Play first note immediately
    playStep();
    this._musicInterval = setInterval(playStep, stepDuration * 1000);
  }

  playTitleMusic() {
    // Pentatonic melody loop, tempo 140bpm
    // C5, D5, E5, G5, A5 pentatonic = 523, 587, 659, 784, 880
    var pattern = [
      { freq: 523, type: 'square' },
      { freq: 659, type: 'square' },
      { freq: 784, type: 'square' },
      { freq: 659, type: 'square' },
      { freq: 880, type: 'square' },
      { freq: 784, type: 'square' },
      { freq: 659, type: 'square' },
      { freq: 523, type: 'square' },
      { freq: 587, type: 'square' },
      { freq: 784, type: 'square' },
      { freq: 880, type: 'square' },
      { freq: 784, type: 'square' },
      { freq: 659, type: 'square' },
      { freq: 587, type: 'square' },
      { freq: 523, type: 'square' },
      { freq: 0 } // rest
    ];
    this._startSequencer(pattern, 140, 0.1);
  }

  playLevel1Music() {
    // Upbeat hair metal chiptune - fast tempo, power chord patterns
    // Uses root+fifth patterns for "power chord" feel
    // E4=330, B4=494, A4=440, G4=392, D5=587
    var pattern = [
      { freq: 330, type: 'square' },
      { freq: 330, type: 'square' },
      { freq: 494, type: 'square' },
      { freq: 330, type: 'square' },
      { freq: 440, type: 'square' },
      { freq: 440, type: 'square' },
      { freq: 659, type: 'square' },
      { freq: 440, type: 'square' },
      { freq: 392, type: 'square' },
      { freq: 392, type: 'square' },
      { freq: 587, type: 'square' },
      { freq: 392, type: 'square' },
      { freq: 440, type: 'square' },
      { freq: 494, type: 'square' },
      { freq: 330, type: 'square' },
      { freq: 0 },
      { freq: 330, type: 'sawtooth' },
      { freq: 494, type: 'sawtooth' },
      { freq: 659, type: 'sawtooth' },
      { freq: 494, type: 'sawtooth' },
      { freq: 440, type: 'sawtooth' },
      { freq: 659, type: 'sawtooth' },
      { freq: 587, type: 'sawtooth' },
      { freq: 440, type: 'sawtooth' },
      { freq: 392, type: 'square' },
      { freq: 494, type: 'square' },
      { freq: 587, type: 'square' },
      { freq: 494, type: 'square' },
      { freq: 440, type: 'square' },
      { freq: 392, type: 'square' },
      { freq: 330, type: 'square' },
      { freq: 0 }
    ];
    this._startSequencer(pattern, 180, 0.1);
  }

  playLevel2Music() {
    // Comedic bouncy loop - staccato, playful
    // Uses major scale jumps and rests for bouncy feel
    var pattern = [
      { freq: 523, type: 'square', duration: 0.08 },
      { freq: 0 },
      { freq: 659, type: 'square', duration: 0.08 },
      { freq: 0 },
      { freq: 784, type: 'triangle', duration: 0.08 },
      { freq: 784, type: 'triangle', duration: 0.08 },
      { freq: 659, type: 'square', duration: 0.08 },
      { freq: 0 },
      { freq: 440, type: 'square', duration: 0.08 },
      { freq: 0 },
      { freq: 523, type: 'triangle', duration: 0.08 },
      { freq: 0 },
      { freq: 659, type: 'square', duration: 0.08 },
      { freq: 523, type: 'square', duration: 0.08 },
      { freq: 440, type: 'triangle', duration: 0.12 },
      { freq: 0 },
      { freq: 392, type: 'square', duration: 0.08 },
      { freq: 0 },
      { freq: 523, type: 'square', duration: 0.08 },
      { freq: 0 },
      { freq: 659, type: 'triangle', duration: 0.08 },
      { freq: 784, type: 'triangle', duration: 0.08 },
      { freq: 880, type: 'square', duration: 0.12 },
      { freq: 0 }
    ];
    this._startSequencer(pattern, 160, 0.1);
  }

  playLevel3Music() {
    // Dark, heavy grunge chiptune - lower register, dissonant
    // E2=82, A2=110, B2=123, G2=98, D3=147, C3=131
    var pattern = [
      { freq: 82, type: 'sawtooth' },
      { freq: 82, type: 'sawtooth' },
      { freq: 82, type: 'sawtooth' },
      { freq: 0 },
      { freq: 98, type: 'sawtooth' },
      { freq: 98, type: 'sawtooth' },
      { freq: 87, type: 'sawtooth' }, // F2 - dissonant against E
      { freq: 82, type: 'sawtooth' },
      { freq: 110, type: 'sawtooth' },
      { freq: 110, type: 'sawtooth' },
      { freq: 123, type: 'sawtooth' },
      { freq: 110, type: 'sawtooth' },
      { freq: 98, type: 'sawtooth' },
      { freq: 82, type: 'sawtooth' },
      { freq: 0 },
      { freq: 0 },
      { freq: 82, type: 'square' },
      { freq: 131, type: 'square' },
      { freq: 82, type: 'square' },
      { freq: 0 },
      { freq: 98, type: 'square' },
      { freq: 147, type: 'square' },
      { freq: 131, type: 'square' },
      { freq: 0 },
      { freq: 110, type: 'sawtooth' },
      { freq: 82, type: 'sawtooth' },
      { freq: 110, type: 'sawtooth' },
      { freq: 123, type: 'sawtooth' },
      { freq: 98, type: 'sawtooth' },
      { freq: 82, type: 'sawtooth' },
      { freq: 0 },
      { freq: 0 }
    ];
    this._startSequencer(pattern, 120, 0.12);
  }

  playWinMusic() {
    // Triumphant ascending melody
    var pattern = [
      { freq: 523, type: 'square' },
      { freq: 587, type: 'square' },
      { freq: 659, type: 'square' },
      { freq: 784, type: 'square' },
      { freq: 880, type: 'square' },
      { freq: 1047, type: 'square' },
      { freq: 1175, type: 'square' },
      { freq: 1319, type: 'square' },
      { freq: 1047, type: 'square' },
      { freq: 1319, type: 'square' },
      { freq: 1568, type: 'square', duration: 0.4 },
      { freq: 0 },
      { freq: 0 },
      { freq: 0 },
      { freq: 0 },
      { freq: 0 }
    ];
    this._startSequencer(pattern, 150, 0.12);
  }

  playLoseMusic() {
    // Somber slow descending melody
    var pattern = [
      { freq: 392, type: 'triangle', duration: 0.4 },
      { freq: 0 },
      { freq: 349, type: 'triangle', duration: 0.4 },
      { freq: 0 },
      { freq: 330, type: 'triangle', duration: 0.4 },
      { freq: 0 },
      { freq: 294, type: 'triangle', duration: 0.4 },
      { freq: 0 },
      { freq: 262, type: 'triangle', duration: 0.6 },
      { freq: 0 },
      { freq: 0 },
      { freq: 0 },
      { freq: 0 },
      { freq: 0 },
      { freq: 0 },
      { freq: 0 }
    ];
    this._startSequencer(pattern, 80, 0.1);
  }
}
