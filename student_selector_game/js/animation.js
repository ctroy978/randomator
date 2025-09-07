class Sprite {
    constructor(x = 0, y = 0, width = 32, height = 32) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.scale = 1;
        this.rotation = 0;
        this.opacity = 1;
        this.visible = true;
    }

    draw(ctx) {
        if (!this.visible || this.opacity <= 0) return;

        ctx.save();
        ctx.globalAlpha = this.opacity;
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
        ctx.rotate(this.rotation);
        ctx.scale(this.scale, this.scale);
        
        this.render(ctx);
        
        ctx.restore();
    }

    render(ctx) {
    }
}

class PixelMiner extends Sprite {
    constructor(x, y) {
        super(x, y, 32, 32);
        this.frame = 0;
        this.animationTime = 0;
        this.state = 'idle';
        this.facingRight = true;
    }

    setState(state) {
        this.state = state;
        this.frame = 0;
        this.animationTime = 0;
    }

    update(deltaTime) {
        this.animationTime += deltaTime;
        
        const frameTime = this.state === 'mining' ? 150 : 200;
        
        if (this.animationTime > frameTime) {
            this.animationTime = 0;
            this.frame++;
            
            if (this.state === 'idle' && this.frame > 1) this.frame = 0;
            if (this.state === 'walking' && this.frame > 3) this.frame = 0;
            if (this.state === 'mining' && this.frame > 3) this.frame = 0;
        }
    }

    render(ctx) {
        const pixelSize = 2;
        const colors = {
            skin: '#fdbcb4',
            hair: '#8b4513',
            shirt: '#ff6b6b',
            pants: '#4169e1',
            shoes: '#2f4f4f',
            pickaxe: '#8b7355',
            pickaxeHead: '#708090'
        };

        ctx.translate(-this.width / 2, -this.height / 2);

        if (!this.facingRight) {
            ctx.scale(-1, 1);
            ctx.translate(-this.width, 0);
        }

        this.drawHead(ctx, pixelSize, colors);
        this.drawBody(ctx, pixelSize, colors);
        
        if (this.state === 'mining') {
            this.drawPickaxe(ctx, pixelSize, colors);
        }
    }

    drawHead(ctx, size, colors) {
        const headOffsetY = this.state === 'walking' && (this.frame === 1 || this.frame === 3) ? -1 : 0;
        
        ctx.fillStyle = colors.hair;
        ctx.fillRect(6 * size, (2 + headOffsetY) * size, 8 * size, 3 * size);
        
        ctx.fillStyle = colors.skin;
        ctx.fillRect(6 * size, (5 + headOffsetY) * size, 8 * size, 6 * size);
        
        ctx.fillStyle = '#000000';
        ctx.fillRect(8 * size, (6 + headOffsetY) * size, 2 * size, 2 * size);
        ctx.fillRect(11 * size, (6 + headOffsetY) * size, 2 * size, 2 * size);
        
        ctx.fillStyle = '#ff1493';
        ctx.fillRect(9 * size, (9 + headOffsetY) * size, 3 * size, size);
    }

    drawBody(ctx, size, colors) {
        const armOffset = this.state === 'mining' ? 
            [0, -4, -8, -4][this.frame] : 
            (this.state === 'walking' ? [0, 2, 0, -2][this.frame] : 0);
        
        ctx.fillStyle = colors.shirt;
        ctx.fillRect(7 * size, 11 * size, 6 * size, 8 * size);
        
        ctx.fillStyle = colors.skin;
        ctx.fillRect(4 * size, (12 + armOffset) * size, 3 * size, 6 * size);
        ctx.fillRect(13 * size, (12 - armOffset) * size, 3 * size, 6 * size);
        
        ctx.fillStyle = colors.pants;
        ctx.fillRect(7 * size, 19 * size, 6 * size, 7 * size);
        
        const legOffset = this.state === 'walking' ? 
            [[0, 0], [2, -2], [0, 0], [-2, 2]][this.frame] : [0, 0];
        
        ctx.fillStyle = colors.pants;
        ctx.fillRect(7 * size, (26 + legOffset[0]) * size, 3 * size, 4 * size);
        ctx.fillRect(10 * size, (26 + legOffset[1]) * size, 3 * size, 4 * size);
        
        ctx.fillStyle = colors.shoes;
        ctx.fillRect(7 * size, (30 + legOffset[0]) * size, 3 * size, 2 * size);
        ctx.fillRect(10 * size, (30 + legOffset[1]) * size, 3 * size, 2 * size);
    }

    drawPickaxe(ctx, size, colors) {
        const swingAngle = [0, -30, -60, -30][this.frame] * Math.PI / 180;
        
        ctx.save();
        ctx.translate(16 * size, 14 * size);
        ctx.rotate(swingAngle);
        
        ctx.fillStyle = colors.pickaxe;
        ctx.fillRect(-size, 0, 2 * size, 12 * size);
        
        ctx.fillStyle = colors.pickaxeHead;
        ctx.fillRect(-4 * size, -2 * size, 8 * size, 4 * size);
        
        const sparkOffset = this.frame === 2 ? 4 : 0;
        if (sparkOffset > 0) {
            ctx.fillStyle = '#ffff00';
            for (let i = 0; i < 3; i++) {
                const angle = (i * 30 - 30) * Math.PI / 180;
                const x = Math.cos(angle) * sparkOffset * size;
                const y = Math.sin(angle) * sparkOffset * size;
                ctx.fillRect(x, y, size, size);
            }
        }
        
        ctx.restore();
    }
}

class Rock extends Sprite {
    constructor(x, y) {
        super(x, y, 64, 64);
        this.damage = 0;
        this.shakeAmount = 0;
        this.shakeTime = 0;
        this.particles = [];
    }

    hit() {
        this.damage++;
        this.shakeAmount = 8;
        this.shakeTime = 300;
        
        for (let i = 0; i < 5; i++) {
            this.particles.push({
                x: Math.random() * this.width - this.width / 2,
                y: Math.random() * this.height - this.height / 2,
                vx: (Math.random() - 0.5) * 4,
                vy: Math.random() * -5 - 2,
                size: Math.random() * 4 + 2,
                life: 1000,
                color: Math.random() > 0.5 ? '#8b7355' : '#696969'
            });
        }
    }

    explode() {
        for (let i = 0; i < 20; i++) {
            this.particles.push({
                x: Math.random() * this.width - this.width / 2,
                y: Math.random() * this.height - this.height / 2,
                vx: (Math.random() - 0.5) * 8,
                vy: Math.random() * -10 - 5,
                size: Math.random() * 6 + 3,
                life: 1500,
                color: ['#8b7355', '#696969', '#a0522d', '#4b4b4b'][Math.floor(Math.random() * 4)]
            });
        }
        this.visible = false;
    }

    update(deltaTime) {
        if (this.shakeTime > 0) {
            this.shakeTime -= deltaTime;
            if (this.shakeTime <= 0) {
                this.shakeAmount = 0;
            }
        }
        
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx * deltaTime * 0.06;
            p.y += p.vy * deltaTime * 0.06;
            p.vy += 0.5;
            p.life -= deltaTime;
            
            if (p.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }

    render(ctx) {
        const shakeX = this.shakeAmount ? (Math.random() - 0.5) * this.shakeAmount : 0;
        const shakeY = this.shakeAmount ? (Math.random() - 0.5) * this.shakeAmount : 0;
        
        ctx.translate(-this.width / 2 + shakeX, -this.height / 2 + shakeY);
        
        if (this.visible) {
            this.drawRock(ctx);
            this.drawCracks(ctx);
        }
        
        this.drawParticles(ctx);
    }

    drawRock(ctx) {
        const gradient = ctx.createRadialGradient(32, 32, 10, 32, 32, 30);
        gradient.addColorStop(0, '#a0a0a0');
        gradient.addColorStop(1, '#606060');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.moveTo(20, 10);
        ctx.lineTo(44, 8);
        ctx.lineTo(56, 20);
        ctx.lineTo(58, 44);
        ctx.lineTo(42, 56);
        ctx.lineTo(18, 54);
        ctx.lineTo(6, 40);
        ctx.lineTo(8, 18);
        ctx.closePath();
        ctx.fill();
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.beginPath();
        ctx.moveTo(32, 32);
        ctx.lineTo(42, 56);
        ctx.lineTo(18, 54);
        ctx.lineTo(6, 40);
        ctx.lineTo(32, 32);
        ctx.closePath();
        ctx.fill();
        
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.fillRect(24, 16, 4, 4);
        ctx.fillRect(36, 20, 3, 3);
        ctx.fillRect(28, 28, 2, 2);
    }

    drawCracks(ctx) {
        if (this.damage === 0) return;
        
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        
        if (this.damage >= 1) {
            ctx.beginPath();
            ctx.moveTo(25, 20);
            ctx.lineTo(30, 32);
            ctx.lineTo(28, 45);
            ctx.stroke();
        }
        
        if (this.damage >= 2) {
            ctx.beginPath();
            ctx.moveTo(40, 18);
            ctx.lineTo(38, 30);
            ctx.lineTo(42, 42);
            ctx.stroke();
        }
        
        if (this.damage >= 3) {
            ctx.beginPath();
            ctx.moveTo(15, 30);
            ctx.lineTo(32, 32);
            ctx.lineTo(48, 35);
            ctx.stroke();
            
            ctx.beginPath();
            ctx.moveTo(32, 15);
            ctx.lineTo(32, 32);
            ctx.lineTo(32, 50);
            ctx.stroke();
        }
    }

    drawParticles(ctx) {
        for (const p of this.particles) {
            ctx.globalAlpha = p.life / 1500;
            ctx.fillStyle = p.color;
            ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
        }
        ctx.globalAlpha = 1;
    }
}

class MiningAnimation {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.width = canvas.width;
        this.height = canvas.height;
        
        this.miner = null;
        this.rock = null;
        this.particles = [];
        this.screenShake = 0;
        this.state = 'idle';
        this.stateTime = 0;
        this.selectedStudent = '';
        this.onComplete = null;
        this.swingCount = 0;
        this.maxSwings = 5;
        this.textOpacity = 0;
        this.speedMultiplier = 1;
        this.particlesEnabled = true;
    }

    start(studentName, onComplete) {
        this.selectedStudent = studentName;
        this.onComplete = onComplete;
        this.state = 'walking';
        this.stateTime = 0;
        this.swingCount = 0;
        this.maxSwings = Math.floor(Math.random() * 4) + 3;
        this.textOpacity = 0;
        this.screenShake = 0;
        
        this.miner = new PixelMiner(-50, this.height / 2);
        this.rock = new Rock(this.width / 2 + 100, this.height / 2 - 20);
        this.particles = [];
        
        this.miner.setState('walking');
    }

    skip() {
        if (this.state !== 'complete' && this.state !== 'idle') {
            this.state = 'revealing';
            this.stateTime = 1000;
            this.textOpacity = 1;
            if (this.rock) this.rock.visible = false;
        }
    }

    update(deltaTime) {
        deltaTime *= this.speedMultiplier;
        
        if (!this.miner || !this.rock) return;
        
        this.stateTime += deltaTime;
        this.miner.update(deltaTime);
        this.rock.update(deltaTime);
        
        if (this.screenShake > 0) {
            this.screenShake -= deltaTime * 0.05;
            if (this.screenShake < 0) this.screenShake = 0;
        }
        
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.update(deltaTime);
            if (p.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
        
        switch (this.state) {
            case 'walking':
                this.updateWalking(deltaTime);
                break;
            case 'anticipation':
                this.updateAnticipation(deltaTime);
                break;
            case 'mining':
                this.updateMining(deltaTime);
                break;
            case 'exploding':
                this.updateExploding(deltaTime);
                break;
            case 'revealing':
                this.updateRevealing(deltaTime);
                break;
            case 'celebrating':
                this.updateCelebrating(deltaTime);
                break;
        }
    }

    updateWalking(deltaTime) {
        this.miner.x += deltaTime * 0.15;
        
        if (this.miner.x > this.width / 2 + 40) {
            this.miner.x = this.width / 2 + 40;
            this.state = 'anticipation';
            this.stateTime = 0;
            this.miner.setState('idle');
        }
    }

    updateAnticipation(deltaTime) {
        if (this.stateTime > 500) {
            this.state = 'mining';
            this.stateTime = 0;
            this.miner.setState('mining');
        }
    }

    updateMining(deltaTime) {
        if (this.stateTime > 600) {
            this.rock.hit();
            this.screenShake = 5;
            this.swingCount++;
            
            if (typeof audioManager !== 'undefined') {
                audioManager.playPickaxeHit(this.swingCount);
            }
            
            if (this.particlesEnabled) {
                for (let i = 0; i < 3; i++) {
                    this.particles.push(new Particle(
                        this.rock.x + Math.random() * 40 - 20,
                        this.rock.y + Math.random() * 40 - 20,
                        '#ffff00'
                    ));
                }
            }
            
            if (this.swingCount >= this.maxSwings) {
                this.state = 'exploding';
                this.stateTime = 0;
                this.rock.explode();
                this.screenShake = 20;
                
                if (typeof audioManager !== 'undefined') {
                    audioManager.playRockBreak();
                }
                
                if (this.particlesEnabled) {
                    for (let i = 0; i < 15; i++) {
                        this.particles.push(new Particle(
                            this.rock.x + Math.random() * 60 - 30,
                            this.rock.y + Math.random() * 60 - 30,
                            ['#ffff00', '#ff6b6b', '#ffd700'][Math.floor(Math.random() * 3)]
                        ));
                    }
                }
            } else {
                this.stateTime = 0;
            }
        }
    }

    updateExploding(deltaTime) {
        if (this.stateTime > 1000) {
            this.state = 'revealing';
            this.stateTime = 0;
            this.miner.setState('idle');
        }
    }

    updateRevealing(deltaTime) {
        this.textOpacity = Math.min(1, this.stateTime / 1000);
        
        if (this.stateTime > 2000) {
            this.state = 'celebrating';
            this.stateTime = 0;
            
            if (typeof audioManager !== 'undefined') {
                audioManager.playSuccess();
            }
        }
    }

    updateCelebrating(deltaTime) {
        this.miner.y = this.height / 2 + Math.sin(this.stateTime * 0.01) * 10;
        
        if (this.stateTime > 2000) {
            this.state = 'complete';
            if (this.onComplete) {
                this.onComplete();
            }
        }
    }

    draw() {
        const shakeX = this.screenShake ? (Math.random() - 0.5) * this.screenShake : 0;
        const shakeY = this.screenShake ? (Math.random() - 0.5) * this.screenShake : 0;
        
        this.ctx.save();
        this.ctx.translate(shakeX, shakeY);
        
        this.drawBackground();
        
        if (this.rock) this.rock.draw(this.ctx);
        if (this.miner) this.miner.draw(this.ctx);
        
        for (const particle of this.particles) {
            particle.draw(this.ctx);
        }
        
        if (this.textOpacity > 0) {
            this.drawStudentName();
        }
        
        this.ctx.restore();
    }

    drawBackground() {
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.height);
        gradient.addColorStop(0, '#1a1a2e');
        gradient.addColorStop(1, '#16213e');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        this.ctx.fillStyle = '#3d4758';
        this.ctx.fillRect(0, this.height - 100, this.width, 100);
        
        for (let i = 0; i < this.width; i += 40) {
            this.ctx.fillStyle = '#2c3440';
            this.ctx.fillRect(i, this.height - 100, 2, 100);
        }
        
        for (let i = 0; i < 50; i++) {
            const x = Math.sin(i * 12345) * this.width;
            const y = Math.sin(i * 67890) * (this.height - 100);
            const brightness = Math.sin(i * 34567) * 0.5 + 0.5;
            
            this.ctx.fillStyle = `rgba(255, 255, 255, ${brightness * 0.3})`;
            this.ctx.fillRect(x, y, 2, 2);
        }
    }

    drawStudentName() {
        this.ctx.save();
        this.ctx.globalAlpha = this.textOpacity;
        
        const gradient = this.ctx.createLinearGradient(
            this.width / 2 - 100, 0,
            this.width / 2 + 100, 0
        );
        gradient.addColorStop(0, '#fbbf24');
        gradient.addColorStop(0.5, '#ffd700');
        gradient.addColorStop(1, '#fbbf24');
        
        this.ctx.fillStyle = gradient;
        this.ctx.font = 'bold 32px "Press Start 2P", monospace';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        
        this.ctx.shadowColor = '#000000';
        this.ctx.shadowBlur = 10;
        this.ctx.shadowOffsetX = 3;
        this.ctx.shadowOffsetY = 3;
        
        const displayLength = Math.floor(this.textOpacity * this.selectedStudent.length);
        const displayText = this.selectedStudent.substring(0, displayLength);
        
        this.ctx.fillText(displayText, this.width / 2, this.height / 2);
        
        this.ctx.shadowBlur = 0;
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '14px "Press Start 2P", monospace';
        this.ctx.fillText('SELECTED!', this.width / 2, this.height / 2 + 40);
        
        this.ctx.restore();
    }

    setSpeedMultiplier(value) {
        this.speedMultiplier = value;
    }

    setParticlesEnabled(enabled) {
        this.particlesEnabled = enabled;
    }
}

class Particle {
    constructor(x, y, color = '#ffffff') {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 10;
        this.vy = Math.random() * -15 - 5;
        this.size = Math.random() * 6 + 2;
        this.color = color;
        this.life = 1500;
        this.maxLife = 1500;
        this.gravity = 0.5;
    }

    update(deltaTime) {
        this.x += this.vx * deltaTime * 0.06;
        this.y += this.vy * deltaTime * 0.06;
        this.vy += this.gravity;
        this.life -= deltaTime;
        this.size *= 0.98;
    }

    draw(ctx) {
        if (this.life <= 0) return;
        
        ctx.save();
        ctx.globalAlpha = this.life / this.maxLife;
        ctx.fillStyle = this.color;
        
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 10;
        
        ctx.fillRect(
            this.x - this.size / 2,
            this.y - this.size / 2,
            this.size,
            this.size
        );
        ctx.restore();
    }
}

window.AnimationSystem = {
    MiningAnimation,
    PixelMiner,
    Rock,
    Particle
};