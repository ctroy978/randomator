class AudioManager {
    constructor() {
        this.sounds = {};
        this.enabled = true;
        this.volume = 0.5;
        this.loadSounds();
    }

    loadSounds() {
        const soundFiles = {
            bell: 'data:audio/wav;base64,UklGRgoBAABXQVZFZm10IBAAAAABAAEAQB0AAAB9AAACABAAZGF0YQYBAADz/xYAFgDz/',
            punch: 'data:audio/wav;base64,UklGRgoBAABXQVZFZm10IBAAAAABAAEAQB0AAAB9AAACABAAZGF0YQYBAADz/xYAFgDz/',
            hit: 'data:audio/wav;base64,UklGRgoBAABXQVZFZm10IBAAAAABAAEAQB0AAAB9AAACABAAZGF0YQYBAADz/xYAFgDz/',
            crowd: 'data:audio/wav;base64,UklGRgoBAABXQVZFZm10IBAAAAABAAEAQB0AAAB9AAACABAAZGF0YQYBAADz/xYAFgDz/',
            victory: 'data:audio/wav;base64,UklGRgoBAABXQVZFZm10IBAAAAABAAEAQB0AAAB9AAACABAAZGF0YQYBAADz/xYAFgDz/'
        };

        for (const [name, src] of Object.entries(soundFiles)) {
            const audio = new Audio();
            audio.src = src;
            audio.volume = this.volume;
            this.sounds[name] = audio;
        }
    }

    async play(soundName, options = {}) {
        if (!this.enabled) return;
        
        const sound = this.sounds[soundName];
        if (!sound) {
            console.warn(`Sound "${soundName}" not found`);
            return;
        }

        try {
            const audio = sound.cloneNode();
            audio.volume = options.volume || this.volume;
            
            if (options.loop) {
                audio.loop = true;
            }
            
            if (options.playbackRate) {
                audio.playbackRate = options.playbackRate;
            }
            
            await audio.play();
            
            if (options.duration) {
                setTimeout(() => {
                    audio.pause();
                    audio.currentTime = 0;
                }, options.duration);
            }
            
            return audio;
        } catch (error) {
            console.error('Error playing sound:', error);
        }
    }

    setEnabled(enabled) {
        this.enabled = enabled;
        if (!enabled) {
            this.stopAll();
        }
    }

    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
        for (const sound of Object.values(this.sounds)) {
            sound.volume = this.volume;
        }
    }

    stopAll() {
        for (const sound of Object.values(this.sounds)) {
            sound.pause();
            sound.currentTime = 0;
        }
    }

    playBell() {
        return this.play('bell', { volume: 0.7 });
    }

    playPunch() {
        return this.play('punch', { 
            volume: 0.4,
            playbackRate: 0.8 + Math.random() * 0.4
        });
    }

    playHit() {
        return this.play('hit', { 
            volume: 0.6,
            playbackRate: 0.9 + Math.random() * 0.2
        });
    }

    playCrowd() {
        return this.play('crowd', { 
            volume: 0.3,
            loop: true
        });
    }

    playVictory() {
        return this.play('victory', { volume: 0.8 });
    }
}

const audioManager = new AudioManager();