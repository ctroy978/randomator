class Card {
    constructor(x, y, width, height, studentName, index) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.studentName = studentName;
        this.index = index;
        
        this.isFlipped = false;
        this.isSelected = false;
        this.isTossed = false;
        this.isHovered = false;
        
        this.flipProgress = 0;
        this.tossProgress = 0;
        this.hoverScale = 1;
        this.revealScale = 1;
        
        this.targetX = x;
        this.targetY = y;
        this.velocityX = 0;
        this.velocityY = 0;
        this.rotation = 0;
        this.rotationVelocity = 0;
        
        this.cornerRadius = 10;
    }

    update(deltaTime) {
        if (this.isFlipped && this.flipProgress < 1) {
            this.flipProgress = Math.min(1, this.flipProgress + deltaTime * 0.003);
        }
        
        if (this.isTossed) {
            this.tossProgress = Math.min(1, this.tossProgress + deltaTime * 0.001);
            this.x += this.velocityX * deltaTime * 0.03;
            this.y += this.velocityY * deltaTime * 0.03;
            this.rotation += this.rotationVelocity * deltaTime * 0.03;
            this.velocityY += 0.3;
        }
        
        if (this.isHovered && !this.isFlipped && !this.isTossed) {
            this.hoverScale = Math.min(1.1, this.hoverScale + deltaTime * 0.01);
        } else if (!this.isHovered && this.hoverScale > 1) {
            this.hoverScale = Math.max(1, this.hoverScale - deltaTime * 0.01);
        }
        
        if (this.isSelected && this.isFlipped) {
            this.revealScale = Math.min(1.3, this.revealScale + deltaTime * 0.005);
        }
        
        if (!this.isTossed) {
            const dx = this.targetX - this.x;
            const dy = this.targetY - this.y;
            this.x += dx * 0.1;
            this.y += dy * 0.1;
        }
    }

    draw(ctx) {
        if (this.tossProgress >= 1) return;
        
        ctx.save();
        
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;
        
        ctx.translate(centerX, centerY);
        
        if (this.isTossed) {
            ctx.rotate(this.rotation);
            ctx.globalAlpha = 1 - this.tossProgress;
        }
        
        const scale = this.isSelected ? this.revealScale : this.hoverScale;
        ctx.scale(scale, scale);
        
        const flipAngle = this.flipProgress * Math.PI;
        const scaleX = Math.cos(flipAngle);
        ctx.scale(Math.abs(scaleX), 1);
        
        const isShowingFront = scaleX < 0;
        
        if (isShowingFront) {
            this.drawFront(ctx);
        } else {
            this.drawBack(ctx);
        }
        
        ctx.restore();
    }

    drawBack(ctx) {
        ctx.fillStyle = '#1a237e';
        this.drawRoundedRect(ctx, -this.width/2, -this.height/2, this.width, this.height);
        
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 3;
        this.drawRoundedRect(ctx, -this.width/2, -this.height/2, this.width, this.height, true);
        
        ctx.fillStyle = '#ffd700';
        ctx.font = 'bold 72px Georgia';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('R', 0, 0);
        
        ctx.font = 'bold 24px Georgia';
        ctx.fillText(this.index + 1, 0, this.height/3);
    }

    drawFront(ctx) {
        ctx.fillStyle = '#ffffff';
        this.drawRoundedRect(ctx, -this.width/2, -this.height/2, this.width, this.height);
        
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 3;
        this.drawRoundedRect(ctx, -this.width/2, -this.height/2, this.width, this.height, true);
        
        const suits = ['♠', '♥', '♦', '♣'];
        const suit = suits[this.index % 4];
        const color = (suit === '♥' || suit === '♦') ? '#ff0000' : '#000000';
        
        ctx.fillStyle = color;
        ctx.font = 'bold 60px serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(suit, 0, -this.height/3);
        
        ctx.fillStyle = '#1a237e';
        ctx.font = 'bold 20px Georgia';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        const words = this.studentName.split(' ');
        const lineHeight = 25;
        const startY = words.length === 1 ? 0 : -lineHeight/2;
        
        words.forEach((word, i) => {
            ctx.fillText(word, 0, startY + i * lineHeight);
        });
        
        ctx.fillStyle = color;
        ctx.font = 'bold 60px serif';
        ctx.fillText(suit, 0, this.height/3);
    }

    drawRoundedRect(ctx, x, y, width, height, stroke = false) {
        ctx.beginPath();
        ctx.moveTo(x + this.cornerRadius, y);
        ctx.lineTo(x + width - this.cornerRadius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + this.cornerRadius);
        ctx.lineTo(x + width, y + height - this.cornerRadius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - this.cornerRadius, y + height);
        ctx.lineTo(x + this.cornerRadius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - this.cornerRadius);
        ctx.lineTo(x, y + this.cornerRadius);
        ctx.quadraticCurveTo(x, y, x + this.cornerRadius, y);
        ctx.closePath();
        
        if (stroke) {
            ctx.stroke();
        } else {
            ctx.fill();
        }
    }

    checkHover(mouseX, mouseY) {
        if (this.isFlipped || this.isTossed) return false;
        
        const isHovered = mouseX >= this.x && 
                         mouseX <= this.x + this.width && 
                         mouseY >= this.y && 
                         mouseY <= this.y + this.height;
        
        this.isHovered = isHovered;
        return isHovered;
    }

    checkClick(mouseX, mouseY) {
        if (this.isFlipped || this.isTossed) return false;
        
        return mouseX >= this.x && 
               mouseX <= this.x + this.width && 
               mouseY >= this.y && 
               mouseY <= this.y + this.height;
    }

    flip() {
        this.isFlipped = true;
    }

    toss(direction) {
        this.isTossed = true;
        this.velocityX = direction * (5 + Math.random() * 3);
        this.velocityY = -10 - Math.random() * 5;
        this.rotationVelocity = (Math.random() - 0.5) * 0.3;
    }

    select() {
        this.isSelected = true;
        this.flip();
    }
}