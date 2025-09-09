class AudioManager {
    constructor() {
        this.enabled = true;
        this.volume = 0.5;
        this.sounds = {};
        this.audioContext = null;
        this.initialized = false;
    }

    async init() {
        if (this.initialized) return;
        
        try {
            // Create audio context on user interaction
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.initialized = true;
            
            // Create synthetic sounds
            this.createSounds();
        } catch (error) {
            console.warn('Audio initialization failed:', error);
            this.enabled = false;
        }
    }

    createSounds() {
        // We'll create simple synthetic sounds using Web Audio API
        // This avoids the need for external audio files
    }

    setEnabled(enabled) {
        this.enabled = enabled;
    }

    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
    }

    async playTease() {
        if (!this.enabled || !this.initialized) return;
        
        try {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            // Create a spooky "whoosh" sound for the tease
            oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(200, this.audioContext.currentTime + 0.3);
            
            gainNode.gain.setValueAtTime(this.volume * 0.3, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
            
            oscillator.type = 'sine';
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + 0.3);
        } catch (error) {
            console.warn('Error playing tease sound:', error);
        }
    }

    async playSuccess() {
        if (!this.enabled || !this.initialized) return;
        
        try {
            // Create a celebratory sound sequence
            const notes = [523.25, 659.25, 783.99, 1046.5]; // C, E, G, High C
            
            notes.forEach((freq, index) => {
                const oscillator = this.audioContext.createOscillator();
                const gainNode = this.audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(this.audioContext.destination);
                
                const startTime = this.audioContext.currentTime + index * 0.1;
                
                oscillator.frequency.setValueAtTime(freq, startTime);
                gainNode.gain.setValueAtTime(this.volume * 0.3, startTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.5);
                
                oscillator.type = 'sine';
                oscillator.start(startTime);
                oscillator.stop(startTime + 0.5);
            });
            
            // Add a second layer with triangle wave for richness
            notes.forEach((freq, index) => {
                const oscillator = this.audioContext.createOscillator();
                const gainNode = this.audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(this.audioContext.destination);
                
                const startTime = this.audioContext.currentTime + index * 0.1;
                
                oscillator.frequency.setValueAtTime(freq * 2, startTime);
                gainNode.gain.setValueAtTime(this.volume * 0.1, startTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.5);
                
                oscillator.type = 'triangle';
                oscillator.start(startTime);
                oscillator.stop(startTime + 0.5);
            });
        } catch (error) {
            console.warn('Error playing success sound:', error);
        }
    }

    async playGhostAppear() {
        if (!this.enabled || !this.initialized) return;
        
        try {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            const filter = this.audioContext.createBiquadFilter();
            
            oscillator.connect(filter);
            filter.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            // Spooky ghost appearance sound
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(100, this.audioContext.currentTime);
            filter.frequency.exponentialRampToValueAtTime(2000, this.audioContext.currentTime + 1);
            
            oscillator.frequency.setValueAtTime(50, this.audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(150, this.audioContext.currentTime + 1);
            
            gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(this.volume * 0.4, this.audioContext.currentTime + 0.5);
            gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + 1);
            
            oscillator.type = 'sawtooth';
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + 1);
        } catch (error) {
            console.warn('Error playing ghost appear sound:', error);
        }
    }

    async playButtonClick() {
        if (!this.enabled || !this.initialized) return;
        
        try {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.frequency.setValueAtTime(600, this.audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(400, this.audioContext.currentTime + 0.05);
            
            gainNode.gain.setValueAtTime(this.volume * 0.2, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.05);
            
            oscillator.type = 'square';
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + 0.05);
        } catch (error) {
            console.warn('Error playing button click sound:', error);
        }
    }

    async loadSounds() {
        // Don't initialize here - wait for user interaction
        // Audio context will be created when needed
        return Promise.resolve();
    }
}

const audioManager = new AudioManager();