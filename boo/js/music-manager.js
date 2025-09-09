class MusicManager {
    constructor() {
        this.audioContext = null;
        this.isPlaying = false;
        this.enabled = true;
        this.volume = 0.3;
        this.tempo = 120; // BPM
        this.currentBeat = 0;
        this.nextNoteTime = 0;
        this.scheduleAheadTime = 0.1;
        this.lookahead = 25.0; // milliseconds
        this.timerID = null;
        
        // Musical patterns
        this.melodyPattern = [];
        this.bassPattern = [];
        this.currentMelodyNote = 0;
        this.currentBassNote = 0;
        this.nextMelodyBeat = 0;
        this.nextBassBeat = 0;
        
        // Initialize patterns
        this.initializePatterns();
    }

    async init() {
        if (this.audioContext) {
            return;
        }
        
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // Resume if suspended
            if (this.audioContext.state === 'suspended') {
                await this.audioContext.resume();
            }
            
            // Create master gain node
            this.masterGain = this.audioContext.createGain();
            this.masterGain.gain.value = this.volume;
            this.masterGain.connect(this.audioContext.destination);
            
            // Create reverb
            this.reverb = await this.createReverb();
            this.reverbGain = this.audioContext.createGain();
            this.reverbGain.gain.value = 0.3;
            this.reverb.connect(this.reverbGain);
            this.reverbGain.connect(this.masterGain);
            
        } catch (error) {
            console.error('Failed to initialize Web Audio API:', error);
        }
    }

    initializePatterns() {
        // Spooky melody in minor key (A minor)
        // Notes: frequency in Hz, duration in beats, volume
        this.melodyPattern = [
            // Creepy opening phrase
            { freq: 440, dur: 2, vol: 0.5 },    // A
            { freq: 523.25, dur: 1, vol: 0.4 }, // C
            { freq: 493.88, dur: 1, vol: 0.4 }, // B
            { freq: 440, dur: 2, vol: 0.5 },    // A
            { freq: 0, dur: 2, vol: 0 },        // Rest
            
            // Descending horror phrase
            { freq: 659.25, dur: 0.5, vol: 0.6 }, // E
            { freq: 622.25, dur: 0.5, vol: 0.6 }, // Eb (chromatic)
            { freq: 587.33, dur: 1, vol: 0.5 },   // D
            { freq: 523.25, dur: 1, vol: 0.5 },   // C
            { freq: 493.88, dur: 1, vol: 0.5 },   // B
            { freq: 466.16, dur: 2, vol: 0.6 },   // Bb (chromatic)
            { freq: 440, dur: 2, vol: 0.5 },      // A
            
            // Suspenseful part
            { freq: 329.63, dur: 0.5, vol: 0.4 }, // E (low)
            { freq: 349.23, dur: 0.5, vol: 0.4 }, // F
            { freq: 329.63, dur: 0.5, vol: 0.4 }, // E
            { freq: 349.23, dur: 0.5, vol: 0.4 }, // F
            { freq: 329.63, dur: 2, vol: 0.5 },   // E
            { freq: 0, dur: 2, vol: 0 },          // Rest
            
            // Chromatic horror climb
            { freq: 220, dur: 0.5, vol: 0.6 },    // A (low)
            { freq: 233.08, dur: 0.5, vol: 0.6 }, // Bb
            { freq: 246.94, dur: 0.5, vol: 0.6 }, // B
            { freq: 261.63, dur: 0.5, vol: 0.6 }, // C
            { freq: 277.18, dur: 0.5, vol: 0.6 }, // C#
            { freq: 293.66, dur: 0.5, vol: 0.6 }, // D
            { freq: 311.13, dur: 0.5, vol: 0.6 }, // Eb
            { freq: 329.63, dur: 0.5, vol: 0.7 }, // E
            { freq: 0, dur: 4, vol: 0 },          // Long rest
        ];

        // Ominous bass line
        this.bassPattern = [
            { freq: 110, dur: 4, vol: 0.6 },    // A (low)
            { freq: 82.41, dur: 4, vol: 0.6 },  // E (low)
            { freq: 87.31, dur: 4, vol: 0.6 },  // F (low)
            { freq: 110, dur: 4, vol: 0.6 },    // A (low)
            
            { freq: 110, dur: 2, vol: 0.6 },    // A
            { freq: 103.83, dur: 2, vol: 0.6 }, // Ab (chromatic)
            { freq: 98, dur: 2, vol: 0.6 },     // G
            { freq: 87.31, dur: 2, vol: 0.6 },  // F
            
            { freq: 82.41, dur: 8, vol: 0.7 },  // E (sustained)
            
            { freq: 110, dur: 1, vol: 0.5 },    // A (walking bass)
            { freq: 98, dur: 1, vol: 0.5 },     // G
            { freq: 87.31, dur: 1, vol: 0.5 },  // F
            { freq: 82.41, dur: 1, vol: 0.5 },  // E
            { freq: 73.42, dur: 4, vol: 0.6 },  // D (low)
        ];
    }

    async createReverb() {
        const convolver = this.audioContext.createConvolver();
        const length = this.audioContext.sampleRate * 2;
        const impulse = this.audioContext.createBuffer(2, length, this.audioContext.sampleRate);
        
        for (let channel = 0; channel < 2; channel++) {
            const channelData = impulse.getChannelData(channel);
            for (let i = 0; i < length; i++) {
                channelData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 2);
            }
        }
        
        convolver.buffer = impulse;
        return convolver;
    }

    playNote(frequency, startTime, duration, volume = 0.5, type = 'sine') {
        if (!this.audioContext || frequency === 0) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        const filter = this.audioContext.createBiquadFilter();
        
        // Configure oscillator
        oscillator.type = type;
        oscillator.frequency.setValueAtTime(frequency, startTime);
        
        // Add slight vibrato for spookiness
        const vibrato = this.audioContext.createOscillator();
        const vibratoGain = this.audioContext.createGain();
        vibrato.frequency.value = 5; // 5 Hz vibrato
        vibratoGain.gain.value = frequency * 0.01; // 1% pitch variation
        vibrato.connect(vibratoGain);
        vibratoGain.connect(oscillator.frequency);
        vibrato.start(startTime);
        vibrato.stop(startTime + duration);
        
        // Configure filter for darker tone
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(2000, startTime);
        filter.Q.setValueAtTime(1, startTime);
        
        // Configure envelope
        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(volume * this.volume, startTime + 0.02);
        gainNode.gain.exponentialRampToValueAtTime(volume * this.volume * 0.8, startTime + duration * 0.5);
        gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
        
        // Connect nodes
        oscillator.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.masterGain);
        
        // Add reverb send
        gainNode.connect(this.reverb);
        
        // Play
        oscillator.start(startTime);
        oscillator.stop(startTime + duration);
    }

    playMelodyNote(time) {
        const note = this.melodyPattern[this.currentMelodyNote];
        const beatDuration = 60.0 / this.tempo;
        
        // Play main melody with triangle wave for haunting sound
        this.playNote(note.freq, time, note.dur * beatDuration * 0.9, note.vol, 'triangle');
        
        // Add a quiet echo with sine wave
        if (note.freq > 0) {
            this.playNote(note.freq * 2, time + beatDuration * 0.1, note.dur * beatDuration * 0.5, note.vol * 0.2, 'sine');
        }
        
        this.currentMelodyNote = (this.currentMelodyNote + 1) % this.melodyPattern.length;
        return note.dur;
    }

    playBassNote(time) {
        const note = this.bassPattern[this.currentBassNote];
        const beatDuration = 60.0 / this.tempo;
        
        // Play bass with sawtooth for richness
        this.playNote(note.freq, time, note.dur * beatDuration * 0.95, note.vol, 'sawtooth');
        
        // Add sub-bass octave below
        this.playNote(note.freq / 2, time, note.dur * beatDuration * 0.95, note.vol * 0.3, 'sine');
        
        this.currentBassNote = (this.currentBassNote + 1) % this.bassPattern.length;
        return note.dur;
    }

    playPercussion(time) {
        const beatDuration = 60.0 / this.tempo;
        
        // Create creaky door/wooden percussion sound
        if (this.currentBeat % 4 === 0) {
            // Low thud
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();
            const filter = this.audioContext.createBiquadFilter();
            
            osc.frequency.setValueAtTime(60, time);
            osc.frequency.exponentialRampToValueAtTime(30, time + 0.1);
            
            filter.type = 'lowpass';
            filter.frequency.value = 150;
            
            gain.gain.setValueAtTime(this.volume * 0.5, time);
            gain.gain.exponentialRampToValueAtTime(0.001, time + 0.1);
            
            osc.connect(filter);
            filter.connect(gain);
            gain.connect(this.masterGain);
            
            osc.start(time);
            osc.stop(time + 0.1);
        }
        
        // Creepy high tick on off-beats
        if (this.currentBeat % 2 === 1) {
            const noise = this.audioContext.createBufferSource();
            const noiseBuffer = this.audioContext.createBuffer(1, this.audioContext.sampleRate * 0.02, this.audioContext.sampleRate);
            const data = noiseBuffer.getChannelData(0);
            
            for (let i = 0; i < data.length; i++) {
                data[i] = Math.random() * 2 - 1;
            }
            
            noise.buffer = noiseBuffer;
            
            const filter = this.audioContext.createBiquadFilter();
            filter.type = 'highpass';
            filter.frequency.value = 5000;
            
            const gain = this.audioContext.createGain();
            gain.gain.setValueAtTime(this.volume * 0.1, time);
            gain.gain.exponentialRampToValueAtTime(0.001, time + 0.02);
            
            noise.connect(filter);
            filter.connect(gain);
            gain.connect(this.masterGain);
            
            noise.start(time);
        }
    }

    scheduler() {
        if (!this.isPlaying) {
            return;
        }
        
        const beatDuration = 60.0 / this.tempo;
        
        while (this.nextNoteTime < this.audioContext.currentTime + this.scheduleAheadTime) {
            // Play melody when it's time for the next note
            if (this.currentBeat >= this.nextMelodyBeat) {
                const duration = this.playMelodyNote(this.nextNoteTime);
                this.nextMelodyBeat = this.currentBeat + duration;
            }
            
            // Play bass when it's time for the next note
            if (this.currentBeat >= this.nextBassBeat) {
                const duration = this.playBassNote(this.nextNoteTime);
                this.nextBassBeat = this.currentBeat + duration;
            }
            
            // Play percussion
            this.playPercussion(this.nextNoteTime);
            
            // Move to next beat
            this.nextNoteTime += beatDuration;
            this.currentBeat++;
        }
        
        this.timerID = setTimeout(() => this.scheduler(), this.lookahead);
    }

    async start() {
        if (this.isPlaying) return;
        
        await this.init();
        
        if (!this.audioContext) {
            return;
        }
        
        this.isPlaying = true;
        this.currentBeat = 0;
        this.nextMelodyBeat = 0;
        this.nextBassBeat = 0;
        this.currentMelodyNote = 0;
        this.currentBassNote = 0;
        this.nextNoteTime = this.audioContext.currentTime + 0.1;
        this.scheduler();
    }

    stop() {
        this.isPlaying = false;
        if (this.timerID) {
            clearTimeout(this.timerID);
            this.timerID = null;
        }
        
        // Reset pattern positions
        this.currentMelodyNote = 0;
        this.currentBassNote = 0;
    }

    setEnabled(enabled) {
        this.enabled = enabled;
        if (!enabled) {
            this.stop();
        }
    }

    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
        if (this.masterGain) {
            this.masterGain.gain.value = this.volume;
        }
    }

    playStinger() {
        if (!this.audioContext || !this.enabled) return;
        
        const time = this.audioContext.currentTime;
        
        // Play a dramatic stinger chord (diminished)
        const notes = [220, 261.63, 311.13, 369.99]; // A, C, Eb, F# (diminished)
        
        notes.forEach((freq, i) => {
            this.playNote(freq, time + i * 0.05, 1.5, 0.7, 'sawtooth');
            this.playNote(freq * 2, time + i * 0.05, 1.0, 0.3, 'triangle');
        });
    }
}

const musicManager = new MusicManager();
window.musicManager = musicManager;