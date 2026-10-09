// Web Audio API Synthesizer and WAV exporter for AI Music Generation

class SimpleSynth {
  private ctx: AudioContext | null = null;
  private isPlaying: boolean = false;
  private currentTimeout: any = null;

  private getContext(): AudioContext {
    if (!this.ctx || this.ctx.state === 'suspended') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  // Frequency mapping for musical notes
  private noteToFreq(note: string): number {
    const notes: Record<string, number> = {
      'C3': 130.81, 'D3': 146.83, 'E3': 164.81, 'F3': 174.61, 'G3': 196.00, 'A3': 220.00, 'B3': 246.94,
      'C4': 261.63, 'D4': 293.66, 'E4': 329.63, 'F4': 349.23, 'G4': 392.00, 'A4': 440.00, 'B4': 493.88,
      'C5': 523.25, 'D5': 587.33, 'E5': 659.25, 'F5': 698.46, 'G5': 783.99, 'A5': 880.00, 'B5': 987.77,
    };
    return notes[note] || 440;
  }

  public playTrack(
    bpm: number,
    chords: string[],
    notesList: Array<{ note: string; duration: number }>,
    onBeat?: (bar: number, isPlaying: boolean) => void,
    onEnded?: () => void
  ): () => void {
    const ctx = this.getContext();
    this.isPlaying = true;

    const beatDuration = 60 / (bpm || 120);
    let currentTime = ctx.currentTime + 0.1;
    const totalBars = 4; // loop 4 bars
    const totalDuration = totalBars * 4 * beatDuration;

    // Chord base frequencies
    const chordMap: Record<string, number[]> = {
      'C': [261.63, 329.63, 392.00],
      'Am': [220.00, 261.63, 329.63],
      'F': [174.61, 220.00, 261.63],
      'G': [196.00, 246.94, 293.66],
      'Em': [164.81, 196.00, 246.94],
      'Dm': [146.83, 174.61, 220.00],
    };

    const activeNodes: (AudioNode | any)[] = [];

    // Schedule chords and pads
    const chordSeq = chords && chords.length > 0 ? chords : ['C', 'G', 'Am', 'F'];
    for (let bar = 0; bar < totalBars; bar++) {
      const chordName = chordSeq[bar % chordSeq.length];
      const freqs = chordMap[chordName] || [261.63, 329.63, 392.00];
      const barStartTime = currentTime + bar * (4 * beatDuration);

      // Pad chord
      freqs.forEach((freq) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, barStartTime);

        gain.gain.setValueAtTime(0.001, barStartTime);
        gain.gain.linearRampToValueAtTime(0.08, barStartTime + 0.3);
        gain.gain.setValueAtTime(0.08, barStartTime + 4 * beatDuration - 0.2);
        gain.gain.linearRampToValueAtTime(0.001, barStartTime + 4 * beatDuration);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(barStartTime);
        osc.stop(barStartTime + 4 * beatDuration);
        activeNodes.push(osc);
      });

      // Bass note
      const bassOsc = ctx.createOscillator();
      const bassGain = ctx.createGain();
      bassOsc.type = 'triangle';
      bassOsc.frequency.setValueAtTime(freqs[0] / 2, barStartTime);

      bassGain.gain.setValueAtTime(0.12, barStartTime);
      bassGain.gain.exponentialRampToValueAtTime(0.01, barStartTime + 3.8 * beatDuration);

      bassOsc.connect(bassGain);
      bassGain.connect(ctx.destination);
      bassOsc.start(barStartTime);
      bassOsc.stop(barStartTime + 4 * beatDuration);
      activeNodes.push(bassOsc);

      // Drum beat (Kick & Hi-hat)
      for (let beat = 0; beat < 4; beat++) {
        const beatTime = barStartTime + beat * beatDuration;
        
        // Kick on beats 0 and 2
        if (beat === 0 || beat === 2) {
          const kick = ctx.createOscillator();
          const kickGain = ctx.createGain();
          kick.frequency.setValueAtTime(150, beatTime);
          kick.frequency.exponentialRampToValueAtTime(0.01, beatTime + 0.4);
          kickGain.gain.setValueAtTime(0.3, beatTime);
          kickGain.gain.exponentialRampToValueAtTime(0.001, beatTime + 0.4);
          kick.connect(kickGain);
          kickGain.connect(ctx.destination);
          kick.start(beatTime);
          kick.stop(beatTime + 0.4);
          activeNodes.push(kick);
        }

        // Snare/Clap on beats 1 and 3
        if (beat === 1 || beat === 3) {
          const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.15, ctx.sampleRate);
          const output = noiseBuffer.getChannelData(0);
          for (let i = 0; i < noiseBuffer.length; i++) {
            output[i] = Math.random() * 2 - 1;
          }
          const whiteNoise = ctx.createBufferSource();
          whiteNoise.buffer = noiseBuffer;
          const filter = ctx.createBiquadFilter();
          filter.type = 'highpass';
          filter.frequency.setValueAtTime(1000, beatTime);

          const snareGain = ctx.createGain();
          snareGain.gain.setValueAtTime(0.15, beatTime);
          snareGain.gain.exponentialRampToValueAtTime(0.001, beatTime + 0.15);

          whiteNoise.connect(filter);
          filter.connect(snareGain);
          snareGain.connect(ctx.destination);
          whiteNoise.start(beatTime);
          activeNodes.push(whiteNoise);
        }
      }
    }

    // Schedule Lead notes
    let noteTime = currentTime;
    const leadNotes = notesList && notesList.length > 0 ? notesList : [
      { note: 'C4', duration: 0.5 },
      { note: 'E4', duration: 0.5 },
      { note: 'G4', duration: 0.5 },
      { note: 'B4', duration: 0.5 },
      { note: 'C5', duration: 1.0 },
    ];

    while (noteTime < currentTime + totalDuration - 1) {
      for (const item of leadNotes) {
        if (noteTime >= currentTime + totalDuration) break;
        const dur = (item.duration || 0.5) * beatDuration;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(this.noteToFreq(item.note), noteTime);

        // Lowpass filter for smooth synth
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1800, noteTime);

        gain.gain.setValueAtTime(0.08, noteTime);
        gain.gain.exponentialRampToValueAtTime(0.001, noteTime + dur * 0.95);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        osc.start(noteTime);
        osc.stop(noteTime + dur);
        activeNodes.push(osc);

        noteTime += dur;
      }
    }

    // Call beat callbacks for visualizer
    let intervalId = setInterval(() => {
      if (!this.isPlaying) {
        clearInterval(intervalId);
        return;
      }
      const elapsed = ctx.currentTime - currentTime;
      if (elapsed >= totalDuration) {
        this.stop();
        if (onEnded) onEnded();
        clearInterval(intervalId);
      } else if (onBeat) {
        const beatNum = Math.floor(elapsed / beatDuration);
        onBeat(beatNum, true);
      }
    }, 100);

    return () => {
      this.isPlaying = false;
      clearInterval(intervalId);
      activeNodes.forEach(node => {
        try {
          if (node.stop) node.stop();
          if (node.disconnect) node.disconnect();
        } catch {}
      });
      if (onEnded) onEnded();
    };
  }

  public stop(): void {
    this.isPlaying = false;
  }

  // Export a real WAV file that users can download and play in any media player
  public async exportWav(bpm: number, chords: string[], notesList: any[], durationSec = 15): Promise<string> {
    const sampleRate = 44100;
    const numChannels = 2;
    const length = sampleRate * durationSec;
    const OfflineCtx = window.OfflineAudioContext || (window as any).webkitOfflineAudioContext;
    const offline = new OfflineCtx(numChannels, length, sampleRate);

    const beatDuration = 60 / (bpm || 120);
    const chordSeq = chords && chords.length > 0 ? chords : ['C', 'G', 'Am', 'F'];
    const chordMap: Record<string, number[]> = {
      'C': [261.63, 329.63, 392.00],
      'Am': [220.00, 261.63, 329.63],
      'F': [174.61, 220.00, 261.63],
      'G': [196.00, 246.94, 293.66],
      'Em': [164.81, 196.00, 246.94],
      'Dm': [146.83, 174.61, 220.00],
    };

    let curTime = 0;
    while (curTime < durationSec) {
      const barIndex = Math.floor(curTime / (4 * beatDuration));
      const chordName = chordSeq[barIndex % chordSeq.length];
      const freqs = chordMap[chordName] || [261.63, 329.63, 392.00];

      freqs.forEach((f) => {
        const osc = offline.createOscillator();
        const gain = offline.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, curTime);
        gain.gain.setValueAtTime(0.06, curTime);
        gain.gain.linearRampToValueAtTime(0.001, curTime + 4 * beatDuration);
        osc.connect(gain);
        gain.connect(offline.destination);
        osc.start(curTime);
        osc.stop(curTime + 4 * beatDuration);
      });

      // Bass
      const bass = offline.createOscillator();
      const bGain = offline.createGain();
      bass.type = 'triangle';
      bass.frequency.setValueAtTime(freqs[0] / 2, curTime);
      bGain.gain.setValueAtTime(0.12, curTime);
      bGain.gain.exponentialRampToValueAtTime(0.001, curTime + 3.8 * beatDuration);
      bass.connect(bGain);
      bGain.connect(offline.destination);
      bass.start(curTime);
      bass.stop(curTime + 4 * beatDuration);

      curTime += 4 * beatDuration;
    }

    const renderedBuffer = await offline.startRendering();
    return this.bufferToWave(renderedBuffer);
  }

  private bufferToWave(abuffer: AudioBuffer): string {
    const numOfChan = abuffer.numberOfChannels;
    const length = abuffer.length * numOfChan * 2 + 44;
    const out = new DataView(new ArrayBuffer(length));
    const channels: Float32Array[] = [];
    let sample: number;
    let offset = 0;
    let pos = 0;

    function setUint16(data: number) {
      out.setUint16(pos, data, true);
      pos += 2;
    }

    function setUint32(data: number) {
      out.setUint32(pos, data, true);
      pos += 4;
    }

    // RIFF identifier
    setUint32(0x46464952); // "RIFF"
    setUint32(length - 8);
    setUint32(0x45564157); // "WAVE"

    // fmt sub-chunk
    setUint32(0x20746d66); // "fmt "
    setUint32(16); // 16 for PCM
    setUint16(1); // PCM format
    setUint16(numOfChan);
    setUint32(abuffer.sampleRate);
    setUint32(abuffer.sampleRate * 2 * numOfChan); // byte rate
    setUint16(numOfChan * 2); // block align
    setUint16(16); // bits per sample

    // data sub-chunk
    setUint32(0x61746164); // "data"
    setUint32(length - pos - 4);

    for (let i = 0; i < abuffer.numberOfChannels; i++) {
      channels.push(abuffer.getChannelData(i));
    }

    while (offset < abuffer.length) {
      for (let i = 0; i < numOfChan; i++) {
        sample = Math.max(-1, Math.min(1, channels[i][offset]));
        sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0;
        out.setInt16(pos, sample, true);
        pos += 2;
      }
      offset++;
    }

    const blob = new Blob([out], { type: 'audio/wav' });
    return URL.createObjectURL(blob);
  }
}

export const synth = new SimpleSynth();
