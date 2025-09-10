class Boxer {
    constructor(x, y, color, name, isPlayer = false) {
        this.x = x;
        this.y = y;
        this.baseX = x;
        this.baseY = y;
        this.color = color;
        this.name = name;
        this.isPlayer = isPlayer;
        
        this.health = 8;
        this.maxHealth = 8;
        this.width = 80;
        this.height = 120;
        
        this.armAngle = 0;
        this.legAngle = 0;
        this.bounceY = 0;
        this.punchProgress = 0;
        this.isPunching = false;
        this.isBlocking = false;
        this.isHit = false;
        this.hitTimer = 0;
        this.isDead = false;
        this.fallAngle = 0;
        this.isVictorious = false;
        this.victoryAngle = 0;
        
        this.bruises = [];
        this.bloodSplatters = [];
    }

    update(deltaTime) {
        if (!this.isDead) {
            this.bounceY = Math.sin(Date.now() * 0.003) * 5;
            this.armAngle = Math.sin(Date.now() * 0.002) * 0.1;
            this.legAngle = Math.sin(Date.now() * 0.0025) * 0.05;
            
            if (this.isPunching) {
                this.punchProgress = Math.min(this.punchProgress + deltaTime * 0.005, 1);
                if (this.punchProgress >= 1) {
                    this.isPunching = false;
                    this.punchProgress = 0;
                }
            }
            
            if (this.isHit) {
                this.hitTimer -= deltaTime;
                if (this.hitTimer <= 0) {
                    this.isHit = false;
                }
            }
            
            if (this.isVictorious) {
                this.victoryAngle += deltaTime * 0.003;
            }
        } else {
            this.fallAngle = Math.min(this.fallAngle + deltaTime * 0.002, Math.PI / 2);
        }
    }

    punch() {
        if (!this.isDead && !this.isPunching) {
            this.isPunching = true;
            this.punchProgress = 0;
            return true;
        }
        return false;
    }

    takeDamage(damage) {
        if (this.isDead) return;
        
        this.health = Math.max(0, this.health - damage);
        this.isHit = true;
        this.hitTimer = 300;
        
        this.bruises.push({
            x: Math.random() * 40 - 20,
            y: Math.random() * 40 - 20,
            size: 10 + Math.random() * 10
        });
        
        if (Math.random() < 0.3) {
            this.bloodSplatters.push({
                x: Math.random() * 60 - 30,
                y: Math.random() * 60 - 30,
                size: 5 + Math.random() * 10,
                angle: Math.random() * Math.PI * 2
            });
        }
        
        if (this.health <= 0) {
            this.die();
        }
    }

    die() {
        this.isDead = true;
        this.fallAngle = 0;
    }

    celebrate() {
        this.isVictorious = true;
        this.victoryAngle = 0;
    }

    draw(ctx) {
        ctx.save();
        
        ctx.translate(this.x, this.y + this.bounceY);
        
        if (!this.isPlayer) {
            ctx.scale(-1, 1);
        }
        
        if (this.isDead) {
            ctx.rotate(this.fallAngle);
            ctx.translate(0, this.fallAngle * 100);
        }
        
        if (this.isHit && !this.isDead) {
            ctx.translate(Math.random() * 4 - 2, Math.random() * 4 - 2);
        }
        
        this.drawLegs(ctx);
        this.drawBody(ctx);
        this.drawArms(ctx);
        this.drawHead(ctx);
        this.drawGloves(ctx);
        this.drawDamageEffects(ctx);
        
        ctx.restore();
        
        if (!this.isDead) {
            this.drawHealthBar(ctx);
            this.drawName(ctx);
        }
    }

    drawLegs(ctx) {
        ctx.fillStyle = this.color;
        
        ctx.save();
        ctx.translate(-8, 40);
        ctx.rotate(this.legAngle - 0.1);
        ctx.fillRect(-8, 0, 16, 50);
        ctx.restore();
        
        ctx.save();
        ctx.translate(8, 40);
        ctx.rotate(-this.legAngle + 0.1);
        ctx.fillRect(-8, 0, 16, 50);
        ctx.restore();
        
        ctx.fillStyle = '#000';
        ctx.fillRect(-16, 80, 16, 15);
        ctx.fillRect(0, 82, 16, 15);
    }

    drawBody(ctx) {
        ctx.fillStyle = '#f4c2a0';
        ctx.beginPath();
        ctx.ellipse(0, 0, 25, 35, 0, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = this.color;
        ctx.fillRect(-25, 20, 50, 30);
    }

    drawArms(ctx) {
        ctx.fillStyle = '#f4c2a0';
        
        const punchOffset = this.isPunching ? this.punchProgress * 50 : 0;
        const armY = this.isVictorious ? -30 - Math.sin(this.victoryAngle) * 20 : -10;
        
        ctx.save();
        ctx.translate(-12, armY);
        ctx.rotate(this.armAngle + (this.isVictorious ? -0.7 : 0.2));
        ctx.fillRect(-6, 0, 12, 35);
        ctx.restore();
        
        ctx.save();
        ctx.translate(25 + punchOffset, armY + 5);
        ctx.rotate(-this.armAngle + (this.isVictorious ? 0.7 : -0.4));
        ctx.fillRect(-6, 0, 12, 35);
        ctx.restore();
    }

    drawHead(ctx) {
        ctx.fillStyle = '#f4c2a0';
        ctx.beginPath();
        ctx.ellipse(5, -45, 22, 25, 0, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#8B4513';
        ctx.beginPath();
        ctx.arc(5, -55, 20, Math.PI, 0);
        ctx.fill();
        
        ctx.fillStyle = '#f4c2a0';
        ctx.beginPath();
        ctx.ellipse(20, -45, 8, 10, 0, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(12, -48, 3, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#8B4513';
        ctx.beginPath();
        ctx.arc(18, -50, 2, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#f4c2a0';
        ctx.beginPath();
        ctx.ellipse(8, -42, 4, 6, -0.2, 0, Math.PI * 2);
        ctx.fill();
        
        if (this.isVictorious) {
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(5, -38, 8, 0.2, Math.PI - 0.2);
            ctx.stroke();
        }
    }

    drawGloves(ctx) {
        ctx.fillStyle = '#ff0000';
        
        const gloveY = this.isVictorious ? -35 - Math.sin(this.victoryAngle) * 20 : 15;
        const punchOffset = this.isPunching ? this.punchProgress * 50 : 0;
        
        ctx.beginPath();
        ctx.ellipse(-18, gloveY + 5, 14, 16, -0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#8B0000';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        ctx.beginPath();
        ctx.ellipse(35 + punchOffset, gloveY, 14, 16, 0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
    }

    drawDamageEffects(ctx) {
        for (const bruise of this.bruises) {
            ctx.fillStyle = 'rgba(128, 0, 128, 0.5)';
            ctx.beginPath();
            ctx.arc(bruise.x, bruise.y, bruise.size, 0, Math.PI * 2);
            ctx.fill();
        }
        
        for (const blood of this.bloodSplatters) {
            ctx.fillStyle = 'rgba(255, 0, 0, 0.7)';
            ctx.save();
            ctx.translate(blood.x, blood.y);
            ctx.rotate(blood.angle);
            for (let i = 0; i < 3; i++) {
                ctx.beginPath();
                ctx.arc(i * 5, 0, blood.size / (i + 1), 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.restore();
        }
    }

    drawHealthBar(ctx) {
        const barWidth = 100;
        const barHeight = 15;
        const barX = this.x - barWidth / 2;
        const barY = this.y - 140;
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(barX - 2, barY - 2, barWidth + 4, barHeight + 4);
        
        ctx.fillStyle = '#333';
        ctx.fillRect(barX, barY, barWidth, barHeight);
        
        const healthPercent = this.health / this.maxHealth;
        const healthColor = healthPercent > 0.5 ? '#0f0' : healthPercent > 0.25 ? '#ff0' : '#f00';
        ctx.fillStyle = healthColor;
        ctx.fillRect(barX, barY, barWidth * healthPercent, barHeight);
        
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.strokeRect(barX, barY, barWidth, barHeight);
    }

    drawName(ctx) {
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(this.name, this.x, this.y - 160);
        
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 3;
        ctx.strokeText(this.name, this.x, this.y - 160);
        ctx.fillText(this.name, this.x, this.y - 160);
    }
}