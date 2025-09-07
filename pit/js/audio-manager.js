class AudioManager {
    constructor() {
        this.sounds = {};
        this.musicVolume = 0.3;
        this.effectsVolume = 0.5;
        this.enabled = true;
        this.currentMusic = null;
        this.audioContext = null;
        this.initialized = false;
    }

    async init() {
        if (this.initialized) return;
        
        try {
            window.AudioContext = window.AudioContext || window.webkitAudioContext;
            this.audioContext = new AudioContext();
            this.initialized = true;
        } catch (error) {
            console.warn('Web Audio API not supported:', error);
        }
    }

    async loadSounds() {
        await this.init();
        
        this.createJumpSound();
        this.createSuccessSound();
        this.createRunningSound();
        this.createCrashSound();
        this.createTentacleSound();
        
        return Promise.resolve();
    }

    createJumpSound() {
        this.sounds.jump = () => {
            if (!this.enabled || !this.audioContext) return;
            
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.type = 'square';
            oscillator.frequency.setValueAtTime(400, this.audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(600, this.audioContext.currentTime + 0.1);
            oscillator.frequency.exponentialRampToValueAtTime(400, this.audioContext.currentTime + 0.2);
            
            gainNode.gain.setValueAtTime(this.effectsVolume * 0.3, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + 0.3);
        };
    }

    createSuccessSound() {
        this.sounds.success = () => {
            if (!this.enabled || !this.audioContext) return;
            
            const notes = [523, 659, 784, 1047];
            
            notes.forEach((freq, index) => {
                const oscillator = this.audioContext.createOscillator();
                const gainNode = this.audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(this.audioContext.destination);
                
                oscillator.type = 'square';
                oscillator.frequency.value = freq;
                
                const startTime = this.audioContext.currentTime + index * 0.15;
                gainNode.gain.setValueAtTime(0, startTime);
                gainNode.gain.linearRampToValueAtTime(this.effectsVolume * 0.4, startTime + 0.02);
                gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.4);
                
                oscillator.start(startTime);
                oscillator.stop(startTime + 0.4);
            });
        };
    }

    createRunningSound() {
        this.sounds.running = () => {
            if (!this.enabled || !this.audioContext) return;
            
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            const filter = this.audioContext.createBiquadFilter();
            
            oscillator.connect(filter);
            filter.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.type = 'sawtooth';
            oscillator.frequency.value = 60;
            
            filter.type = 'lowpass';
            filter.frequency.value = 200;
            
            gainNode.gain.setValueAtTime(this.effectsVolume * 0.1, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + 0.1);
        };
    }

    createCrashSound() {
        this.sounds.crash = () => {
            if (!this.enabled || !this.audioContext) return;
            
            const duration = 0.5;
            const bufferSize = this.audioContext.sampleRate * duration;
            const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
            const data = buffer.getChannelData(0);
            
            for (let i = 0; i < bufferSize; i++) {
                data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 2);
            }
            
            const source = this.audioContext.createBufferSource();
            const gainNode = this.audioContext.createGain();
            const filter = this.audioContext.createBiquadFilter();
            
            source.buffer = buffer;
            source.connect(filter);
            filter.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            filter.type = 'lowpass';
            filter.frequency.value = 800;
            
            gainNode.gain.value = this.effectsVolume * 0.6;
            
            source.start();
        };
    }

    createTentacleSound() {
        this.sounds.tentacle = () => {
            if (!this.enabled || !this.audioContext) return;
            
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            const lfo = this.audioContext.createOscillator();
            const lfoGain = this.audioContext.createGain();
            
            lfo.connect(lfoGain);
            lfoGain.connect(oscillator.frequency);
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(80, this.audioContext.currentTime);
            
            lfo.type = 'sine';
            lfo.frequency.value = 8;
            lfoGain.gain.value = 30;
            
            gainNode.gain.setValueAtTime(this.effectsVolume * 0.4, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 1);
            
            oscillator.start(this.audioContext.currentTime);
            lfo.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + 1);
            lfo.stop(this.audioContext.currentTime + 1);
        };
    }

    playSound(soundName) {
        if (!this.enabled || !this.sounds[soundName]) return;
        
        try {
            if (this.audioContext && this.audioContext.state === 'suspended') {
                this.audioContext.resume();
            }
            this.sounds[soundName]();
        } catch (error) {
            console.warn(`Failed to play sound ${soundName}:`, error);
        }
    }

    playBackgroundMusic() {
        if (!this.enabled) return;
    }

    stopBackgroundMusic() {
        if (this.currentMusic) {
            this.currentMusic.pause();
            this.currentMusic = null;
        }
    }

    setEnabled(enabled) {
        this.enabled = enabled;
        if (!enabled) {
            this.stopBackgroundMusic();
        }
    }

    setMusicVolume(volume) {
        this.musicVolume = Math.max(0, Math.min(1, volume));
        if (this.currentMusic) {
            this.currentMusic.volume = this.musicVolume;
        }
    }

    setEffectsVolume(volume) {
        this.effectsVolume = Math.max(0, Math.min(1, volume));
    }
}

const audioManager = new AudioManager();