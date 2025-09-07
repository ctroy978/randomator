class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        this.ctx.imageSmoothingEnabled = false;
        this.ctx.mozImageSmoothingEnabled = false;
        this.ctx.webkitImageSmoothingEnabled = false;
        this.ctx.msImageSmoothingEnabled = false;
        
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        
        this.state = 'MENU';
        this.lastTime = 0;
        this.deltaTime = 0;
        
        this.buttons = [];
        this.textRenderer = new UIComponents.TextRenderer();
        this.loadingIndicator = null;
        this.progressBar = null;
        
        this.selectedClass = null;
        this.selectedStudent = null;
        
        this.pitRunnerAnimation = new AnimationSystem.PitRunnerAnimation(this.canvas);
        
        this.settings = {
            animationSpeed: 1,
            particlesEnabled: true,
            soundEnabled: true
        };
        
        this.setupEventListeners();
        this.init();
    }

    async init() {
        this.state = 'LOADING';
        this.loadingIndicator = new UIComponents.LoadingIndicator(this.width / 2, this.height / 2);
        
        try {
            await dataManager.preloadAllData();
            await audioManager.loadSounds();
            audioManager.setEnabled(this.settings.soundEnabled);
            await this.populateClassSelector();
            this.state = 'MENU';
            this.animate();
        } catch (error) {
            console.error('Failed to initialize game:', error);
            this.showError('Failed to load game data. Please refresh the page.');
        }
    }

    async populateClassSelector() {
        const classes = dataManager.getClasses();
        const selectElement = document.getElementById('classSelect');
        
        selectElement.innerHTML = '<option value="">-- Select a Class --</option>';
        
        for (const className of classes) {
            const option = document.createElement('option');
            option.value = className;
            option.textContent = className;
            selectElement.appendChild(option);
        }
    }

    setupEventListeners() {
        document.getElementById('classSelect').addEventListener('change', (e) => {
            this.selectedClass = e.target.value;
            document.getElementById('selectBtn').disabled = !this.selectedClass;
        });
        
        document.getElementById('selectBtn').addEventListener('click', () => {
            this.startSelection();
        });
        
        document.getElementById('skipBtn').addEventListener('click', () => {
            this.pitRunnerAnimation.skip();
        });
        
        document.getElementById('selectAnotherBtn').addEventListener('click', () => {
            this.resetForNewSelection();
        });
        
        document.getElementById('settingsBtn').addEventListener('click', () => {
            const panel = document.getElementById('settingsPanel');
            panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
        });
        
        document.getElementById('speedSlider').addEventListener('input', (e) => {
            this.settings.animationSpeed = parseFloat(e.target.value);
            document.getElementById('speedValue').textContent = `${this.settings.animationSpeed}x`;
        });
        
        document.getElementById('particlesToggle').addEventListener('change', (e) => {
            this.settings.particlesEnabled = e.target.checked;
        });
        
        document.getElementById('soundToggle').addEventListener('change', (e) => {
            this.settings.soundEnabled = e.target.checked;
            audioManager.setEnabled(this.settings.soundEnabled);
            
            const volumeControls = document.getElementById('volumeControls');
            const effectsControls = document.getElementById('effectsControls');
            volumeControls.style.display = e.target.checked ? 'block' : 'none';
            effectsControls.style.display = e.target.checked ? 'block' : 'none';
        });
        
        document.getElementById('musicVolume').addEventListener('input', (e) => {
            const volume = parseFloat(e.target.value);
            audioManager.setMusicVolume(volume);
            document.getElementById('musicVolumeValue').textContent = `${Math.round(volume * 100)}%`;
        });
        
        document.getElementById('effectsVolume').addEventListener('input', (e) => {
            const volume = parseFloat(e.target.value);
            audioManager.setEffectsVolume(volume);
            document.getElementById('effectsVolumeValue').textContent = `${Math.round(volume * 100)}%`;
        });
    }

    startSelection() {
        if (!this.selectedClass) return;
        
        this.selectedStudent = dataManager.getRandomStudent(this.selectedClass);
        
        if (!this.selectedStudent) {
            this.showError('No students found in selected class.');
            return;
        }
        
        this.state = 'ANIMATING';
        
        document.getElementById('controls').style.display = 'none';
        document.getElementById('skipBtn').style.display = 'block';
        
        this.pitRunnerAnimation.start(this.selectedStudent, {
            speed: this.settings.animationSpeed,
            particlesEnabled: this.settings.particlesEnabled
        });
    }

    resetForNewSelection() {
        this.state = 'MENU';
        this.selectedStudent = null;
        
        document.getElementById('controls').style.display = 'flex';
        document.getElementById('skipBtn').style.display = 'none';
        document.getElementById('resultDisplay').style.display = 'none';
        
        audioManager.stopBackgroundMusic();
    }

    showError(message) {
        this.state = 'ERROR';
        console.error(message);
    }

    update(deltaTime) {
        switch (this.state) {
            case 'LOADING':
                if (this.loadingIndicator) {
                    this.loadingIndicator.update(deltaTime);
                }
                break;
                
            case 'MENU':
                break;
                
            case 'ANIMATING':
                this.pitRunnerAnimation.update(deltaTime);
                
                if (this.pitRunnerAnimation.isComplete()) {
                    this.state = 'RESULT';
                    this.showResult();
                }
                break;
                
            case 'RESULT':
                break;
        }
    }

    showResult() {
        document.getElementById('skipBtn').style.display = 'none';
        document.getElementById('resultDisplay').style.display = 'block';
        document.getElementById('resultName').textContent = this.selectedStudent;
        
        audioManager.stopBackgroundMusic();
    }

    draw() {
        this.ctx.fillStyle = '#000033';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        switch (this.state) {
            case 'LOADING':
                if (this.loadingIndicator) {
                    this.loadingIndicator.draw(this.ctx);
                }
                break;
                
            case 'MENU':
                this.drawMenuState();
                break;
                
            case 'ANIMATING':
                this.pitRunnerAnimation.draw();
                break;
                
            case 'RESULT':
                this.pitRunnerAnimation.draw();
                break;
                
            case 'ERROR':
                this.drawErrorState();
                break;
        }
    }

    drawMenuState() {
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.height);
        gradient.addColorStop(0, '#000033');
        gradient.addColorStop(1, '#000066');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        this.textRenderer.drawGlowingText(
            this.ctx,
            'PIT RUNNER',
            this.width / 2,
            150,
            36,
            '#00ff00',
            1
        );
        
        this.textRenderer.drawTextWithShadow(
            this.ctx,
            'Student Selector',
            this.width / 2,
            200,
            18,
            '#88ff88',
            '#004400',
            'center'
        );
        
        this.drawPixelRunner();
        
        this.textRenderer.drawText(
            this.ctx,
            'Select a class and click START RUN',
            this.width / 2,
            350,
            10,
            '#aaffaa',
            'center'
        );
    }

    drawPixelRunner() {
        const x = this.width / 2 - 50;
        const y = 250;
        const pixelSize = 4;
        
        this.ctx.fillStyle = '#654321';
        this.ctx.fillRect(x + 12 * pixelSize, y + 4 * pixelSize, 6 * pixelSize, 4 * pixelSize);
        
        this.ctx.fillStyle = '#fdbcb4';
        this.ctx.fillRect(x + 12 * pixelSize, y + 8 * pixelSize, 6 * pixelSize, 5 * pixelSize);
        
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(x + 14 * pixelSize, y + 9 * pixelSize, pixelSize, pixelSize);
        this.ctx.fillRect(x + 16 * pixelSize, y + 9 * pixelSize, pixelSize, pixelSize);
        
        this.ctx.fillStyle = '#ff0000';
        this.ctx.fillRect(x + 11 * pixelSize, y + 13 * pixelSize, 8 * pixelSize, 6 * pixelSize);
        
        this.ctx.fillStyle = '#fdbcb4';
        this.ctx.fillRect(x + 9 * pixelSize, y + 14 * pixelSize, 2 * pixelSize, 4 * pixelSize);
        this.ctx.fillRect(x + 19 * pixelSize, y + 14 * pixelSize, 2 * pixelSize, 4 * pixelSize);
        
        this.ctx.fillStyle = '#0000ff';
        this.ctx.fillRect(x + 12 * pixelSize, y + 19 * pixelSize, 6 * pixelSize, 5 * pixelSize);
        this.ctx.fillRect(x + 12 * pixelSize, y + 24 * pixelSize, 2 * pixelSize, 4 * pixelSize);
        this.ctx.fillRect(x + 16 * pixelSize, y + 24 * pixelSize, 2 * pixelSize, 4 * pixelSize);
        
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(x + 11 * pixelSize, y + 28 * pixelSize, 3 * pixelSize, 2 * pixelSize);
        this.ctx.fillRect(x + 16 * pixelSize, y + 28 * pixelSize, 3 * pixelSize, 2 * pixelSize);
        
        this.ctx.fillStyle = '#8B4513';
        this.ctx.fillRect(x + 20 * pixelSize, y + 12 * pixelSize, 8 * pixelSize, 8 * pixelSize);
        this.ctx.strokeStyle = '#654321';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(x + 20 * pixelSize, y + 12 * pixelSize, 8 * pixelSize, 8 * pixelSize);
    }

    drawErrorState() {
        this.textRenderer.drawTextWithShadow(
            this.ctx,
            'ERROR',
            this.width / 2,
            this.height / 2 - 20,
            24,
            '#ff0000',
            '#880000',
            'center'
        );
        
        this.textRenderer.drawText(
            this.ctx,
            'Failed to load data',
            this.width / 2,
            this.height / 2 + 20,
            12,
            '#ffaaaa',
            'center'
        );
    }

    animate(currentTime = 0) {
        this.deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        this.update(this.deltaTime);
        this.draw();
        
        requestAnimationFrame((time) => this.animate(time));
    }
}

window.addEventListener('DOMContentLoaded', () => {
    const game = new Game();
});