class UI {
    constructor() {
        this.classSelect = document.getElementById('classSelect');
        this.playerNameInput = document.getElementById('playerName');
        this.startBtn = document.getElementById('startBtn');
        this.nextBtn = document.getElementById('nextBtn');
        this.controls = document.getElementById('controls');
        this.resultDisplay = document.getElementById('resultDisplay');
        this.resultName = document.getElementById('resultName');
        this.settingsBtn = document.getElementById('settingsBtn');
        this.settingsPanel = document.getElementById('settingsPanel');
        this.speedSlider = document.getElementById('speedSlider');
        this.speedValue = document.getElementById('speedValue');
        this.effectsToggle = document.getElementById('effectsToggle');
        this.soundToggle = document.getElementById('soundToggle');
        this.soundVolume = document.getElementById('soundVolume');
        this.soundVolumeValue = document.getElementById('soundVolumeValue');
        this.volumeControls = document.getElementById('volumeControls');
        
        this.initializeEventListeners();
        this.loadSettings();
    }

    initializeEventListeners() {
        this.classSelect.addEventListener('change', () => {
            this.updateStartButton();
        });
        
        this.playerNameInput.addEventListener('input', () => {
            this.updateStartButton();
        });
        
        this.settingsBtn.addEventListener('click', () => {
            this.toggleSettings();
        });
        
        this.speedSlider.addEventListener('input', (e) => {
            this.speedValue.textContent = e.target.value + 'x';
            this.saveSettings();
        });
        
        this.effectsToggle.addEventListener('change', () => {
            this.saveSettings();
        });
        
        this.soundToggle.addEventListener('change', (e) => {
            this.volumeControls.style.display = e.target.checked ? 'flex' : 'none';
            audioManager.setEnabled(e.target.checked);
            this.saveSettings();
        });
        
        this.soundVolume.addEventListener('input', (e) => {
            const volume = parseFloat(e.target.value);
            this.soundVolumeValue.textContent = Math.round(volume * 100) + '%';
            audioManager.setVolume(volume);
            this.saveSettings();
        });
        
        document.addEventListener('click', (e) => {
            if (!this.settingsBtn.contains(e.target) && !this.settingsPanel.contains(e.target)) {
                this.settingsPanel.style.display = 'none';
            }
        });
    }

    async populateClasses() {
        try {
            const classes = await dataManager.getClasses();
            
            this.classSelect.innerHTML = '<option value="">Select a class...</option>';
            
            for (const className of classes) {
                const option = document.createElement('option');
                option.value = className;
                option.textContent = className;
                this.classSelect.appendChild(option);
            }
            
            this.updateStartButton();
        } catch (error) {
            console.error('Error populating classes:', error);
            this.classSelect.innerHTML = '<option value="">Error loading classes</option>';
        }
    }

    updateStartButton() {
        const hasClass = this.classSelect.value !== '';
        const hasName = this.playerNameInput.value.trim() !== '';
        this.startBtn.disabled = !hasClass || !hasName;
    }

    showControls() {
        this.controls.style.display = 'flex';
        this.resultDisplay.style.display = 'none';
    }

    hideControls() {
        this.controls.style.display = 'none';
    }

    showResult(winnerName) {
        this.resultName.textContent = winnerName;
        this.resultDisplay.style.display = 'block';
    }

    hideResult() {
        this.resultDisplay.style.display = 'none';
    }

    getSelectedClass() {
        return this.classSelect.value;
    }

    getPlayerName() {
        return this.playerNameInput.value.trim();
    }

    getAnimationSpeed() {
        return parseFloat(this.speedSlider.value);
    }

    areEffectsEnabled() {
        return this.effectsToggle.checked;
    }

    isSoundEnabled() {
        return this.soundToggle.checked;
    }

    toggleSettings() {
        this.settingsPanel.style.display = 
            this.settingsPanel.style.display === 'none' ? 'block' : 'none';
    }

    saveSettings() {
        const settings = {
            animationSpeed: this.speedSlider.value,
            effectsEnabled: this.effectsToggle.checked,
            soundEnabled: this.soundToggle.checked,
            soundVolume: this.soundVolume.value
        };
        
        localStorage.setItem('boxingGameSettings', JSON.stringify(settings));
    }

    loadSettings() {
        const savedSettings = localStorage.getItem('boxingGameSettings');
        
        if (savedSettings) {
            try {
                const settings = JSON.parse(savedSettings);
                
                this.speedSlider.value = settings.animationSpeed || 1;
                this.speedValue.textContent = this.speedSlider.value + 'x';
                
                this.effectsToggle.checked = settings.effectsEnabled !== false;
                this.soundToggle.checked = settings.soundEnabled !== false;
                
                this.soundVolume.value = settings.soundVolume || 0.5;
                this.soundVolumeValue.textContent = Math.round(this.soundVolume.value * 100) + '%';
                
                audioManager.setEnabled(this.soundToggle.checked);
                audioManager.setVolume(parseFloat(this.soundVolume.value));
                
                this.volumeControls.style.display = this.soundToggle.checked ? 'flex' : 'none';
            } catch (error) {
                console.error('Error loading settings:', error);
            }
        }
    }

    reset() {
        this.showControls();
        this.hideResult();
        this.playerNameInput.value = '';
        this.classSelect.value = '';
        this.updateStartButton();
    }
}

const ui = new UI();