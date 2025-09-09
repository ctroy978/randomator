class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        
        this.state = 'MENU';
        this.lastTime = 0;
        this.deltaTime = 0;
        
        this.selectedClass = null;
        this.selectedStudent = null;
        
        this.animationSystem = new AnimationSystem(this.canvas);
        this.uiManager = new UIManager();
        this.textRenderer = new UIComponents.TextRenderer();
        this.loadingIndicator = null;
        
        this.settings = {
            animationSpeed: 1,
            effectsEnabled: true,
            soundEnabled: true
        };
        
        this.init();
    }

    async init() {
        this.state = 'LOADING';
        this.loadingIndicator = new UIComponents.LoadingIndicator(this.width / 2, this.height / 2);
        
        try {
            // Load data
            await dataManager.preloadAllData();
            
            // Initialize audio (will happen on first user interaction)
            await audioManager.loadSounds();
            audioManager.setEnabled(this.settings.soundEnabled);
            
            // Populate class selector
            const classes = await dataManager.getClasses();
            await this.uiManager.populateClassSelector(classes);
            
            // Add click listener to canvas for music initialization
            this.canvas.addEventListener('click', async () => {
                if (window.musicManager && musicManager.enabled && !musicManager.isPlaying) {
                    await musicManager.start();
                }
            }, { once: true });
            
            this.state = 'MENU';
            this.animate();
        } catch (error) {
            console.error('Failed to initialize game:', error);
            this.uiManager.showError('Failed to load class data. Please refresh the page.');
        }
    }

    handleClassSelection(className) {
        this.selectedClass = className;
        this.uiManager.setStartButtonEnabled(!!className);
    }

    async startSelection() {
        if (!this.selectedClass) return;
        
        this.state = 'SELECTING';
        
        // Initialize audio on user interaction
        if (!audioManager.initialized) {
            await audioManager.init();
        }
        
        // Start music if enabled and not already playing
        if (window.musicManager && !musicManager.isPlaying) {
            await musicManager.start();
        }
        
        // Play ghost appear sound
        audioManager.playGhostAppear();
        
        // Get all students and select the final one
        const allStudents = await dataManager.getStudentsForClass(this.selectedClass);
        this.selectedStudent = await dataManager.getRandomStudent(this.selectedClass);
        
        // Start the animation with all students and the selected one
        await this.animationSystem.startSelection(allStudents, this.selectedStudent);
        
        // Play dramatic stinger for final reveal
        if (window.musicManager && musicManager.enabled) {
            musicManager.playStinger();
        }
        
        // Show result
        this.state = 'RESULT';
        this.uiManager.showResult(this.selectedStudent);
    }

    reset() {
        this.state = 'MENU';
        this.selectedStudent = null;
        this.animationSystem.reset();
        this.uiManager.hideResult();
    }

    animate(currentTime = 0) {
        this.deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        // Clear canvas
        this.ctx.fillStyle = 'rgba(10, 0, 21, 1)';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // Update and draw based on state
        switch (this.state) {
            case 'LOADING':
                if (this.loadingIndicator) {
                    this.loadingIndicator.update(this.deltaTime);
                    this.loadingIndicator.draw(this.ctx);
                }
                break;
                
            case 'MENU':
                this.animationSystem.drawBackground();
                this.drawTitle();
                break;
                
            case 'SELECTING':
            case 'RESULT':
                this.animationSystem.update(this.deltaTime / this.settings.animationSpeed);
                this.animationSystem.draw();
                break;
        }
        
        requestAnimationFrame((time) => this.animate(time));
    }

    drawTitle() {
        const ctx = this.ctx;
        
        // Draw spooky title
        ctx.save();
        ctx.font = 'bold 48px Creepster';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#ff8c00';
        ctx.shadowColor = 'rgba(255, 140, 0, 0.5)';
        ctx.shadowBlur = 20;
        ctx.fillText('BOO!', this.width / 2, this.height / 2 - 50);
        
        ctx.font = '24px Griffy';
        ctx.fillStyle = '#dda0dd';
        ctx.shadowColor = 'rgba(221, 160, 221, 0.3)';
        ctx.shadowBlur = 10;
        ctx.fillText('Select a class and summon the ghost', this.width / 2, this.height / 2);
        ctx.fillText('to reveal a student!', this.width / 2, this.height / 2 + 30);
        ctx.restore();
        
        // Draw decorative elements
        this.drawBats();
    }

    drawBats() {
        const time = Date.now() * 0.001;
        
        // Draw flying bats
        for (let i = 0; i < 3; i++) {
            const x = (Math.sin(time + i * 2) + 1) * this.width / 2;
            const y = 50 + Math.sin(time * 2 + i) * 20;
            
            this.ctx.save();
            this.ctx.fillStyle = '#000';
            this.ctx.translate(x, y);
            
            // Bat body
            this.ctx.beginPath();
            this.ctx.ellipse(0, 0, 5, 3, 0, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Bat wings
            const wingFlap = Math.sin(time * 10 + i) * 0.3;
            
            // Left wing
            this.ctx.beginPath();
            this.ctx.moveTo(-5, 0);
            this.ctx.quadraticCurveTo(-15, -5 + wingFlap * 10, -20, 0);
            this.ctx.quadraticCurveTo(-15, 5 - wingFlap * 10, -5, 0);
            this.ctx.fill();
            
            // Right wing
            this.ctx.beginPath();
            this.ctx.moveTo(5, 0);
            this.ctx.quadraticCurveTo(15, -5 + wingFlap * 10, 20, 0);
            this.ctx.quadraticCurveTo(15, 5 - wingFlap * 10, 5, 0);
            this.ctx.fill();
            
            this.ctx.restore();
        }
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.game = new Game();
});