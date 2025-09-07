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
        
        this.selectedSquadron = null;
        this.selectedPilot = null;
        
        this.missionAnimation = new AnimationSystem.MissionAnimation(this.canvas);
        
        this.settings = {
            animationSpeed: 1,
            effectsEnabled: true,
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
            await this.populateSquadronSelector();
            this.state = 'MENU';
            this.draw();
        } catch (error) {
            console.error('Failed to initialize game:', error);
            this.showError('Failed to load mission data. Please refresh the page.');
        }
    }

    setupUI() {
        this.missionButton = new UIComponents.Button(
            this.width / 2 - 120,
            this.height - 150,
            240,
            50,
            'COMMENCE MISSION',
            () => this.startMission()
        );
        this.missionButton.setEnabled(false);
        this.buttons.push(this.missionButton);

        this.menuButton = new UIComponents.Button(
            this.width / 2 - 100,
            this.height - 80,
            200,
            40,
            'RETURN TO BASE',
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
        
        document.getElementById('squadronSelect').addEventListener('change', (e) => {
            this.selectedSquadron = e.target.value;
            this.missionButton.setEnabled(!!this.selectedSquadron);
            document.getElementById('missionBtn').disabled = !this.selectedSquadron;
        });
        
        document.getElementById('missionBtn').addEventListener('click', () => {
            this.startMission();
        });
        
        document.getElementById('skipBtn').addEventListener('click', () => {
            this.missionAnimation.skip();
        });
        
        document.getElementById('nextMissionBtn').addEventListener('click', () => {
            this.returnToMenu();
        });
        
        document.getElementById('settingsBtn').addEventListener('click', () => {
            const panel = document.getElementById('settingsPanel');
            panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
        });
        
        document.getElementById('speedSlider').addEventListener('input', (e) => {
            this.settings.animationSpeed = parseFloat(e.target.value);
            document.getElementById('speedValue').textContent = `${this.settings.animationSpeed}x`;
            this.missionAnimation.setSpeedMultiplier(this.settings.animationSpeed);
        });
        
        document.getElementById('effectsToggle').addEventListener('change', (e) => {
            this.settings.effectsEnabled = e.target.checked;
            this.missionAnimation.setEffectsEnabled(this.settings.effectsEnabled);
        });
        
        document.getElementById('soundToggle').addEventListener('change', (e) => {
            this.settings.soundEnabled = e.target.checked;
            audioManager.setEnabled(this.settings.soundEnabled);
            
            const volumeControls = document.getElementById('volumeControls');
            const effectsControls = document.getElementById('effectsVolumeControls');
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
            if (e.key === ' ' && this.state === 'MENU' && this.selectedSquadron) {
                e.preventDefault();
                this.startMission();
            } else if (e.key === 'Escape' && this.state === 'ANIMATING') {
                this.missionAnimation.skip();
            }
        });
    }

    async populateSquadronSelector() {
        const select = document.getElementById('squadronSelect');
        select.innerHTML = '<option value="">Choose a squadron...</option>';
        
        try {
            const squadrons = await dataManager.getSquadrons();
            
            for (const squadronName of squadrons) {
                const option = document.createElement('option');
                option.value = squadronName;
                option.textContent = squadronName;
                select.appendChild(option);
            }
        } catch (error) {
            console.error('Failed to load squadrons:', error);
            select.innerHTML = '<option value="">Error loading squadrons</option>';
        }
    }

    async startMission() {
        if (!this.selectedSquadron) return;
        
        this.state = 'SELECTING';
        document.getElementById('controls').style.display = 'none';
        document.getElementById('skipBtn').style.display = 'block';
        
        window.audioManager.playBackgroundMusic();
        
        try {
            this.selectedPilot = await dataManager.getRandomPilot(this.selectedSquadron);
            
            this.state = 'ANIMATING';
            this.lastTime = 0;
            this.deltaTime = 0;
            this.missionAnimation.start(this.selectedPilot, () => {
                this.onAnimationComplete();
            });
            
            this.animate();
        } catch (error) {
            console.error('Failed to select pilot:', error);
            this.showError('Failed to select pilot. Please try again.');
            this.returnToMenu();
        }
    }

    onAnimationComplete() {
        this.state = 'DISPLAYING_RESULT';
        document.getElementById('skipBtn').style.display = 'none';
        document.getElementById('resultName').textContent = this.selectedPilot;
        document.getElementById('resultDisplay').style.display = 'block';
        
        window.audioManager.playVictory();
    }

    returnToMenu() {
        this.state = 'MENU';
        this.selectedPilot = null;
        document.getElementById('controls').style.display = 'flex';
        document.getElementById('resultDisplay').style.display = 'none';
        document.getElementById('skipBtn').style.display = 'none';
        this.missionButton.setEnabled(!!this.selectedSquadron);
        this.menuButton.setVisible(false);
        
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
        
        this.missionAnimation.update(this.deltaTime);
        this.missionAnimation.draw();
        
        requestAnimationFrame((time) => this.animate(time));
    }

    draw() {
        this.ctx.clearRect(0, 0, this.width, this.height);
        
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.height);
        gradient.addColorStop(0, '#87CEEB');
        gradient.addColorStop(0.5, '#98D8E8');
        gradient.addColorStop(1, '#B0E0E6');
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
            'LOADING MISSION DATA...',
            this.width / 2,
            this.height / 2 + 60,
            {
                size: 16,
                color: '#2d3436',
                align: 'center',
                shadow: true,
                shadowColor: '#ffffff',
                font: '"Courier Prime", monospace'
            }
        );
        
        requestAnimationFrame(() => this.draw());
    }

    drawMenu() {
        this.textRenderer.drawText(
            this.ctx,
            'OPERATION',
            this.width / 2,
            80,
            {
                size: 36,
                color: '#2d3436',
                align: 'center',
                shadow: true,
                shadowColor: '#ffffff',
                shadowOffset: 2,
                font: '"Bebas Neue", sans-serif'
            }
        );
        
        this.textRenderer.drawText(
            this.ctx,
            'STUDENT SELECTION',
            this.width / 2,
            120,
            {
                size: 48,
                color: '#3d5a3d',
                align: 'center',
                shadow: true,
                shadowColor: '#000000',
                shadowOffset: 3,
                font: '"Bebas Neue", sans-serif'
            }
        );
        
        this.drawAirfield();
        
        for (const button of this.buttons) {
            button.draw(this.ctx);
        }
        
        if (!this.selectedSquadron) {
            this.textRenderer.drawText(
                this.ctx,
                'Select a squadron to begin mission',
                this.width / 2,
                this.height - 200,
                {
                    size: 12,
                    color: '#2d3436',
                    align: 'center',
                    font: '"Courier Prime", monospace'
                }
            );
        }
    }

    drawSelecting() {
        this.textRenderer.drawText(
            this.ctx,
            'SCRAMBLING PILOTS...',
            this.width / 2,
            this.height / 2,
            {
                size: 24,
                color: '#3d5a3d',
                align: 'center',
                shadow: true,
                font: '"Bebas Neue", sans-serif'
            }
        );
        
        requestAnimationFrame(() => this.draw());
    }

    drawAirfield() {
        this.ctx.fillStyle = '#3d5a3d';
        this.ctx.fillRect(0, this.height - 150, this.width, 150);
        
        this.ctx.fillStyle = '#2d4a2d';
        this.ctx.fillRect(0, this.height - 145, this.width, 5);
        
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([20, 10]);
        this.ctx.beginPath();
        this.ctx.moveTo(100, this.height - 75);
        this.ctx.lineTo(this.width - 100, this.height - 75);
        this.ctx.stroke();
        this.ctx.setLineDash([]);
        
        const hangarX = this.width / 2 - 60;
        const hangarY = this.height - 140;
        
        this.ctx.fillStyle = '#4a5568';
        this.ctx.fillRect(hangarX, hangarY, 120, 80);
        
        this.ctx.fillStyle = '#2d3748';
        this.ctx.beginPath();
        this.ctx.moveTo(hangarX - 10, hangarY);
        this.ctx.lineTo(hangarX + 60, hangarY - 30);
        this.ctx.lineTo(hangarX + 130, hangarY);
        this.ctx.closePath();
        this.ctx.fill();
        
        this.ctx.fillStyle = '#1a202c';
        this.ctx.fillRect(hangarX + 40, hangarY + 30, 40, 50);
    }

    showError(message) {
        this.state = 'ERROR';
        this.ctx.clearRect(0, 0, this.width, this.height);
        
        this.ctx.fillStyle = '#2d3436';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        this.textRenderer.drawText(
            this.ctx,
            'MISSION FAILED',
            this.width / 2,
            this.height / 2 - 40,
            {
                size: 28,
                color: '#e53e3e',
                align: 'center',
                shadow: true,
                font: '"Bebas Neue", sans-serif'
            }
        );
        
        this.textRenderer.drawText(
            this.ctx,
            message,
            this.width / 2,
            this.height / 2 + 20,
            {
                size: 14,
                color: '#ffffff',
                align: 'center',
                maxWidth: this.width - 100,
                font: '"Courier Prime", monospace'
            }
        );
    }
}

window.addEventListener('load', () => {
    const game = new Game();
});