class AudioManager {
    constructor() {
        this.enabled = true;
        this.musicVolume = 0.3;
        this.effectsVolume = 0.5;
        this.sounds = {};
        this.audioContext = null;
        this.musicLoop = null;
        this.isPlaying = false;
    }

    async loadSounds() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            this.sounds = {
                aagun: this.createAAGunSound(),
                hit: this.createHitSound(),
                crash: this.createCrashSound(),
                explosion: this.createExplosionSound(),
                engine: this.createEngineSound(),
                alarm: this.createAlarmSound(),
                victory: this.createVictorySound()
            };
            
            console.log('Audio system initialized');
            return true;
        } catch (error) {
            console.error('Failed to initialize audio:', error);
            return false;
        }
    }

    createAAGunSound() {
        return () => {
            if (!this.enabled || !this.audioContext) return;
            
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            const filter = this.audioContext.createBiquadFilter();
            
            oscillator.type = 'sawtooth';
            oscillator.frequency.setValueAtTime(100, this.audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(50, this.audioContext.currentTime + 0.1);
            
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(1000, this.audioContext.currentTime);
            filter.frequency.exponentialRampToValueAtTime(200, this.audioContext.currentTime + 0.1);
            
            gainNode.gain.setValueAtTime(this.effectsVolume * 0.3, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
            
            oscillator.connect(filter);
            filter.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.start();
            oscillator.stop(this.audioContext.currentTime + 0.1);
            
            const noise = this.audioContext.createBufferSource();
            const noiseBuffer = this.audioContext.createBuffer(1, this.audioContext.sampleRate * 0.05, this.audioContext.sampleRate);
            const noiseData = noiseBuffer.getChannelData(0);
            for (let i = 0; i < noiseData.length; i++) {
                noiseData[i] = Math.random() * 2 - 1;
            }
            noise.buffer = noiseBuffer;
            
            const noiseGain = this.audioContext.createGain();
            noiseGain.gain.setValueAtTime(this.effectsVolume * 0.2, this.audioContext.currentTime);
            noiseGain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.05);
            
            noise.connect(noiseGain);
            noiseGain.connect(this.audioContext.destination);
            noise.start();
        };
    }

    createHitSound() {
        return () => {
            if (!this.enabled || !this.audioContext) return;
            
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.type = 'square';
            oscillator.frequency.setValueAtTime(200, this.audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(50, this.audioContext.currentTime + 0.2);
            
            gainNode.gain.setValueAtTime(this.effectsVolume * 0.4, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.start();
            oscillator.stop(this.audioContext.currentTime + 0.2);
        };
    }

    createCrashSound() {
        return () => {
            if (!this.enabled || !this.audioContext) return;
            
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            const filter = this.audioContext.createBiquadFilter();
            
            oscillator.type = 'sawtooth';
            oscillator.frequency.setValueAtTime(400, this.audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(20, this.audioContext.currentTime + 1);
            
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(2000, this.audioContext.currentTime);
            filter.frequency.exponentialRampToValueAtTime(100, this.audioContext.currentTime + 1);
            filter.Q.setValueAtTime(10, this.audioContext.currentTime);
            
            gainNode.gain.setValueAtTime(this.effectsVolume * 0.5, this.audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(this.effectsVolume * 0.3, this.audioContext.currentTime + 0.5);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 1);
            
            oscillator.connect(filter);
            filter.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.start();
            oscillator.stop(this.audioContext.currentTime + 1);
        };
    }

    createExplosionSound() {
        return () => {
            if (!this.enabled || !this.audioContext) return;
            
            const noise = this.audioContext.createBufferSource();
            const noiseBuffer = this.audioContext.createBuffer(1, this.audioContext.sampleRate * 0.5, this.audioContext.sampleRate);
            const noiseData = noiseBuffer.getChannelData(0);
            
            for (let i = 0; i < noiseData.length; i++) {
                noiseData[i] = Math.random() * 2 - 1;
            }
            noise.buffer = noiseBuffer;
            
            const filter = this.audioContext.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(3000, this.audioContext.currentTime);
            filter.frequency.exponentialRampToValueAtTime(100, this.audioContext.currentTime + 0.5);
            
            const gainNode = this.audioContext.createGain();
            gainNode.gain.setValueAtTime(this.effectsVolume * 0.8, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5);
            
            noise.connect(filter);
            filter.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            noise.start();
            
            const subBass = this.audioContext.createOscillator();
            subBass.type = 'sine';
            subBass.frequency.setValueAtTime(30, this.audioContext.currentTime);
            subBass.frequency.exponentialRampToValueAtTime(10, this.audioContext.currentTime + 0.5);
            
            const subGain = this.audioContext.createGain();
            subGain.gain.setValueAtTime(this.effectsVolume * 0.6, this.audioContext.currentTime);
            subGain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5);
            
            subBass.connect(subGain);
            subGain.connect(this.audioContext.destination);
            subBass.start();
            subBass.stop(this.audioContext.currentTime + 0.5);
        };
    }

    createEngineSound() {
        return () => {
            if (!this.enabled || !this.audioContext || this.musicLoop) return;
            
            const oscillator1 = this.audioContext.createOscillator();
            const oscillator2 = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            const filter = this.audioContext.createBiquadFilter();
            
            oscillator1.type = 'sawtooth';
            oscillator1.frequency.setValueAtTime(60, this.audioContext.currentTime);
            
            oscillator2.type = 'sawtooth';
            oscillator2.frequency.setValueAtTime(61, this.audioContext.currentTime);
            
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(200, this.audioContext.currentTime);
            filter.Q.setValueAtTime(5, this.audioContext.currentTime);
            
            gainNode.gain.setValueAtTime(this.musicVolume * 0.2, this.audioContext.currentTime);
            
            oscillator1.connect(filter);
            oscillator2.connect(filter);
            filter.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator1.start();
            oscillator2.start();
            
            this.musicLoop = {
                oscillator1,
                oscillator2,
                gainNode
            };
        };
    }

    createAlarmSound() {
        return () => {
            if (!this.enabled || !this.audioContext) return;
            
            for (let i = 0; i < 3; i++) {
                const oscillator = this.audioContext.createOscillator();
                const gainNode = this.audioContext.createGain();
                
                oscillator.type = 'square';
                oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime + i * 0.2);
                oscillator.frequency.exponentialRampToValueAtTime(600, this.audioContext.currentTime + i * 0.2 + 0.1);
                
                gainNode.gain.setValueAtTime(0, this.audioContext.currentTime + i * 0.2);
                gainNode.gain.linearRampToValueAtTime(this.effectsVolume * 0.3, this.audioContext.currentTime + i * 0.2 + 0.01);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + i * 0.2 + 0.1);
                
                oscillator.connect(gainNode);
                gainNode.connect(this.audioContext.destination);
                
                oscillator.start(this.audioContext.currentTime + i * 0.2);
                oscillator.stop(this.audioContext.currentTime + i * 0.2 + 0.1);
            }
        };
    }

    createVictorySound() {
        return () => {
            if (!this.enabled || !this.audioContext) return;
            
            const notes = [523.25, 659.25, 783.99, 1046.50];
            
            notes.forEach((freq, index) => {
                const oscillator = this.audioContext.createOscillator();
                const gainNode = this.audioContext.createGain();
                
                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(freq, this.audioContext.currentTime + index * 0.15);
                
                gainNode.gain.setValueAtTime(0, this.audioContext.currentTime + index * 0.15);
                gainNode.gain.linearRampToValueAtTime(this.effectsVolume * 0.3, this.audioContext.currentTime + index * 0.15 + 0.02);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + index * 0.15 + 0.3);
                
                oscillator.connect(gainNode);
                gainNode.connect(this.audioContext.destination);
                
                oscillator.start(this.audioContext.currentTime + index * 0.15);
                oscillator.stop(this.audioContext.currentTime + index * 0.15 + 0.3);
            });
        };
    }

    playAAGun() {
        if (this.sounds.aagun) this.sounds.aagun();
    }

    playHit() {
        if (this.sounds.hit) this.sounds.hit();
    }

    playCrash() {
        if (this.sounds.crash) this.sounds.crash();
        if (this.sounds.alarm) this.sounds.alarm();
    }

    playExplosion() {
        if (this.sounds.explosion) this.sounds.explosion();
    }

    playVictory() {
        if (this.sounds.victory) this.sounds.victory();
    }

    playBackgroundMusic() {
        if (this.sounds.engine && !this.isPlaying) {
            this.sounds.engine();
            this.isPlaying = true;
        }
    }

    stopBackgroundMusic() {
        if (this.musicLoop) {
            this.musicLoop.oscillator1.stop();
            this.musicLoop.oscillator2.stop();
            this.musicLoop = null;
            this.isPlaying = false;
        }
    }

    setEnabled(enabled) {
        this.enabled = enabled;
        if (!enabled) {
            this.stopBackgroundMusic();
        }
    }

    setMusicVolume(volume) {
        this.musicVolume = volume;
        if (this.musicLoop && this.musicLoop.gainNode) {
            this.musicLoop.gainNode.gain.setValueAtTime(volume * 0.2, this.audioContext.currentTime);
        }
    }

    setEffectsVolume(volume) {
        this.effectsVolume = volume;
    }
}

window.audioManager = new AudioManager();