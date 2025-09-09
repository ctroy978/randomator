class MusicManager {
    constructor() {
        this.audioContext = null;
        this.isPlaying = false;
        this.enabled = true;
        this.volume = 0.3;
        this.tempo = 90; // BPM - slower for that laid-back saloon feel
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
            
            // Create reverb for that spacious saloon sound
            this.reverb = await this.createReverb();
            this.reverbGain = this.audioContext.createGain();
            this.reverbGain.gain.value = 0.4; // More reverb for saloon atmosphere
            this.reverb.connect(this.reverbGain);
            this.reverbGain.connect(this.masterGain);
            
        } catch (error) {
            console.error('Failed to initialize Web Audio API:', error);
        }
    }

    initializePatterns() {
        // Western saloon melody in G major with bluesy notes
        // Notes: frequency in Hz, duration in beats, volume
        this.melodyPattern = [
            // Opening phrase - classic western riff
            { freq: 392, dur: 1, vol: 0.5 },     // G
            { freq: 440, dur: 0.5, vol: 0.4 },   // A
            { freq: 493.88, dur: 0.5, vol: 0.4 }, // B
            { freq: 587.33, dur: 1, vol: 0.5 },   // D
            { freq: 493.88, dur: 1, vol: 0.4 },   // B
            { freq: 392, dur: 2, vol: 0.5 },      // G
            { freq: 0, dur: 1, vol: 0 },          // Rest
            
            // Blues-inspired phrase
            { freq: 466.16, dur: 0.5, vol: 0.5 }, // Bb (blues note)
            { freq: 493.88, dur: 0.5, vol: 0.5 }, // B
            { freq: 587.33, dur: 1, vol: 0.5 },   // D
            { freq: 523.25, dur: 1, vol: 0.5 },   // C
            { freq: 493.88, dur: 1, vol: 0.5 },   // B
            { freq: 440, dur: 1, vol: 0.5 },      // A
            { freq: 392, dur: 2, vol: 0.5 },      // G
            
            // Call and response phrase
            { freq: 293.66, dur: 0.5, vol: 0.4 }, // D (low)
            { freq: 329.63, dur: 0.5, vol: 0.4 }, // E
            { freq: 392, dur: 1, vol: 0.5 },      // G
            { freq: 440, dur: 1, vol: 0.5 },      // A
            { freq: 392, dur: 2, vol: 0.5 },      // G
            { freq: 0, dur: 2, vol: 0 },          // Rest
            
            // Sliding western lick
            { freq: 587.33, dur: 0.5, vol: 0.6 }, // D
            { freq: 554.37, dur: 0.25, vol: 0.5 },// C# (slide)
            { freq: 523.25, dur: 0.25, vol: 0.5 },// C
            { freq: 493.88, dur: 0.5, vol: 0.5 }, // B
            { freq: 466.16, dur: 0.5, vol: 0.5 }, // Bb (blues)
            { freq: 440, dur: 0.5, vol: 0.5 },    // A
            { freq: 392, dur: 1.5, vol: 0.6 },    // G
            { freq: 0, dur: 2, vol: 0 },          // Rest
            
            // Honky-tonk style run
            { freq: 392, dur: 0.25, vol: 0.4 },   // G
            { freq: 440, dur: 0.25, vol: 0.4 },   // A
            { freq: 493.88, dur: 0.25, vol: 0.4 },// B
            { freq: 523.25, dur: 0.25, vol: 0.4 },// C
            { freq: 587.33, dur: 0.5, vol: 0.5 }, // D
            { freq: 523.25, dur: 0.5, vol: 0.5 }, // C
            { freq: 493.88, dur: 0.5, vol: 0.5 }, // B
            { freq: 440, dur: 0.5, vol: 0.5 },    // A
            { freq: 392, dur: 2, vol: 0.5 },      // G
            { freq: 0, dur: 2, vol: 0 },          // Long rest
        ];

        // Walking bass line - classic country/western style
        this.bassPattern = [
            // Root-fifth pattern
            { freq: 196, dur: 1, vol: 0.6 },     // G
            { freq: 293.66, dur: 1, vol: 0.6 },  // D
            { freq: 196, dur: 1, vol: 0.6 },     // G
            { freq: 293.66, dur: 1, vol: 0.6 },  // D
            
            // Walking bass line
            { freq: 196, dur: 1, vol: 0.6 },     // G
            { freq: 220, dur: 1, vol: 0.6 },     // A
            { freq: 246.94, dur: 1, vol: 0.6 },  // B
            { freq: 261.63, dur: 1, vol: 0.6 },  // C
            
            { freq: 293.66, dur: 1, vol: 0.6 },  // D
            { freq: 261.63, dur: 1, vol: 0.6 },  // C
            { freq: 246.94, dur: 1, vol: 0.6 },  // B
            { freq: 220, dur: 1, vol: 0.6 },     // A
            
            // Blues progression
            { freq: 196, dur: 2, vol: 0.6 },     // G
            { freq: 261.63, dur: 2, vol: 0.6 },  // C
            { freq: 293.66, dur: 2, vol: 0.6 },  // D
            { freq: 196, dur: 2, vol: 0.6 },     // G
            
            // Alternating bass
            { freq: 196, dur: 0.5, vol: 0.6 },   // G
            { freq: 146.83, dur: 0.5, vol: 0.6 },// D (low)
            { freq: 196, dur: 0.5, vol: 0.6 },   // G
            { freq: 146.83, dur: 0.5, vol: 0.6 },// D (low)
            { freq: 196, dur: 0.5, vol: 0.6 },   // G
            { freq: 146.83, dur: 0.5, vol: 0.6 },// D (low)
            { freq: 196, dur: 1, vol: 0.6 },     // G
        ];
    }

    async createReverb() {
        const convolver = this.audioContext.createConvolver();
        const length = this.audioContext.sampleRate * 2.5; // Longer reverb for saloon
        const impulse = this.audioContext.createBuffer(2, length, this.audioContext.sampleRate);
        
        for (let channel = 0; channel < 2; channel++) {
            const channelData = impulse.getChannelData(channel);
            for (let i = 0; i < length; i++) {
                // Create a more wooden, room-like reverb
                channelData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 1.5);
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
        
        // Configure oscillator - use square for that honky-tonk piano sound
        oscillator.type = type;
        oscillator.frequency.setValueAtTime(frequency, startTime);
        
        // Add slight detuning for honky-tonk effect
        const detune = (Math.random() - 0.5) * 10; // Random detuning
        oscillator.detune.setValueAtTime(detune, startTime);
        
        // Configure filter for warmer, vintage tone
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(3000, startTime);
        filter.Q.setValueAtTime(2, startTime);
        
        // Configure envelope - sharper attack for piano-like sound
        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(volume * this.volume, startTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(volume * this.volume * 0.7, startTime + duration * 0.3);
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
        
        // Play main melody with square wave for honky-tonk piano sound
        this.playNote(note.freq, time, note.dur * beatDuration * 0.9, note.vol, 'square');
        
        // Add octave double for richness
        if (note.freq > 0) {
            this.playNote(note.freq * 2, time, note.dur * beatDuration * 0.8, note.vol * 0.15, 'triangle');
        }
        
        this.currentMelodyNote = (this.currentMelodyNote + 1) % this.melodyPattern.length;
        return note.dur;
    }

    playBassNote(time) {
        const note = this.bassPattern[this.currentBassNote];
        const beatDuration = 60.0 / this.tempo;
        
        // Play bass with sawtooth for that upright bass sound
        this.playNote(note.freq, time, note.dur * beatDuration * 0.95, note.vol, 'sawtooth');
        
        // Add fundamental for weight
        this.playNote(note.freq / 2, time, note.dur * beatDuration * 0.95, note.vol * 0.4, 'sine');
        
        this.currentBassNote = (this.currentBassNote + 1) % this.bassPattern.length;
        return note.dur;
    }

    playPercussion(time) {
        const beatDuration = 60.0 / this.tempo;
        
        // Spoons/woodblock sound on beats
        if (this.currentBeat % 2 === 0) {
            // Create click sound
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();
            const filter = this.audioContext.createBiquadFilter();
            
            osc.frequency.setValueAtTime(800, time);
            osc.frequency.exponentialRampToValueAtTime(400, time + 0.02);
            
            filter.type = 'bandpass';
            filter.frequency.value = 2000;
            filter.Q.value = 10;
            
            gain.gain.setValueAtTime(this.volume * 0.3, time);
            gain.gain.exponentialRampToValueAtTime(0.001, time + 0.02);
            
            osc.connect(filter);
            filter.connect(gain);
            gain.connect(this.masterGain);
            
            osc.start(time);
            osc.stop(time + 0.02);
        }
        
        // Brush/shaker on off-beats
        if (this.currentBeat % 2 === 1) {
            const noise = this.audioContext.createBufferSource();
            const noiseBuffer = this.audioContext.createBuffer(1, this.audioContext.sampleRate * 0.05, this.audioContext.sampleRate);
            const data = noiseBuffer.getChannelData(0);
            
            for (let i = 0; i < data.length; i++) {
                data[i] = Math.random() * 2 - 1;
            }
            
            noise.buffer = noiseBuffer;
            
            const filter = this.audioContext.createBiquadFilter();
            filter.type = 'bandpass';
            filter.frequency.value = 3000;
            filter.Q.value = 5;
            
            const gain = this.audioContext.createGain();
            gain.gain.setValueAtTime(this.volume * 0.15, time);
            gain.gain.exponentialRampToValueAtTime(0.001, time + 0.05);
            
            noise.connect(filter);
            filter.connect(gain);
            gain.connect(this.masterGain);
            
            noise.start(time);
        }
        
        // Boot stomp on downbeats
        if (this.currentBeat % 4 === 0) {
            const kick = this.audioContext.createOscillator();
            const kickGain = this.audioContext.createGain();
            
            kick.frequency.setValueAtTime(80, time);
            kick.frequency.exponentialRampToValueAtTime(40, time + 0.05);
            
            kickGain.gain.setValueAtTime(this.volume * 0.4, time);
            kickGain.gain.exponentialRampToValueAtTime(0.001, time + 0.05);
            
            kick.connect(kickGain);
            kickGain.connect(this.masterGain);
            
            kick.start(time);
            kick.stop(time + 0.05);
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

    playCardFlip() {
        if (!this.audioContext || !this.enabled) return;
        
        const time = this.audioContext.currentTime;
        
        // Play a quick musical flourish when cards flip
        const notes = [392, 493.88, 587.33, 784]; // G, B, D, G (octave)
        
        notes.forEach((freq, i) => {
            this.playNote(freq, time + i * 0.05, 0.2, 0.4, 'square');
        });
    }

    playWinSound() {
        if (!this.audioContext || !this.enabled) return;
        
        const time = this.audioContext.currentTime;
        
        // Play a triumphant western chord progression
        const chords = [
            [196, 246.94, 293.66, 392],    // G major
            [261.63, 329.63, 392, 523.25], // C major
            [293.66, 369.99, 440, 587.33], // D major
            [196, 246.94, 293.66, 392]     // G major
        ];
        
        chords.forEach((chord, i) => {
            chord.forEach(freq => {
                this.playNote(freq, time + i * 0.3, 0.5, 0.5, 'square');
            });
        });
    }
}

const musicManager = new MusicManager();
window.musicManager = musicManager;