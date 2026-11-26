/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function playTone(freq: number, type: OscillatorType, duration: number, volume = 0.1) {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);

    gain.gain.setValueAtTime(volume, ctx.currentTime);
    // Smooth decay
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch (e) {
    console.warn('Audio playback failed:', e);
  }
}

// Play a dual-tone multi-frequency (DTMF) tone for keypad keys
export function playDTMF(key: string, duration = 0.15) {
  try {
    const ctx = getAudioContext();
    const dtmfFrequencies: Record<string, [number, number]> = {
      '1': [697, 1209], '2': [697, 1336], '3': [697, 1477],
      '4': [770, 1209], '5': [770, 1336], '6': [770, 1477],
      '7': [852, 1209], '8': [852, 1336], '9': [852, 1477],
      '*': [941, 1209], '0': [941, 1336], '#': [941, 1477]
    };

    const freqs = dtmfFrequencies[key];
    if (!freqs) return;

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(freqs[0], ctx.currentTime);

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(freqs[1], ctx.currentTime);

    gainNode.gain.setValueAtTime(0.08, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc1.start();
    osc2.start();

    osc1.stop(ctx.currentTime + duration);
    osc2.stop(ctx.currentTime + duration);
  } catch (e) {
    console.warn('DTMF playback failed:', e);
  }
}

export interface Note {
  pitch: number; // Frequency in Hz
  duration: number; // Duration in seconds
}

// Simple helper to convert note names (e.g., E5, D#4) to frequency
export const NOTE_FREQS: Record<string, number> = {
  C4: 261.63, 'C#4': 277.18, D4: 293.66, 'D#4': 311.13, E4: 329.63, F4: 349.23, 'F#4': 369.99, G4: 392.00, 'G#4': 415.30, A4: 440.00, 'A#4': 466.16, B4: 493.88,
  C5: 523.25, 'C#5': 554.37, D5: 587.33, 'D#5': 622.25, E5: 659.25, F5: 698.46, 'F#5': 739.99, G5: 783.99, 'G#5': 830.61, A5: 880.00, 'A#5': 932.33, B5: 987.77,
  C6: 1046.50, 'C#6': 1109.73, D6: 1174.66, 'D#6': 1244.51, E6: 1318.51, F6: 1396.91, 'F#6': 1479.98, G6: 1567.98, 'G#6': 1661.22, A6: 1760.00, 'A#6': 1864.66, B6: 1975.53,
  REST: 0
};

// Play a sequence of notes
export function playSequence(notes: Array<{ note: string; duration: number }>, type: OscillatorType = 'sine', tempoBPM = 120) {
  try {
    const ctx = getAudioContext();
    const secondsPerBeat = 60 / tempoBPM;
    let accumulatedTime = ctx.currentTime;

    notes.forEach(({ note, duration }) => {
      const freq = NOTE_FREQS[note] || 0;
      const noteDuration = duration * secondsPerBeat;

      if (freq > 0) {
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, accumulatedTime);

        // Retro feel with sharp attack and slight decay
        gainNode.gain.setValueAtTime(0.08, accumulatedTime);
        gainNode.gain.setValueAtTime(0.08, accumulatedTime + noteDuration - 0.02);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, accumulatedTime + noteDuration);

        osc.connect(gainNode);
        gainNode.connect(ctx.destination);

        osc.start(accumulatedTime);
        osc.stop(accumulatedTime + noteDuration);
      }

      accumulatedTime += noteDuration;
    });
  } catch (e) {
    console.warn('Sequence playback failed:', e);
  }
}

// --- ICONIC MELODIES ---

// Classic Nokia Tune (Grande Valse)
export function playNokiaTune() {
  const notes = [
    { note: 'E5', duration: 0.5 },
    { note: 'D5', duration: 0.5 },
    { note: 'F#4', duration: 1.0 },
    { note: 'G#4', duration: 1.0 },
    { note: 'C#5', duration: 0.5 },
    { note: 'B4', duration: 0.5 },
    { note: 'D4', duration: 1.0 },
    { note: 'E4', duration: 1.0 },
    { note: 'B4', duration: 0.5 },
    { note: 'A4', duration: 0.5 },
    { note: 'C#4', duration: 1.0 },
    { note: 'E4', duration: 1.0 },
    { note: 'A4', duration: 2.0 },
  ];
  playSequence(notes, 'square', 140);
}

// Siemens Startup Sound (quick retro digital double-chirp)
export function playSiemensSound() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    const playChirp = (delay: number, baseFreq: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(baseFreq, now + delay);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 2, now + delay + 0.1);

      gain.gain.setValueAtTime(0.06, now + delay);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + delay + 0.12);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + delay);
      osc.stop(now + delay + 0.12);
    };

    playChirp(0, 440);
    playChirp(0.12, 880);
  } catch (e) {
    console.warn('Siemens sound failed:', e);
  }
}

// Motorola RAZR "Hello Moto" intro chord & voice chime
export function playMotorolaSound() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // Rich polyphonic sweeping retro pad
    const freqs = [220, 330, 440, 554, 659]; // A major chord
    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(100, now);
      filter.frequency.exponentialRampToValueAtTime(1500, now + 0.4);

      gain.gain.setValueAtTime(0.02, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.8 + idx * 0.1);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 1.2);
    });

    // Custom "Hello Moto" digital high beep
    setTimeout(() => {
      playSequence([
        { note: 'A5', duration: 0.25 },
        { note: 'C#6', duration: 0.25 },
        { note: 'E6', duration: 0.25 },
        { note: 'A6', duration: 0.75 }
      ], 'triangle', 180);
    }, 700);

  } catch (e) {
    console.warn('Motorola sound failed:', e);
  }
}

// Sony Ericsson Ringtone (iconic chime)
export function playSonyEricssonSound() {
  const notes = [
    { note: 'B5', duration: 0.25 },
    { note: 'G#5', duration: 0.25 },
    { note: 'E5', duration: 0.5 },
    { note: 'A5', duration: 0.25 },
    { note: 'F#5', duration: 0.25 },
    { note: 'D#5', duration: 0.5 },
    { note: 'E5', duration: 0.25 },
    { note: 'F#5', duration: 0.25 },
    { note: 'G#5', duration: 0.25 },
    { note: 'A5', duration: 0.25 },
    { note: 'B5', duration: 1.0 },
  ];
  playSequence(notes, 'sine', 130);
}

// Boomer (Бумер) - iconic movie soundtrack monophonic ringtone
export function playBoomerTheme() {
  const notes = [
    { note: 'A4', duration: 0.5 },
    { note: 'E5', duration: 0.5 },
    { note: 'A4', duration: 0.5 },
    { note: 'E5', duration: 0.5 },
    { note: 'A4', duration: 0.5 },
    { note: 'F5', duration: 0.5 },
    { note: 'A4', duration: 0.5 },
    { note: 'F5', duration: 0.5 },
    { note: 'G4', duration: 0.5 },
    { note: 'D5', duration: 0.5 },
    { note: 'G4', duration: 0.5 },
    { note: 'D5', duration: 0.5 },
    { note: 'E4', duration: 1.0 },
    { note: 'REST', duration: 0.5 },
    // part 2
    { note: 'A4', duration: 0.5 },
    { note: 'E5', duration: 0.5 },
    { note: 'A4', duration: 0.5 },
    { note: 'E5', duration: 0.5 },
    { note: 'A4', duration: 0.5 },
    { note: 'F5', duration: 0.5 },
    { note: 'A4', duration: 0.5 },
    { note: 'F5', duration: 0.5 },
    { note: 'G4', duration: 0.5 },
    { note: 'D5', duration: 0.5 },
    { note: 'E5', duration: 0.5 },
    { note: 'F5', duration: 0.5 },
    { note: 'E5', duration: 1.0 },
  ];
  playSequence(notes, 'square', 140);
}

// ICQ Uh-Oh! Sound
export function playIcqUhOh() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, now);
    // Rapid upward pitch sweep representing "uh-oh!"
    osc.frequency.linearRampToValueAtTime(750, now + 0.15);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.25);
  } catch (e) {
    console.warn('ICQ sound failed:', e);
  }
}

// Morse Code SMS (S-M-S: ... -- ...)
export function playSmsMorse() {
  const dot = 0.08;
  const dash = 0.24;
  const gap = 0.08;

  const sequence = [
    { freq: 800, dur: dot }, { freq: 0, dur: gap },
    { freq: 800, dur: dot }, { freq: 0, dur: gap },
    { freq: 800, dur: dot }, { freq: 0, dur: gap * 3 }, // S

    { freq: 800, dur: dash }, { freq: 0, dur: gap },
    { freq: 800, dur: dash }, { freq: 0, dur: gap * 3 }, // M

    { freq: 800, dur: dot }, { freq: 0, dur: gap },
    { freq: 800, dur: dot }, { freq: 0, dur: gap },
    { freq: 800, dur: dot } // S
  ];

  try {
    const ctx = getAudioContext();
    let accumulatedTime = ctx.currentTime;

    sequence.forEach(({ freq, dur }) => {
      if (freq > 0) {
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, accumulatedTime);

        gainNode.gain.setValueAtTime(0.08, accumulatedTime);
        gainNode.gain.setValueAtTime(0.08, accumulatedTime + dur - 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, accumulatedTime + dur);

        osc.connect(gainNode);
        gainNode.connect(ctx.destination);

        osc.start(accumulatedTime);
        osc.stop(accumulatedTime + dur);
      }
      accumulatedTime += dur;
    });
  } catch (e) {
    console.warn('SMS Morse sound failed:', e);
  }
}

// Dial-up Handshake Internet Sound (using noise and filtered frequencies)
export function playDialUpSound() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // Phase 1: DTMF tone calling
    playDTMF('1', 0.2);
    setTimeout(() => playDTMF('8', 0.2), 250);
    setTimeout(() => playDTMF('0', 0.2), 500);
    setTimeout(() => playDTMF('0', 0.2), 750);

    // Phase 2: Ringing back tone
    const ringTime = now + 1.1;
    setTimeout(() => {
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc1.frequency.setValueAtTime(400, ringTime);
      osc2.frequency.setValueAtTime(450, ringTime);

      gainNode.gain.setValueAtTime(0.03, ringTime);
      gainNode.gain.setValueAtTime(0.03, ringTime + 0.8);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, ringTime + 1.0);

      osc1.connect(gainNode);
      osc2.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc1.start(ringTime);
      osc2.start(ringTime);
      osc1.stop(ringTime + 1.0);
      osc2.stop(ringTime + 1.0);
    }, 1100);

    // Phase 3: Squealing handshake sounds
    const handshakeTime = now + 2.3;
    setTimeout(() => {
      // High pitch modulated carrier squeal
      const osc = ctx.createOscillator();
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(2225, handshakeTime);

      lfo.frequency.setValueAtTime(8, handshakeTime);
      lfoGain.gain.setValueAtTime(150, handshakeTime);

      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);

      gain.gain.setValueAtTime(0.02, handshakeTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, handshakeTime + 1.5);

      osc.connect(gain);
      gain.connect(ctx.destination);

      lfo.start(handshakeTime);
      osc.start(handshakeTime);
      lfo.stop(handshakeTime + 1.5);
      osc.stop(handshakeTime + 1.5);
    }, 2300);

    // Phase 4: static static static noise (connecting)
    const noiseTime = now + 3.8;
    setTimeout(() => {
      const bufferSize = ctx.sampleRate * 1.5; // 1.5 seconds
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noiseNode = ctx.createBufferSource();
      noiseNode.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1000, noiseTime);
      filter.frequency.linearRampToValueAtTime(500, noiseTime + 1.5);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.015, noiseTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, noiseTime + 1.5);

      noiseNode.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noiseNode.start(noiseTime);
      noiseNode.stop(noiseTime + 1.5);
    }, 3800);

  } catch (e) {
    console.warn('Dial up sound failed:', e);
  }
}
