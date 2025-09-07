class AudioManager {
    constructor() {
        this.sounds = {};
        this.backgroundMusic = null;
        this.enabled = false;
        this.musicVolume = 0.3;
        this.effectsVolume = 0.6;
        this.loaded = false;
        this.loadingErrors = [];
        this.audioContext = null;
        this.initializeAudioContext();
    }

    initializeAudioContext() {
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.audioContext = new AudioContext();
        } catch (error) {
            console.warn('Web Audio API not supported:', error);
        }
    }

    async loadSounds() {
        const soundFiles = {
            'background-music': 'assets/sounds/background-music.mp3',
            'pickaxe-hit-1': 'assets/sounds/pickaxe-hit-1.mp3',
            'pickaxe-hit-2': 'assets/sounds/pickaxe-hit-2.mp3',
            'pickaxe-hit-3': 'assets/sounds/pickaxe-hit-3.mp3',
            'rock-break': 'assets/sounds/rock-break.mp3',
            'success': 'assets/sounds/success.mp3'
        };

        const loadPromises = [];

        for (const [name, path] of Object.entries(soundFiles)) {
            loadPromises.push(this.loadSound(name, path));
        }

        await Promise.allSettled(loadPromises);
        
        if (this.sounds['background-music']) {
            this.backgroundMusic = this.sounds['background-music'];
            this.backgroundMusic.loop = true;
            this.backgroundMusic.volume = this.musicVolume;
        }

        this.loaded = true;
        
        if (this.loadingErrors.length > 0) {
            console.warn('Some audio files failed to load:', this.loadingErrors);
        }
        
        return this.loaded;
    }

    async loadSound(name, path) {
        return new Promise((resolve) => {
            const audio = new Audio();
            
            audio.addEventListener('canplaythrough', () => {
                this.sounds[name] = audio;
                console.log(`Loaded sound: ${name}`);
                resolve(true);
            }, { once: true });

            audio.addEventListener('error', (e) => {
                console.warn(`Failed to load sound ${name} from ${path}:`, e);
                this.loadingErrors.push({ name, path, error: e });
                resolve(false);
            }, { once: true });

            audio.src = path;
            audio.load();
        });
    }

    resumeAudioContext() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    }

    setEnabled(enabled) {
        this.enabled = enabled;
        
        if (enabled) {
            this.resumeAudioContext();
            if (this.backgroundMusic && this.loaded) {
                this.playBackgroundMusic();
            }
        } else {
            this.stopBackgroundMusic();
            this.stopAllSounds();
        }
    }

    setMusicVolume(volume) {
        this.musicVolume = Math.max(0, Math.min(1, volume));
        if (this.backgroundMusic) {
            this.backgroundMusic.volume = this.musicVolume;
        }
    }

    setEffectsVolume(volume) {
        this.effectsVolume = Math.max(0, Math.min(1, volume));
    }

    playBackgroundMusic() {
        if (!this.enabled || !this.backgroundMusic) return;
        
        try {
            this.backgroundMusic.currentTime = 0;
            const playPromise = this.backgroundMusic.play();
            
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    console.warn('Background music autoplay blocked:', error);
                });
            }
        } catch (error) {
            console.warn('Error playing background music:', error);
        }
    }

    stopBackgroundMusic() {
        if (this.backgroundMusic) {
            try {
                this.backgroundMusic.pause();
                this.backgroundMusic.currentTime = 0;
            } catch (error) {
                console.warn('Error stopping background music:', error);
            }
        }
    }

    pauseBackgroundMusic() {
        if (this.backgroundMusic) {
            try {
                this.backgroundMusic.pause();
            } catch (error) {
                console.warn('Error pausing background music:', error);
            }
        }
    }

    resumeBackgroundMusic() {
        if (!this.enabled || !this.backgroundMusic) return;
        
        try {
            const playPromise = this.backgroundMusic.play();
            
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    console.warn('Background music resume blocked:', error);
                });
            }
        } catch (error) {
            console.warn('Error resuming background music:', error);
        }
    }

    playSound(soundName, options = {}) {
        if (!this.enabled) return;
        
        const sound = this.sounds[soundName];
        if (!sound) {
            console.warn(`Sound not found: ${soundName}`);
            return;
        }

        try {
            const clone = sound.cloneNode();
            clone.volume = options.volume !== undefined ? 
                options.volume : this.effectsVolume;
            
            if (options.delay) {
                setTimeout(() => {
                    const playPromise = clone.play();
                    if (playPromise !== undefined) {
                        playPromise.catch(error => {
                            console.warn(`Error playing sound ${soundName}:`, error);
                        });
                    }
                }, options.delay);
            } else {
                const playPromise = clone.play();
                if (playPromise !== undefined) {
                    playPromise.catch(error => {
                        console.warn(`Error playing sound ${soundName}:`, error);
                    });
                }
            }

            clone.addEventListener('ended', () => {
                clone.remove();
            });

            return clone;
        } catch (error) {
            console.warn(`Error playing sound ${soundName}:`, error);
        }
    }

    playPickaxeHit(hitNumber) {
        if (!this.enabled) return;
        
        const soundVariation = Math.min(3, Math.max(1, hitNumber));
        const soundName = `pickaxe-hit-${soundVariation}`;
        
        if (!this.sounds[soundName]) {
            this.playSound('pickaxe-hit-1');
        } else {
            this.playSound(soundName);
        }
    }

    playRockBreak() {
        this.playSound('rock-break');
    }

    playSuccess() {
        this.playSound('success');
    }

    stopAllSounds() {
        for (const sound of Object.values(this.sounds)) {
            if (sound && sound !== this.backgroundMusic) {
                try {
                    sound.pause();
                    sound.currentTime = 0;
                } catch (error) {
                    console.warn('Error stopping sound:', error);
                }
            }
        }
    }

    isLoaded() {
        return this.loaded;
    }

    hasErrors() {
        return this.loadingErrors.length > 0;
    }

    getLoadingErrors() {
        return this.loadingErrors;
    }
}

window.audioManager = new AudioManager();