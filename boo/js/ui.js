class UIComponents {
    static Button = class {
        constructor(x, y, width, height, text, onClick) {
            this.x = x;
            this.y = y;
            this.width = width;
            this.height = height;
            this.text = text;
            this.onClick = onClick;
            this.enabled = true;
            this.visible = true;
            this.hover = false;
            this.pressed = false;
        }

        setEnabled(enabled) {
            this.enabled = enabled;
        }

        setVisible(visible) {
            this.visible = visible;
        }

        isPointInside(x, y) {
            return x >= this.x && x <= this.x + this.width &&
                   y >= this.y && y <= this.y + this.height;
        }

        handleMouseMove(x, y) {
            if (!this.visible || !this.enabled) return;
            this.hover = this.isPointInside(x, y);
        }

        handleMouseDown(x, y) {
            if (!this.visible || !this.enabled) return false;
            if (this.isPointInside(x, y)) {
                this.pressed = true;
                return true;
            }
            return false;
        }

        handleMouseUp(x, y) {
            if (!this.visible || !this.enabled) return false;
            if (this.pressed && this.isPointInside(x, y)) {
                this.pressed = false;
                if (this.onClick) {
                    this.onClick();
                }
                return true;
            }
            this.pressed = false;
            return false;
        }

        draw(ctx) {
            if (!this.visible) return;

            ctx.save();

            // Button background
            const gradient = ctx.createLinearGradient(
                this.x, this.y,
                this.x, this.y + this.height
            );
            
            if (this.enabled) {
                if (this.pressed) {
                    gradient.addColorStop(0, '#cc5200');
                    gradient.addColorStop(1, '#ff6600');
                } else if (this.hover) {
                    gradient.addColorStop(0, '#ff8c00');
                    gradient.addColorStop(1, '#ff6600');
                } else {
                    gradient.addColorStop(0, '#ff6600');
                    gradient.addColorStop(1, '#ff8c00');
                }
            } else {
                gradient.addColorStop(0, '#666');
                gradient.addColorStop(1, '#888');
            }

            ctx.fillStyle = gradient;
            ctx.fillRect(this.x, this.y, this.width, this.height);

            // Button border
            ctx.strokeStyle = this.enabled ? '#8a2be2' : '#444';
            ctx.lineWidth = 2;
            ctx.strokeRect(this.x, this.y, this.width, this.height);

            // Button text
            ctx.fillStyle = this.enabled ? '#000' : '#ccc';
            ctx.font = 'bold 18px Creepster';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(this.text, this.x + this.width / 2, this.y + this.height / 2);

            ctx.restore();
        }
    };

    static LoadingIndicator = class {
        constructor(x, y) {
            this.x = x;
            this.y = y;
            this.rotation = 0;
            this.dots = 8;
        }

        update(deltaTime) {
            this.rotation += deltaTime * 0.003;
        }

        draw(ctx) {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rotation);

            for (let i = 0; i < this.dots; i++) {
                const angle = (Math.PI * 2 * i) / this.dots;
                const x = Math.cos(angle) * 30;
                const y = Math.sin(angle) * 30;
                const opacity = 0.3 + (i / this.dots) * 0.7;

                ctx.fillStyle = `rgba(255, 140, 0, ${opacity})`;
                ctx.beginPath();
                ctx.arc(x, y, 5, 0, Math.PI * 2);
                ctx.fill();
            }

            ctx.restore();

            // Loading text
            ctx.fillStyle = '#ff8c00';
            ctx.font = '20px Griffy';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('Summoning spirits...', this.x, this.y + 60);
        }
    };

    static TextRenderer = class {
        constructor() {
            this.defaultFont = 'Griffy';
            this.defaultColor = '#f0e6ff';
        }

        drawText(ctx, text, x, y, options = {}) {
            const {
                font = this.defaultFont,
                size = 16,
                color = this.defaultColor,
                align = 'left',
                baseline = 'alphabetic',
                shadow = false,
                shadowColor = 'rgba(0, 0, 0, 0.5)',
                shadowBlur = 4
            } = options;

            ctx.save();

            if (shadow) {
                ctx.shadowColor = shadowColor;
                ctx.shadowBlur = shadowBlur;
                ctx.shadowOffsetX = 2;
                ctx.shadowOffsetY = 2;
            }

            ctx.font = `${size}px ${font}`;
            ctx.fillStyle = color;
            ctx.textAlign = align;
            ctx.textBaseline = baseline;
            ctx.fillText(text, x, y);

            ctx.restore();
        }

        measureText(ctx, text, size = 16, font = this.defaultFont) {
            ctx.save();
            ctx.font = `${size}px ${font}`;
            const metrics = ctx.measureText(text);
            ctx.restore();
            return metrics;
        }
    };
}

class UIManager {
    constructor() {
        this.elements = [];
        this.settingsOpen = false;
        this.setupDOMElements();
    }

    setupDOMElements() {
        // Settings button
        const settingsBtn = document.getElementById('settingsBtn');
        const settingsPanel = document.getElementById('settingsPanel');
        
        settingsBtn.addEventListener('click', () => {
            this.settingsOpen = !this.settingsOpen;
            settingsPanel.style.display = this.settingsOpen ? 'block' : 'none';
        });

        // Speed slider
        const speedSlider = document.getElementById('speedSlider');
        const speedValue = document.getElementById('speedValue');
        
        speedSlider.addEventListener('input', (e) => {
            const speed = parseFloat(e.target.value);
            speedValue.textContent = speed + 'x';
            if (window.game) {
                window.game.settings.animationSpeed = speed;
            }
        });

        // Sound toggle
        const soundToggle = document.getElementById('soundToggle');
        const volumeControls = document.getElementById('volumeControls');
        
        soundToggle.addEventListener('change', (e) => {
            const enabled = e.target.checked;
            volumeControls.style.display = enabled ? 'block' : 'none';
            if (window.audioManager) {
                audioManager.setEnabled(enabled);
            }
            if (window.game) {
                window.game.settings.soundEnabled = enabled;
            }
        });

        // Volume slider
        const soundVolume = document.getElementById('soundVolume');
        const soundVolumeValue = document.getElementById('soundVolumeValue');
        
        soundVolume.addEventListener('input', (e) => {
            const volume = parseFloat(e.target.value);
            soundVolumeValue.textContent = Math.round(volume * 100) + '%';
            if (window.audioManager) {
                audioManager.setVolume(volume);
            }
        });

        // Effects toggle
        const effectsToggle = document.getElementById('effectsToggle');
        
        effectsToggle.addEventListener('change', (e) => {
            if (window.game) {
                window.game.settings.effectsEnabled = e.target.checked;
            }
        });

        // Class selector
        const classSelect = document.getElementById('classSelect');
        classSelect.addEventListener('change', (e) => {
            if (window.game) {
                window.game.handleClassSelection(e.target.value);
            }
        });

        // Start button
        const startBtn = document.getElementById('startBtn');
        startBtn.addEventListener('click', () => {
            if (window.game) {
                window.game.startSelection();
            }
        });

        // Next button
        const nextBtn = document.getElementById('nextBtn');
        nextBtn.addEventListener('click', () => {
            if (window.game) {
                window.game.reset();
            }
        });
    }

    showResult(studentName) {
        const resultDisplay = document.getElementById('resultDisplay');
        const resultName = document.getElementById('resultName');
        const controls = document.getElementById('controls');
        
        resultName.textContent = studentName;
        resultDisplay.style.display = 'block';
        controls.style.display = 'none';
    }

    hideResult() {
        const resultDisplay = document.getElementById('resultDisplay');
        const controls = document.getElementById('controls');
        
        resultDisplay.style.display = 'none';
        controls.style.display = 'flex';
    }

    setStartButtonEnabled(enabled) {
        const startBtn = document.getElementById('startBtn');
        startBtn.disabled = !enabled;
    }

    async populateClassSelector(classes) {
        const classSelect = document.getElementById('classSelect');
        classSelect.innerHTML = '<option value="">Select a class...</option>';
        
        classes.forEach(className => {
            const option = document.createElement('option');
            option.value = className;
            option.textContent = className;
            classSelect.appendChild(option);
        });
    }

    showError(message) {
        console.error(message);
        // Could show a visual error message here
    }
}