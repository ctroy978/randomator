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
        
        this.miningAnimation = new AnimationSystem.MiningAnimation(this.canvas);
        
        this.settings = {
            animationSpeed: 1,
            particlesEnabled: true,
            soundEnabled: true
        };
        
        this.setupUI();
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
            this.draw();
        } catch (error) {
            console.error('Failed to initialize game:', error);
            this.showError('Failed to load game data. Please refresh the page.');
        }
    }

    setupUI() {
        this.selectButton = new UIComponents.Button(
            this.width / 2 - 100,
            this.height - 150,
            200,
            50,
            'SELECT',
            () => this.startSelection()
        );
        this.selectButton.setEnabled(false);
        this.buttons.push(this.selectButton);

        this.menuButton = new UIComponents.Button(
            this.width / 2 - 80,
            this.height - 80,
            160,
            40,
            'MENU',
            () => this.returnToMenu()
        );
        this.menuButton.setVisible(false);
        this.buttons.push(this.menuButton);
    }

    setupEventListeners() {
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.canvas.addEventListener('mouseup', (e) => this.handleMouseUp(e));
        this.canvas.addEventListener('touchstart', (e) => this.handleTouchStart(e));
        this.canvas.addEventListener('touchend', (e) => this.handleTouchEnd(e));
        
        document.getElementById('classSelect').addEventListener('change', (e) => {
            this.selectedClass = e.target.value;
            this.selectButton.setEnabled(!!this.selectedClass);
            document.getElementById('selectBtn').disabled = !this.selectedClass;
        });
        
        document.getElementById('selectBtn').addEventListener('click', () => {
            this.startSelection();
        });
        
        document.getElementById('skipBtn').addEventListener('click', () => {
            this.miningAnimation.skip();
        });
        
        document.getElementById('selectAnotherBtn').addEventListener('click', () => {
            this.returnToMenu();
        });
        
        document.getElementById('settingsBtn').addEventListener('click', () => {
            const panel = document.getElementById('settingsPanel');
            panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
        });
        
        document.getElementById('speedSlider').addEventListener('input', (e) => {
            this.settings.animationSpeed = parseFloat(e.target.value);
            document.getElementById('speedValue').textContent = `${this.settings.animationSpeed}x`;
            this.miningAnimation.setSpeedMultiplier(this.settings.animationSpeed);
        });
        
        document.getElementById('particlesToggle').addEventListener('change', (e) => {
            this.settings.particlesEnabled = e.target.checked;
            this.miningAnimation.setParticlesEnabled(this.settings.particlesEnabled);
        });
        
        document.getElementById('soundToggle').addEventListener('change', (e) => {
            this.settings.soundEnabled = e.target.checked;
            audioManager.setEnabled(this.settings.soundEnabled);
            
            const volumeControls = document.getElementById('volumeControls');
            const effectsControls = document.getElementById('effectsControls');
            if (this.settings.soundEnabled) {
                volumeControls.style.display = 'block';
                effectsControls.style.display = 'block';
            } else {
                volumeControls.style.display = 'none';
                effectsControls.style.display = 'none';
            }
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
        
        document.addEventListener('keydown', (e) => {
            if (e.key === ' ' && this.state === 'MENU' && this.selectedClass) {
                e.preventDefault();
                this.startSelection();
            } else if (e.key === 'Escape' && this.state === 'ANIMATING') {
                this.miningAnimation.skip();
            }
        });
    }

    async populateClassSelector() {
        const select = document.getElementById('classSelect');
        select.innerHTML = '<option value="">Choose a class...</option>';
        
        try {
            const classes = await dataManager.getClasses();
            
            for (const className of classes) {
                const option = document.createElement('option');
                option.value = className;
                option.textContent = className;
                select.appendChild(option);
            }
        } catch (error) {
            console.error('Failed to load classes:', error);
            select.innerHTML = '<option value="">Error loading classes</option>';
        }
    }

    async startSelection() {
        if (!this.selectedClass) return;
        
        this.state = 'SELECTING';
        document.getElementById('controls').style.display = 'none';
        document.getElementById('skipBtn').style.display = 'block';
        
        // Start background music when game begins
        window.audioManager.playBackgroundMusic();
        
        try {
            this.selectedStudent = await dataManager.getRandomStudent(this.selectedClass);
            
            this.state = 'ANIMATING';
            this.lastTime = 0;
            this.deltaTime = 0;
            this.miningAnimation.start(this.selectedStudent, () => {
                this.onAnimationComplete();
            });
            
            this.animate();
        } catch (error) {
            console.error('Failed to select student:', error);
            this.showError('Failed to select student. Please try again.');
            this.returnToMenu();
        }
    }

    onAnimationComplete() {
        this.state = 'DISPLAYING_RESULT';
        document.getElementById('skipBtn').style.display = 'none';
        document.getElementById('resultName').textContent = this.selectedStudent;
        document.getElementById('resultDisplay').style.display = 'block';
    }

    returnToMenu() {
        this.state = 'MENU';
        this.selectedStudent = null;
        document.getElementById('controls').style.display = 'flex';
        document.getElementById('resultDisplay').style.display = 'none';
        document.getElementById('skipBtn').style.display = 'none';
        this.selectButton.setEnabled(!!this.selectedClass);
        this.menuButton.setVisible(false);
        
        // Stop background music when returning to menu
        window.audioManager.stopBackgroundMusic();
        
        this.draw();
    }

    handleMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = (e.clientX - rect.left) * (this.canvas.width / rect.width);
        const y = (e.clientY - rect.top) * (this.canvas.height / rect.height);
        
        let needsRedraw = false;
        for (const button of this.buttons) {
            if (button.handleMouseMove(x, y)) {
                needsRedraw = true;
            }
        }
        
        if (needsRedraw && this.state === 'MENU') {
            this.draw();
        }
    }

    handleMouseDown(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = (e.clientX - rect.left) * (this.canvas.width / rect.width);
        const y = (e.clientY - rect.top) * (this.canvas.height / rect.height);
        
        for (const button of this.buttons) {
            button.handleMouseDown(x, y);
        }
        
        if (this.state === 'MENU') {
            this.draw();
        }
    }

    handleMouseUp(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = (e.clientX - rect.left) * (this.canvas.width / rect.width);
        const y = (e.clientY - rect.top) * (this.canvas.height / rect.height);
        
        for (const button of this.buttons) {
            button.handleMouseUp(x, y);
        }
        
        if (this.state === 'MENU') {
            this.draw();
        }
    }

    handleTouchStart(e) {
        e.preventDefault();
        const touch = e.touches[0];
        const mouseEvent = new MouseEvent('mousedown', {
            clientX: touch.clientX,
            clientY: touch.clientY
        });
        this.canvas.dispatchEvent(mouseEvent);
    }

    handleTouchEnd(e) {
        e.preventDefault();
        const mouseEvent = new MouseEvent('mouseup', {});
        this.canvas.dispatchEvent(mouseEvent);
    }

    animate(currentTime = 0) {
        if (this.state !== 'ANIMATING') return;
        
        this.deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        if (this.deltaTime > 100) this.deltaTime = 100;
        
        this.miningAnimation.update(this.deltaTime);
        this.miningAnimation.draw();
        
        requestAnimationFrame((time) => this.animate(time));
    }

    draw() {
        this.ctx.clearRect(0, 0, this.width, this.height);
        
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.height);
        gradient.addColorStop(0, '#1a1a2e');
        gradient.addColorStop(1, '#16213e');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        switch (this.state) {
            case 'LOADING':
                this.drawLoading();
                break;
            case 'MENU':
                this.drawMenu();
                break;
            case 'SELECTING':
                this.drawSelecting();
                break;
        }
    }

    drawLoading() {
        if (this.loadingIndicator) {
            this.loadingIndicator.update(16);
            this.loadingIndicator.draw(this.ctx);
        }
        
        this.textRenderer.drawText(
            this.ctx,
            'LOADING...',
            this.width / 2,
            this.height / 2 + 60,
            {
                size: 16,
                color: '#ffd700',
                align: 'center',
                shadow: true
            }
        );
        
        requestAnimationFrame(() => this.draw());
    }

    drawMenu() {
        this.textRenderer.drawText(
            this.ctx,
            'STUDENT SELECTOR',
            this.width / 2,
            100,
            {
                size: 28,
                color: '#ffd700',
                align: 'center',
                shadow: true,
                shadowColor: '#ff6b6b',
                shadowOffset: 3
            }
        );
        
        this.textRenderer.drawText(
            this.ctx,
            'MINING ADVENTURE',
            this.width / 2,
            140,
            {
                size: 20,
                color: '#ff6b6b',
                align: 'center',
                shadow: true
            }
        );
        
        this.drawMountains();
        this.drawGround();
        
        for (const button of this.buttons) {
            button.draw(this.ctx);
        }
        
        if (!this.selectedClass) {
            this.textRenderer.drawText(
                this.ctx,
                'Select a class to begin',
                this.width / 2,
                this.height - 200,
                {
                    size: 12,
                    color: '#a0a0a0',
                    align: 'center'
                }
            );
        }
    }

    drawSelecting() {
        this.textRenderer.drawText(
            this.ctx,
            'SELECTING STUDENT...',
            this.width / 2,
            this.height / 2,
            {
                size: 20,
                color: '#ffd700',
                align: 'center',
                shadow: true,
                typewriter: true,
                typewriterIndex: Math.floor((Date.now() % 2000) / 100)
            }
        );
        
        requestAnimationFrame(() => this.draw());
    }

    drawMountains() {
        const mountains = [
            { x: 100, height: 200, width: 200, color: '#2c3440' },
            { x: 250, height: 250, width: 250, color: '#374151' },
            { x: 500, height: 180, width: 200, color: '#2c3440' },
            { x: 650, height: 220, width: 220, color: '#374151' }
        ];
        
        for (const mountain of mountains) {
            this.ctx.fillStyle = mountain.color;
            this.ctx.beginPath();
            this.ctx.moveTo(mountain.x - mountain.width / 2, this.height - 100);
            this.ctx.lineTo(mountain.x, this.height - 100 - mountain.height);
            this.ctx.lineTo(mountain.x + mountain.width / 2, this.height - 100);
            this.ctx.closePath();
            this.ctx.fill();
            
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
            this.ctx.beginPath();
            this.ctx.moveTo(mountain.x - mountain.width / 6, this.height - 100 - mountain.height * 0.7);
            this.ctx.lineTo(mountain.x, this.height - 100 - mountain.height);
            this.ctx.lineTo(mountain.x + mountain.width / 6, this.height - 100 - mountain.height * 0.7);
            this.ctx.closePath();
            this.ctx.fill();
        }
    }

    drawGround() {
        this.ctx.fillStyle = '#3d4758';
        this.ctx.fillRect(0, this.height - 100, this.width, 100);
        
        for (let i = 0; i < this.width; i += 40) {
            this.ctx.fillStyle = '#2c3440';
            this.ctx.fillRect(i, this.height - 100, 2, 100);
        }
        
        for (let i = 0; i < 10; i++) {
            const x = Math.random() * this.width;
            const y = this.height - 100 + Math.random() * 100;
            const size = Math.random() * 10 + 5;
            
            this.ctx.fillStyle = '#4b5563';
            this.ctx.fillRect(x, y, size, size);
        }
    }

    showError(message) {
        this.state = 'ERROR';
        this.ctx.clearRect(0, 0, this.width, this.height);
        
        this.ctx.fillStyle = '#1a1a2e';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        this.textRenderer.drawText(
            this.ctx,
            'ERROR',
            this.width / 2,
            this.height / 2 - 40,
            {
                size: 24,
                color: '#ff6b6b',
                align: 'center',
                shadow: true
            }
        );
        
        this.textRenderer.drawText(
            this.ctx,
            message,
            this.width / 2,
            this.height / 2 + 20,
            {
                size: 12,
                color: '#ffffff',
                align: 'center',
                maxWidth: this.width - 100
            }
        );
    }
}

window.addEventListener('load', () => {
    const game = new Game();
});