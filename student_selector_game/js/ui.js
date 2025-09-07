class Button {
    constructor(x, y, width, height, text, onClick) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.text = text;
        this.onClick = onClick;
        this.isHovered = false;
        this.isPressed = false;
        this.enabled = true;
        this.visible = true;
    }

    draw(ctx) {
        if (!this.visible) return;

        ctx.save();

        let offsetY = 0;
        let shadowHeight = 6;

        if (this.isPressed && this.enabled) {
            offsetY = 4;
            shadowHeight = 2;
        } else if (this.isHovered && this.enabled) {
            offsetY = 2;
            shadowHeight = 4;
        }

        const gradient = ctx.createLinearGradient(
            this.x, this.y + offsetY,
            this.x, this.y + this.height + offsetY
        );

        if (this.enabled) {
            gradient.addColorStop(0, '#4ade80');
            gradient.addColorStop(1, '#22c55e');
            ctx.fillStyle = '#15803d';
        } else {
            gradient.addColorStop(0, '#6b7280');
            gradient.addColorStop(1, '#4b5563');
            ctx.fillStyle = '#374151';
        }

        ctx.fillRect(this.x, this.y + this.height + offsetY, this.width, shadowHeight);

        ctx.fillStyle = gradient;
        ctx.fillRect(this.x, this.y + offsetY, this.width, this.height);

        ctx.fillStyle = this.enabled ? '#ffffff' : '#9ca3af';
        ctx.font = '12px "Press Start 2P", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(
            this.text,
            this.x + this.width / 2,
            this.y + this.height / 2 + offsetY
        );

        ctx.restore();
    }

    handleMouseMove(mouseX, mouseY) {
        const wasHovered = this.isHovered;
        this.isHovered = this.enabled && this.visible &&
            mouseX >= this.x && mouseX <= this.x + this.width &&
            mouseY >= this.y && mouseY <= this.y + this.height;
        
        return wasHovered !== this.isHovered;
    }

    handleMouseDown(mouseX, mouseY) {
        if (this.isHovered && this.enabled && this.visible) {
            this.isPressed = true;
            return true;
        }
        return false;
    }

    handleMouseUp(mouseX, mouseY) {
        if (this.isPressed && this.isHovered && this.enabled && this.visible) {
            this.isPressed = false;
            if (this.onClick) {
                this.onClick();
            }
            return true;
        }
        this.isPressed = false;
        return false;
    }

    setEnabled(enabled) {
        this.enabled = enabled;
        if (!enabled) {
            this.isHovered = false;
            this.isPressed = false;
        }
    }

    setVisible(visible) {
        this.visible = visible;
        if (!visible) {
            this.isHovered = false;
            this.isPressed = false;
        }
    }
}

class TextRenderer {
    constructor() {
        this.defaultFont = '"Press Start 2P", monospace';
    }

    drawText(ctx, text, x, y, options = {}) {
        const {
            size = 12,
            color = '#ffffff',
            align = 'left',
            baseline = 'top',
            shadow = false,
            shadowColor = '#000000',
            shadowOffset = 2,
            maxWidth = null,
            typewriter = false,
            typewriterIndex = text.length
        } = options;

        ctx.save();

        ctx.font = `${size}px ${this.defaultFont}`;
        ctx.textAlign = align;
        ctx.textBaseline = baseline;

        const displayText = typewriter ? text.substring(0, typewriterIndex) : text;

        if (shadow) {
            ctx.fillStyle = shadowColor;
            ctx.fillText(displayText, x + shadowOffset, y + shadowOffset, maxWidth);
        }

        ctx.fillStyle = color;
        ctx.fillText(displayText, x, y, maxWidth);

        ctx.restore();
    }

    drawPixelText(ctx, text, x, y, scale = 1, color = '#ffffff') {
        ctx.save();
        ctx.fillStyle = color;

        const pixelSize = 2 * scale;
        const charWidth = 5 * pixelSize;
        const charHeight = 7 * pixelSize;
        const spacing = pixelSize;

        for (let i = 0; i < text.length; i++) {
            const charX = x + i * (charWidth + spacing);
            this.drawPixelChar(ctx, text[i], charX, y, pixelSize);
        }

        ctx.restore();
    }

    drawPixelChar(ctx, char, x, y, pixelSize) {
        const patterns = this.getPixelPattern(char.toUpperCase());
        if (!patterns) return;

        for (let row = 0; row < patterns.length; row++) {
            for (let col = 0; col < patterns[row].length; col++) {
                if (patterns[row][col] === 1) {
                    ctx.fillRect(
                        x + col * pixelSize,
                        y + row * pixelSize,
                        pixelSize,
                        pixelSize
                    );
                }
            }
        }
    }

    getPixelPattern(char) {
        const patterns = {
            'A': [[0,1,1,1,0],[1,0,0,0,1],[1,0,0,0,1],[1,1,1,1,1],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1]],
            'B': [[1,1,1,1,0],[1,0,0,0,1],[1,0,0,0,1],[1,1,1,1,0],[1,0,0,0,1],[1,0,0,0,1],[1,1,1,1,0]],
            'C': [[0,1,1,1,0],[1,0,0,0,1],[1,0,0,0,0],[1,0,0,0,0],[1,0,0,0,0],[1,0,0,0,1],[0,1,1,1,0]],
            'D': [[1,1,1,1,0],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[1,1,1,1,0]],
            'E': [[1,1,1,1,1],[1,0,0,0,0],[1,0,0,0,0],[1,1,1,1,0],[1,0,0,0,0],[1,0,0,0,0],[1,1,1,1,1]],
            'F': [[1,1,1,1,1],[1,0,0,0,0],[1,0,0,0,0],[1,1,1,1,0],[1,0,0,0,0],[1,0,0,0,0],[1,0,0,0,0]],
            'G': [[0,1,1,1,0],[1,0,0,0,1],[1,0,0,0,0],[1,0,1,1,1],[1,0,0,0,1],[1,0,0,0,1],[0,1,1,1,0]],
            'H': [[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[1,1,1,1,1],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1]],
            'I': [[0,1,1,1,0],[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0],[0,1,1,1,0]],
            'J': [[0,0,1,1,1],[0,0,0,1,0],[0,0,0,1,0],[0,0,0,1,0],[0,0,0,1,0],[1,0,0,1,0],[0,1,1,0,0]],
            'K': [[1,0,0,0,1],[1,0,0,1,0],[1,0,1,0,0],[1,1,0,0,0],[1,0,1,0,0],[1,0,0,1,0],[1,0,0,0,1]],
            'L': [[1,0,0,0,0],[1,0,0,0,0],[1,0,0,0,0],[1,0,0,0,0],[1,0,0,0,0],[1,0,0,0,0],[1,1,1,1,1]],
            'M': [[1,0,0,0,1],[1,1,0,1,1],[1,0,1,0,1],[1,0,1,0,1],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1]],
            'N': [[1,0,0,0,1],[1,1,0,0,1],[1,0,1,0,1],[1,0,0,1,1],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1]],
            'O': [[0,1,1,1,0],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[0,1,1,1,0]],
            'P': [[1,1,1,1,0],[1,0,0,0,1],[1,0,0,0,1],[1,1,1,1,0],[1,0,0,0,0],[1,0,0,0,0],[1,0,0,0,0]],
            'Q': [[0,1,1,1,0],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[1,0,1,0,1],[1,0,0,1,0],[0,1,1,0,1]],
            'R': [[1,1,1,1,0],[1,0,0,0,1],[1,0,0,0,1],[1,1,1,1,0],[1,0,1,0,0],[1,0,0,1,0],[1,0,0,0,1]],
            'S': [[0,1,1,1,1],[1,0,0,0,0],[1,0,0,0,0],[0,1,1,1,0],[0,0,0,0,1],[0,0,0,0,1],[1,1,1,1,0]],
            'T': [[1,1,1,1,1],[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0]],
            'U': [[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[0,1,1,1,0]],
            'V': [[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[0,1,0,1,0],[0,0,1,0,0]],
            'W': [[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[1,0,1,0,1],[1,0,1,0,1],[1,1,0,1,1],[1,0,0,0,1]],
            'X': [[1,0,0,0,1],[1,0,0,0,1],[0,1,0,1,0],[0,0,1,0,0],[0,1,0,1,0],[1,0,0,0,1],[1,0,0,0,1]],
            'Y': [[1,0,0,0,1],[1,0,0,0,1],[0,1,0,1,0],[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0]],
            'Z': [[1,1,1,1,1],[0,0,0,0,1],[0,0,0,1,0],[0,0,1,0,0],[0,1,0,0,0],[1,0,0,0,0],[1,1,1,1,1]],
            '0': [[0,1,1,1,0],[1,0,0,0,1],[1,0,0,1,1],[1,0,1,0,1],[1,1,0,0,1],[1,0,0,0,1],[0,1,1,1,0]],
            '1': [[0,0,1,0,0],[0,1,1,0,0],[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0],[0,1,1,1,0]],
            '2': [[0,1,1,1,0],[1,0,0,0,1],[0,0,0,0,1],[0,0,0,1,0],[0,0,1,0,0],[0,1,0,0,0],[1,1,1,1,1]],
            '3': [[0,1,1,1,0],[1,0,0,0,1],[0,0,0,0,1],[0,0,1,1,0],[0,0,0,0,1],[1,0,0,0,1],[0,1,1,1,0]],
            '4': [[0,0,0,1,0],[0,0,1,1,0],[0,1,0,1,0],[1,0,0,1,0],[1,1,1,1,1],[0,0,0,1,0],[0,0,0,1,0]],
            '5': [[1,1,1,1,1],[1,0,0,0,0],[1,0,0,0,0],[1,1,1,1,0],[0,0,0,0,1],[0,0,0,0,1],[1,1,1,1,0]],
            '6': [[0,1,1,1,0],[1,0,0,0,1],[1,0,0,0,0],[1,1,1,1,0],[1,0,0,0,1],[1,0,0,0,1],[0,1,1,1,0]],
            '7': [[1,1,1,1,1],[0,0,0,0,1],[0,0,0,1,0],[0,0,1,0,0],[0,1,0,0,0],[0,1,0,0,0],[0,1,0,0,0]],
            '8': [[0,1,1,1,0],[1,0,0,0,1],[1,0,0,0,1],[0,1,1,1,0],[1,0,0,0,1],[1,0,0,0,1],[0,1,1,1,0]],
            '9': [[0,1,1,1,0],[1,0,0,0,1],[1,0,0,0,1],[0,1,1,1,1],[0,0,0,0,1],[1,0,0,0,1],[0,1,1,1,0]],
            ' ': [[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0]],
            '!': [[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0],[0,0,0,0,0],[0,0,1,0,0]],
            '?': [[0,1,1,1,0],[1,0,0,0,1],[0,0,0,0,1],[0,0,0,1,0],[0,0,1,0,0],[0,0,0,0,0],[0,0,1,0,0]],
            '.': [[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,1,0,0]],
            ',': [[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,1,0,0],[0,1,0,0,0]],
            '-': [[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[1,1,1,1,1],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0]],
            '+': [[0,0,0,0,0],[0,0,1,0,0],[0,0,1,0,0],[1,1,1,1,1],[0,0,1,0,0],[0,0,1,0,0],[0,0,0,0,0]],
            '=': [[0,0,0,0,0],[0,0,0,0,0],[1,1,1,1,1],[0,0,0,0,0],[1,1,1,1,1],[0,0,0,0,0],[0,0,0,0,0]],
            '/': [[0,0,0,0,1],[0,0,0,1,0],[0,0,0,1,0],[0,0,1,0,0],[0,1,0,0,0],[0,1,0,0,0],[1,0,0,0,0]],
            ':': [[0,0,0,0,0],[0,0,1,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,1,0,0],[0,0,0,0,0]]
        };
        return patterns[char] || null;
    }

    measureText(ctx, text, size = 12) {
        ctx.save();
        ctx.font = `${size}px ${this.defaultFont}`;
        const metrics = ctx.measureText(text);
        ctx.restore();
        return metrics.width;
    }
}

class LoadingIndicator {
    constructor(x, y, size = 40) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.angle = 0;
        this.dots = 8;
    }

    update(deltaTime) {
        this.angle += deltaTime * 0.003;
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);

        for (let i = 0; i < this.dots; i++) {
            const angle = (i / this.dots) * Math.PI * 2 + this.angle;
            const x = Math.cos(angle) * this.size;
            const y = Math.sin(angle) * this.size;
            const opacity = (1 - (i / this.dots)) * 0.8 + 0.2;
            
            ctx.fillStyle = `rgba(255, 215, 0, ${opacity})`;
            ctx.fillRect(x - 4, y - 4, 8, 8);
        }

        ctx.restore();
    }
}

class ProgressBar {
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
        const diff = this.targetProgress - this.progress;
        this.progress += diff * this.animationSpeed * deltaTime * 0.06;
    }

    draw(ctx) {
        ctx.fillStyle = '#374151';
        ctx.fillRect(this.x, this.y, this.width, this.height);

        ctx.fillStyle = '#1f2937';
        ctx.fillRect(this.x + 2, this.y + 2, this.width - 4, this.height - 4);

        const fillWidth = (this.width - 8) * this.progress;
        if (fillWidth > 0) {
            const gradient = ctx.createLinearGradient(
                this.x + 4, this.y,
                this.x + 4 + fillWidth, this.y
            );
            gradient.addColorStop(0, '#fbbf24');
            gradient.addColorStop(1, '#ffd700');
            
            ctx.fillStyle = gradient;
            ctx.fillRect(this.x + 4, this.y + 4, fillWidth, this.height - 8);

            for (let i = 0; i < fillWidth; i += 20) {
                ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
                ctx.fillRect(this.x + 4 + i, this.y + 4, 2, this.height - 8);
            }
        }
    }
}

window.UIComponents = {
    Button,
    TextRenderer,
    LoadingIndicator,
    ProgressBar
};