const UIComponents = {
    Button: class {
        constructor(x, y, width, height, text, onClick) {
            this.x = x;
            this.y = y;
            this.width = width;
            this.height = height;
            this.text = text;
            this.onClick = onClick;
            this.hovered = false;
            this.pressed = false;
            this.enabled = true;
            this.visible = true;
        }

        update(mouseX, mouseY) {
            if (!this.visible || !this.enabled) {
                this.hovered = false;
                this.pressed = false;
                return;
            }

            this.hovered = mouseX >= this.x && mouseX <= this.x + this.width &&
                          mouseY >= this.y && mouseY <= this.y + this.height;
        }

        handleMouseDown() {
            if (this.hovered && this.enabled && this.visible) {
                this.pressed = true;
                return true;
            }
            return false;
        }

        handleMouseUp() {
            if (this.pressed && this.hovered && this.enabled && this.visible) {
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

            const offset = this.pressed ? 2 : 0;
            const shadowOffset = this.pressed ? 1 : 3;

            if (!this.pressed && this.enabled) {
                ctx.fillStyle = '#004400';
                ctx.fillRect(this.x + shadowOffset, this.y + shadowOffset, this.width, this.height);
            }

            if (this.enabled) {
                const gradient = ctx.createLinearGradient(
                    this.x, this.y + offset,
                    this.x, this.y + this.height + offset
                );
                gradient.addColorStop(0, this.hovered ? '#00ff00' : '#00cc00');
                gradient.addColorStop(1, this.hovered ? '#00cc00' : '#008800');
                ctx.fillStyle = gradient;
            } else {
                ctx.fillStyle = '#444444';
            }

            ctx.fillRect(this.x, this.y + offset, this.width, this.height);

            ctx.strokeStyle = this.enabled ? '#00ff00' : '#666666';
            ctx.lineWidth = 2;
            ctx.strokeRect(this.x, this.y + offset, this.width, this.height);

            ctx.fillStyle = this.enabled ? (this.hovered ? '#000000' : '#ffffff') : '#888888';
            ctx.font = 'bold 12px "Press Start 2P", monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(this.text, this.x + this.width / 2, this.y + this.height / 2 + offset);

            ctx.restore();
        }

        setEnabled(enabled) {
            this.enabled = enabled;
        }

        setVisible(visible) {
            this.visible = visible;
        }
    },

    LoadingIndicator: class {
        constructor(x, y) {
            this.x = x;
            this.y = y;
            this.rotation = 0;
            this.dots = 0;
            this.dotTimer = 0;
        }

        update(deltaTime) {
            this.rotation += deltaTime * 0.005;
            this.dotTimer += deltaTime;
            if (this.dotTimer > 500) {
                this.dotTimer = 0;
                this.dots = (this.dots + 1) % 4;
            }
        }

        draw(ctx) {
            ctx.save();
            ctx.translate(this.x, this.y);

            ctx.strokeStyle = '#00ff00';
            ctx.lineWidth = 3;
            ctx.lineCap = 'round';

            for (let i = 0; i < 8; i++) {
                const angle = (i / 8) * Math.PI * 2 + this.rotation;
                const opacity = (i + 1) / 8;
                ctx.globalAlpha = opacity;
                
                const x1 = Math.cos(angle) * 20;
                const y1 = Math.sin(angle) * 20;
                const x2 = Math.cos(angle) * 30;
                const y2 = Math.sin(angle) * 30;
                
                ctx.beginPath();
                ctx.moveTo(x1, y1);
                ctx.lineTo(x2, y2);
                ctx.stroke();
            }

            ctx.globalAlpha = 1;
            ctx.fillStyle = '#00ff00';
            ctx.font = '12px "Press Start 2P", monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            let loadingText = 'LOADING';
            for (let i = 0; i < this.dots; i++) {
                loadingText += '.';
            }
            ctx.fillText(loadingText, 0, 50);

            ctx.restore();
        }
    },

    TextRenderer: class {
        constructor() {
            this.defaultFont = '"Press Start 2P", monospace';
        }

        drawText(ctx, text, x, y, size = 12, color = '#00ff00', align = 'left') {
            ctx.save();
            ctx.fillStyle = color;
            ctx.font = `${size}px ${this.defaultFont}`;
            ctx.textAlign = align;
            ctx.textBaseline = 'top';
            ctx.fillText(text, x, y);
            ctx.restore();
        }

        drawTextWithShadow(ctx, text, x, y, size = 12, color = '#00ff00', shadowColor = '#004400', align = 'left') {
            ctx.save();
            ctx.font = `${size}px ${this.defaultFont}`;
            ctx.textAlign = align;
            ctx.textBaseline = 'top';
            
            ctx.fillStyle = shadowColor;
            ctx.fillText(text, x + 2, y + 2);
            
            ctx.fillStyle = color;
            ctx.fillText(text, x, y);
            ctx.restore();
        }

        drawGlowingText(ctx, text, x, y, size = 12, color = '#00ff00', glowIntensity = 1, align = 'center') {
            ctx.save();
            ctx.font = `${size}px ${this.defaultFont}`;
            ctx.textAlign = align;
            ctx.textBaseline = 'middle';
            
            ctx.shadowColor = color;
            ctx.shadowBlur = 10 * glowIntensity;
            ctx.fillStyle = color;
            ctx.fillText(text, x, y);
            
            ctx.shadowBlur = 20 * glowIntensity;
            ctx.fillText(text, x, y);
            
            ctx.restore();
        }

        measureText(ctx, text, size = 12) {
            ctx.save();
            ctx.font = `${size}px ${this.defaultFont}`;
            const metrics = ctx.measureText(text);
            ctx.restore();
            return metrics;
        }
    },

    ProgressBar: class {
        constructor(x, y, width, height) {
            this.x = x;
            this.y = y;
            this.width = width;
            this.height = height;
            this.progress = 0;
            this.targetProgress = 0;
            this.animationSpeed = 0.05;
        }

        setProgress(value) {
            this.targetProgress = Math.max(0, Math.min(1, value));
        }

        update(deltaTime) {
            if (this.progress < this.targetProgress) {
                this.progress = Math.min(this.targetProgress, this.progress + this.animationSpeed);
            } else if (this.progress > this.targetProgress) {
                this.progress = Math.max(this.targetProgress, this.progress - this.animationSpeed);
            }
        }

        draw(ctx) {
            ctx.strokeStyle = '#00ff00';
            ctx.lineWidth = 2;
            ctx.strokeRect(this.x, this.y, this.width, this.height);

            ctx.fillStyle = '#004400';
            ctx.fillRect(this.x + 2, this.y + 2, this.width - 4, this.height - 4);

            if (this.progress > 0) {
                const fillWidth = (this.width - 4) * this.progress;
                const gradient = ctx.createLinearGradient(
                    this.x + 2, this.y + 2,
                    this.x + 2 + fillWidth, this.y + 2
                );
                gradient.addColorStop(0, '#00ff00');
                gradient.addColorStop(1, '#00cc00');
                ctx.fillStyle = gradient;
                ctx.fillRect(this.x + 2, this.y + 2, fillWidth, this.height - 4);
            }

            const percentage = Math.floor(this.progress * 100);
            ctx.fillStyle = '#ffffff';
            ctx.font = '10px "Press Start 2P", monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(`${percentage}%`, this.x + this.width / 2, this.y + this.height / 2);
        }
    }
};