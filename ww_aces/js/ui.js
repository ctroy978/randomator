class TextRenderer {
    drawText(ctx, text, x, y, options = {}) {
        const {
            size = 16,
            color = '#ffffff',
            align = 'left',
            baseline = 'top',
            font = 'monospace',
            shadow = false,
            shadowColor = '#000000',
            shadowOffset = 2,
            maxWidth = null
        } = options;

        ctx.save();
        
        ctx.font = `${size}px ${font}`;
        ctx.fillStyle = color;
        ctx.textAlign = align;
        ctx.textBaseline = baseline;
        
        if (shadow) {
            ctx.shadowColor = shadowColor;
            ctx.shadowBlur = 4;
            ctx.shadowOffsetX = shadowOffset;
            ctx.shadowOffsetY = shadowOffset;
        }
        
        if (maxWidth) {
            ctx.fillText(text, x, y, maxWidth);
        } else {
            ctx.fillText(text, x, y);
        }
        
        ctx.restore();
    }
}

class Button {
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
    
    handleMouseMove(mouseX, mouseY) {
        const wasHovered = this.hovered;
        this.hovered = this.isPointInside(mouseX, mouseY) && this.enabled;
        return wasHovered !== this.hovered;
    }
    
    handleMouseDown(mouseX, mouseY) {
        if (this.isPointInside(mouseX, mouseY) && this.enabled) {
            this.pressed = true;
            return true;
        }
        return false;
    }
    
    handleMouseUp(mouseX, mouseY) {
        if (this.pressed && this.isPointInside(mouseX, mouseY) && this.enabled) {
            if (this.onClick) {
                this.onClick();
            }
        }
        this.pressed = false;
    }
    
    isPointInside(x, y) {
        return x >= this.x && x <= this.x + this.width &&
               y >= this.y && y <= this.y + this.height;
    }
    
    setEnabled(enabled) {
        this.enabled = enabled;
        if (!enabled) {
            this.hovered = false;
            this.pressed = false;
        }
    }
    
    setVisible(visible) {
        this.visible = visible;
    }
    
    draw(ctx) {
        if (!this.visible) return;
        
        ctx.save();
        
        let bgColor = '#3d5a3d';
        let borderColor = '#636e72';
        let textColor = '#f39c12';
        
        if (!this.enabled) {
            bgColor = '#2d3436';
            textColor = '#636e72';
        } else if (this.pressed) {
            bgColor = '#2d4a2d';
            borderColor = '#f39c12';
        } else if (this.hovered) {
            bgColor = '#4d6a4d';
            borderColor = '#f39c12';
        }
        
        ctx.fillStyle = bgColor;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        ctx.strokeStyle = borderColor;
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x, this.y, this.width, this.height);
        
        if (this.hovered && this.enabled) {
            ctx.shadowColor = '#f39c12';
            ctx.shadowBlur = 10;
        }
        
        ctx.fillStyle = textColor;
        ctx.font = 'bold 14px "Courier Prime", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.text, this.x + this.width / 2, this.y + this.height / 2);
        
        ctx.restore();
    }
}

class LoadingIndicator {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.rotation = 0;
        this.propellerRotation = 0;
    }
    
    update(deltaTime) {
        this.rotation += deltaTime * 0.001;
        this.propellerRotation += deltaTime * 0.02;
    }
    
    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(Math.sin(this.rotation) * 0.1);
        
        ctx.fillStyle = '#4a5568';
        ctx.fillRect(-30, -10, 60, 20);
        
        ctx.fillStyle = '#2d3748';
        ctx.fillRect(-20, -15, 40, 10);
        
        ctx.fillStyle = '#1a202c';
        ctx.fillRect(-25, -5, 8, 5);
        ctx.fillRect(-15, -5, 5, 5);
        ctx.fillRect(-5, -5, 5, 5);
        
        ctx.save();
        ctx.translate(-20, 0);
        ctx.rotate(this.propellerRotation);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(-1, -10, 2, 20);
        ctx.fillRect(-10, -1, 20, 2);
        ctx.restore();
        
        ctx.fillStyle = '#e53e3e';
        ctx.beginPath();
        ctx.arc(-10, 0, 2, 0, Math.PI * 2);
        ctx.arc(10, 0, 2, 0, Math.PI * 2);
        ctx.fill();
        
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
    }
    
    setProgress(value) {
        this.targetProgress = Math.max(0, Math.min(1, value));
    }
    
    update(deltaTime) {
        const diff = this.targetProgress - this.progress;
        this.progress += diff * 0.1;
    }
    
    draw(ctx) {
        ctx.fillStyle = '#2d3436';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        ctx.strokeStyle = '#636e72';
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x, this.y, this.width, this.height);
        
        if (this.progress > 0) {
            const gradient = ctx.createLinearGradient(this.x, 0, this.x + this.width * this.progress, 0);
            gradient.addColorStop(0, '#3d5a3d');
            gradient.addColorStop(1, '#4d6a4d');
            
            ctx.fillStyle = gradient;
            ctx.fillRect(this.x + 2, this.y + 2, (this.width - 4) * this.progress, this.height - 4);
            
            if (this.progress > 0.1) {
                ctx.fillStyle = 'rgba(243, 156, 18, 0.3)';
                ctx.fillRect(this.x + 2, this.y + 2, (this.width - 4) * this.progress, this.height - 4);
            }
        }
        
        ctx.fillStyle = '#f39c12';
        ctx.font = '10px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${Math.floor(this.progress * 100)}%`, this.x + this.width / 2, this.y + this.height / 2);
    }
}

window.UIComponents = {
    TextRenderer,
    Button,
    LoadingIndicator,
    ProgressBar
};