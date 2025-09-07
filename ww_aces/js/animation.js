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

class Bomber extends Sprite {
    constructor(x, y, id) {
        super(x, y, 80, 40);
        this.id = id;
        this.speed = 0.8 + Math.random() * 0.3;
        this.bobAmount = 0;
        this.bobSpeed = 0.002 + Math.random() * 0.001;
        this.propellerAngle = 0;
        this.hit = false;
        this.smoking = false;
        this.crashing = false;
        this.crashVelocityY = 0;
        this.smokeParticles = [];
        this.fireParticles = [];
    }

    update(deltaTime) {
        if (!this.crashing) {
            this.x += this.speed * deltaTime * 0.06;
            this.bobAmount += this.bobSpeed * deltaTime;
            this.y += Math.sin(this.bobAmount) * 0.5;
        } else {
            this.x += this.speed * deltaTime * 0.03;
            this.crashVelocityY += 0.3;
            this.y += this.crashVelocityY;
            this.rotation += 0.02;
            
            for (let i = 0; i < 2; i++) {
                this.fireParticles.push({
                    x: (Math.random() - 0.5) * this.width,
                    y: (Math.random() - 0.5) * this.height,
                    vx: (Math.random() - 0.5) * 2,
                    vy: Math.random() * -3 - 1,
                    size: Math.random() * 8 + 4,
                    life: 1000,
                    color: ['#ff6b1a', '#ff8c1a', '#ffaa1a'][Math.floor(Math.random() * 3)]
                });
            }
        }
        
        this.propellerAngle += deltaTime * 0.02;
        
        if (this.smoking || this.crashing) {
            this.smokeParticles.push({
                x: this.width / 2 + 10,  // Changed to trail behind flipped plane
                y: 0,
                vx: this.speed * 30,  // Changed to positive for trailing smoke
                vy: Math.random() * -2,
                size: Math.random() * 15 + 10,
                life: 2000,
                maxLife: 2000
            });
        }
        
        for (let i = this.smokeParticles.length - 1; i >= 0; i--) {
            const p = this.smokeParticles[i];
            p.x += p.vx * deltaTime * 0.001;
            p.y += p.vy * deltaTime * 0.06;
            p.size *= 1.01;
            p.life -= deltaTime;
            
            if (p.life <= 0) {
                this.smokeParticles.splice(i, 1);
            }
        }
        
        for (let i = this.fireParticles.length - 1; i >= 0; i--) {
            const p = this.fireParticles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.1;
            p.life -= deltaTime;
            p.size *= 0.98;
            
            if (p.life <= 0) {
                this.fireParticles.splice(i, 1);
            }
        }
    }

    render(ctx) {
        ctx.translate(-this.width / 2, -this.height / 2);
        
        // Flip the plane horizontally to face left
        ctx.scale(-1, 1);
        ctx.translate(-this.width, 0);
        
        this.drawSmokeTrail(ctx);
        
        this.drawFuselage(ctx);
        this.drawWings(ctx);
        this.drawTail(ctx);
        this.drawPropellers(ctx);
        this.drawMarkings(ctx);
        
        if (this.crashing) {
            this.drawFire(ctx);
        }
    }

    drawFuselage(ctx) {
        const gradient = ctx.createLinearGradient(0, 10, 0, 30);
        gradient.addColorStop(0, '#4a5568');
        gradient.addColorStop(1, '#2d3748');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.ellipse(40, 20, 35, 8, 0, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#1a202c';
        ctx.fillRect(8, 16, 8, 8);
        ctx.fillRect(18, 16, 6, 6);
        ctx.fillRect(26, 16, 6, 6);
    }

    drawWings(ctx) {
        ctx.fillStyle = '#4a5568';
        ctx.fillRect(25, 5, 30, 30);
        
        ctx.fillStyle = '#2d3748';
        ctx.fillRect(25, 25, 30, 10);
        
        ctx.fillStyle = '#e53e3e';
        ctx.beginPath();
        ctx.arc(30, 20, 3, 0, Math.PI * 2);
        ctx.arc(50, 20, 3, 0, Math.PI * 2);
        ctx.fill();
    }

    drawTail(ctx) {
        ctx.fillStyle = '#4a5568';
        ctx.beginPath();
        ctx.moveTo(65, 20);
        ctx.lineTo(75, 15);
        ctx.lineTo(75, 25);
        ctx.closePath();
        ctx.fill();
        
        ctx.fillStyle = '#2d3748';
        ctx.beginPath();
        ctx.moveTo(70, 20);
        ctx.lineTo(78, 10);
        ctx.lineTo(78, 20);
        ctx.closePath();
        ctx.fill();
    }

    drawPropellers(ctx) {
        const props = [
            { x: 15, y: 10 },
            { x: 15, y: 30 }
        ];
        
        for (const prop of props) {
            ctx.save();
            ctx.translate(prop.x, prop.y);
            ctx.rotate(this.propellerAngle);
            
            ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
            ctx.fillRect(-1, -8, 2, 16);
            ctx.fillRect(-8, -1, 16, 2);
            
            ctx.restore();
        }
    }

    drawMarkings(ctx) {
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 8px monospace';
        ctx.fillText(`B${this.id}`, 35, 23);
    }

    drawSmokeTrail(ctx) {
        for (const p of this.smokeParticles) {
            const alpha = (p.life / p.maxLife) * 0.4;
            ctx.fillStyle = `rgba(50, 50, 50, ${alpha})`;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    drawFire(ctx) {
        for (const p of this.fireParticles) {
            const alpha = p.life / 1000;
            ctx.fillStyle = p.color;
            ctx.globalAlpha = alpha;
            ctx.fillRect(p.x - p.size/2, p.y - p.size/2, p.size, p.size);
        }
        ctx.globalAlpha = 1;
    }

    takeHit() {
        this.hit = true;
        this.smoking = true;
    }

    crash() {
        this.crashing = true;
        this.crashVelocityY = 1;
    }
}

class AAGun extends Sprite {
    constructor(x, y) {
        super(x, y, 40, 30);
        this.barrelAngle = -Math.PI / 4;
        this.targetAngle = -Math.PI / 4;
        this.muzzleFlash = 0;
        this.shells = [];
    }

    update(deltaTime) {
        const angleDiff = this.targetAngle - this.barrelAngle;
        this.barrelAngle += angleDiff * 0.05;
        
        if (this.muzzleFlash > 0) {
            this.muzzleFlash -= deltaTime;
        }
        
        for (let i = this.shells.length - 1; i >= 0; i--) {
            const shell = this.shells[i];
            shell.x += shell.vx * deltaTime * 0.06;
            shell.y += shell.vy * deltaTime * 0.06;
            shell.life -= deltaTime;
            
            if (shell.life <= 0) {
                this.shells.splice(i, 1);
            }
        }
    }

    aimAt(targetX, targetY) {
        const dx = targetX - this.x;
        const dy = targetY - this.y;
        this.targetAngle = Math.atan2(dy, dx);
    }

    fire() {
        this.muzzleFlash = 100;
        
        const speed = 15;
        this.shells.push({
            x: this.x + Math.cos(this.barrelAngle) * 30,
            y: this.y + Math.sin(this.barrelAngle) * 30,
            vx: Math.cos(this.barrelAngle) * speed,
            vy: Math.sin(this.barrelAngle) * speed,
            life: 1000
        });
    }

    render(ctx) {
        ctx.translate(-this.width / 2, -this.height / 2);
        
        this.drawBase(ctx);
        this.drawBarrel(ctx);
        this.drawShells(ctx);
        
        if (this.muzzleFlash > 0) {
            this.drawMuzzleFlash(ctx);
        }
    }

    drawBase(ctx) {
        ctx.fillStyle = '#2d4a2d';
        ctx.fillRect(10, 20, 20, 10);
        
        ctx.fillStyle = '#3d5a3d';
        ctx.beginPath();
        ctx.arc(20, 20, 8, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#1a2a1a';
        ctx.fillRect(5, 28, 30, 2);
    }

    drawBarrel(ctx) {
        ctx.save();
        ctx.translate(20, 20);
        ctx.rotate(this.barrelAngle);
        
        ctx.fillStyle = '#1a2a1a';
        ctx.fillRect(0, -3, 25, 6);
        
        ctx.fillStyle = '#2d4a2d';
        ctx.fillRect(0, -2, 25, 4);
        
        ctx.restore();
    }

    drawShells(ctx) {
        ctx.fillStyle = '#ffff00';
        for (const shell of this.shells) {
            ctx.fillRect(shell.x - this.x + 18, shell.y - this.y + 18, 4, 4);
        }
    }

    drawMuzzleFlash(ctx) {
        ctx.save();
        ctx.translate(20, 20);
        ctx.rotate(this.barrelAngle);
        
        const gradient = ctx.createRadialGradient(25, 0, 0, 25, 0, 15);
        gradient.addColorStop(0, 'rgba(255, 255, 100, 0.8)');
        gradient.addColorStop(1, 'rgba(255, 200, 0, 0)');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(20, -10, 20, 20);
        
        ctx.restore();
    }
}

class Explosion {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.particles = [];
        this.shockwave = 0;
        this.maxShockwave = 100;
        this.fireIntensity = 1;
        this.complete = false;
        
        for (let i = 0; i < 30; i++) {
            const angle = (Math.PI * 2 * i) / 30;
            const speed = Math.random() * 10 + 5;
            this.particles.push({
                x: 0,
                y: 0,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: Math.random() * 15 + 10,
                life: 1500,
                color: ['#ff6b1a', '#ff8c1a', '#ffaa1a', '#ff4444'][Math.floor(Math.random() * 4)]
            });
        }
    }

    update(deltaTime) {
        this.shockwave += deltaTime * 0.1;
        this.fireIntensity *= 0.98;
        
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx * deltaTime * 0.06;
            p.y += p.vy * deltaTime * 0.06;
            p.vx *= 0.98;
            p.vy *= 0.98;
            p.vy += 0.1;
            p.life -= deltaTime;
            p.size *= 0.97;
            
            if (p.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
        
        if (this.particles.length === 0 && this.shockwave >= this.maxShockwave) {
            this.complete = true;
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        
        if (this.shockwave < this.maxShockwave) {
            ctx.strokeStyle = `rgba(255, 255, 255, ${1 - this.shockwave / this.maxShockwave})`;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(0, 0, this.shockwave, 0, Math.PI * 2);
            ctx.stroke();
        }
        
        for (const p of this.particles) {
            const alpha = p.life / 1500;
            ctx.fillStyle = p.color;
            ctx.globalAlpha = alpha * this.fireIntensity;
            ctx.fillRect(p.x - p.size/2, p.y - p.size/2, p.size, p.size);
        }
        
        ctx.restore();
    }
}

class Forest {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.trees = [];
        
        for (let i = 0; i < 30; i++) {
            this.trees.push({
                x: Math.random() * width,
                y: height - 80 + Math.random() * 60,
                size: Math.random() * 20 + 15,
                color: ['#2d5a2d', '#3d6a3d', '#2d4a2d'][Math.floor(Math.random() * 3)]
            });
        }
        
        this.trees.sort((a, b) => a.y - b.y);
    }

    draw(ctx) {
        for (const tree of this.trees) {
            ctx.fillStyle = tree.color;
            ctx.beginPath();
            ctx.moveTo(tree.x, tree.y);
            ctx.lineTo(tree.x - tree.size/2, tree.y + tree.size);
            ctx.lineTo(tree.x + tree.size/2, tree.y + tree.size);
            ctx.closePath();
            ctx.fill();
            
            ctx.fillStyle = '#3d2a1a';
            ctx.fillRect(tree.x - 2, tree.y + tree.size, 4, 10);
        }
    }
}

class MissionAnimation {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.width = canvas.width;
        this.height = canvas.height;
        
        this.bombers = [];
        this.aaGuns = [];
        this.explosions = [];
        this.forest = null;
        this.clouds = [];
        
        this.state = 'idle';
        this.stateTime = 0;
        this.selectedPilot = '';
        this.onComplete = null;
        this.speedMultiplier = 1;
        this.effectsEnabled = true;
        
        this.hitSequence = [];
        this.currentHitIndex = 0;
        this.lastFireTime = 0;
        this.fireInterval = 800;
        
        this.crashedBomber = null;
        this.nameRevealOpacity = 0;
        this.flameParticles = [];
    }

    start(pilotName, onComplete) {
        this.selectedPilot = pilotName;
        this.onComplete = onComplete;
        this.state = 'flying';
        this.stateTime = 0;
        this.currentHitIndex = 0;
        this.lastFireTime = 0;
        this.nameRevealOpacity = 0;
        this.crashedBomber = null;
        this.flameParticles = [];
        
        this.bombers = [
            new Bomber(-100, 100, 1),
            new Bomber(-250, 120, 2),
            new Bomber(-400, 90, 3)
        ];
        
        this.aaGuns = [
            new AAGun(200, this.height - 50),
            new AAGun(500, this.height - 50),
            new AAGun(700, this.height - 50)
        ];
        
        this.forest = new Forest(this.width, this.height);
        
        this.clouds = [];
        for (let i = 0; i < 5; i++) {
            this.clouds.push({
                x: Math.random() * this.width,
                y: Math.random() * 150,
                width: Math.random() * 100 + 50,
                height: Math.random() * 30 + 20,
                speed: Math.random() * 0.2 + 0.1
            });
        }
        
        this.hitSequence = [
            { bomberId: 0, time: 4000, survives: true },
            { bomberId: 1, time: 7000, survives: true },
            { bomberId: 2, time: 10000, survives: false }
        ];
    }

    skip() {
        if (this.state !== 'complete' && this.state !== 'idle') {
            this.state = 'revealing';
            this.stateTime = 1000;
            this.nameRevealOpacity = 1;
        }
    }

    update(deltaTime) {
        deltaTime *= this.speedMultiplier;
        
        this.stateTime += deltaTime;
        
        for (const cloud of this.clouds) {
            cloud.x += cloud.speed;
            if (cloud.x > this.width + cloud.width) {
                cloud.x = -cloud.width;
            }
        }
        
        for (const bomber of this.bombers) {
            bomber.update(deltaTime);
        }
        
        for (const gun of this.aaGuns) {
            gun.update(deltaTime);
        }
        
        for (let i = this.explosions.length - 1; i >= 0; i--) {
            this.explosions[i].update(deltaTime);
            if (this.explosions[i].complete) {
                this.explosions.splice(i, 1);
            }
        }
        
        for (let i = this.flameParticles.length - 1; i >= 0; i--) {
            const p = this.flameParticles[i];
            p.y -= 2;
            p.life -= deltaTime;
            p.size *= 0.98;
            if (p.life <= 0) {
                this.flameParticles.splice(i, 1);
            }
        }
        
        switch (this.state) {
            case 'flying':
                this.updateFlying(deltaTime);
                break;
            case 'crashing':
                this.updateCrashing(deltaTime);
                break;
            case 'revealing':
                this.updateRevealing(deltaTime);
                break;
        }
    }

    updateFlying(deltaTime) {
        if (this.stateTime - this.lastFireTime > this.fireInterval) {
            this.fireAAGuns();
            this.lastFireTime = this.stateTime;
        }
        
        if (this.currentHitIndex < this.hitSequence.length) {
            const hit = this.hitSequence[this.currentHitIndex];
            if (this.stateTime > hit.time) {
                const bomber = this.bombers[hit.bomberId];
                bomber.takeHit();
                
                if (!hit.survives) {
                    bomber.crash();
                    this.crashedBomber = bomber;
                    this.state = 'crashing';
                    this.stateTime = 0;
                    
                    if (typeof audioManager !== 'undefined') {
                        audioManager.playCrash();
                    }
                } else {
                    if (typeof audioManager !== 'undefined') {
                        audioManager.playHit();
                    }
                }
                
                this.currentHitIndex++;
            }
        }
        
        const allBombersGone = this.bombers.every(b => b.x > this.width + 100);
        if (allBombersGone && this.currentHitIndex >= this.hitSequence.length) {
            this.state = 'complete';
            if (this.onComplete) this.onComplete();
        }
    }

    updateCrashing(deltaTime) {
        if (this.crashedBomber && this.crashedBomber.y > this.height - 100) {
            this.explosions.push(new Explosion(this.crashedBomber.x, this.height - 80));
            this.crashedBomber.visible = false;
            this.state = 'revealing';
            this.stateTime = 0;
            
            if (typeof audioManager !== 'undefined') {
                audioManager.playExplosion();
            }
            
            for (let i = 0; i < 20; i++) {
                this.flameParticles.push({
                    x: this.crashedBomber.x + (Math.random() - 0.5) * 60,
                    y: this.height - 80,
                    size: Math.random() * 20 + 10,
                    life: 3000,
                    color: ['#ff6b1a', '#ff8c1a', '#ffaa1a'][Math.floor(Math.random() * 3)]
                });
            }
        }
    }

    updateRevealing(deltaTime) {
        this.nameRevealOpacity = Math.min(1, this.stateTime / 1500);
        
        if (this.stateTime > 1000 && Math.random() < 0.3) {
            this.flameParticles.push({
                x: this.crashedBomber.x + (Math.random() - 0.5) * 40,
                y: this.height - 80,
                size: Math.random() * 15 + 5,
                life: 2000,
                color: ['#ff6b1a', '#ff8c1a', '#ffaa1a'][Math.floor(Math.random() * 3)]
            });
        }
        
        if (this.stateTime > 4000) {
            this.state = 'complete';
            if (this.onComplete) this.onComplete();
        }
    }

    fireAAGuns() {
        for (const gun of this.aaGuns) {
            const targetBomber = this.bombers[Math.floor(Math.random() * this.bombers.length)];
            if (targetBomber && !targetBomber.crashing) {
                gun.aimAt(targetBomber.x, targetBomber.y);
                gun.fire();
                
                if (typeof audioManager !== 'undefined') {
                    audioManager.playAAGun();
                }
            }
        }
    }

    draw() {
        this.drawSky();
        this.drawClouds();
        this.forest.draw(this.ctx);
        
        for (const gun of this.aaGuns) {
            gun.draw(this.ctx);
        }
        
        for (const bomber of this.bombers) {
            bomber.draw(this.ctx);
        }
        
        for (const explosion of this.explosions) {
            explosion.draw(this.ctx);
        }
        
        this.drawFlames();
        
        if (this.nameRevealOpacity > 0) {
            this.drawPilotName();
        }
    }

    drawSky() {
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.height);
        gradient.addColorStop(0, '#87CEEB');
        gradient.addColorStop(0.5, '#98D8E8');
        gradient.addColorStop(1, '#B0E0E6');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.width, this.height);
    }

    drawClouds() {
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        for (const cloud of this.clouds) {
            this.ctx.beginPath();
            this.ctx.ellipse(cloud.x, cloud.y, cloud.width/2, cloud.height/2, 0, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }

    drawFlames() {
        for (const p of this.flameParticles) {
            const alpha = p.life / 3000;
            this.ctx.fillStyle = p.color;
            this.ctx.globalAlpha = alpha;
            this.ctx.fillRect(p.x - p.size/2, p.y - p.size/2, p.size, p.size);
        }
        this.ctx.globalAlpha = 1;
    }

    drawPilotName() {
        this.ctx.save();
        this.ctx.globalAlpha = this.nameRevealOpacity;
        
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, this.height/2 - 60, this.width, 120);
        
        const gradient = this.ctx.createLinearGradient(
            this.width/2 - 150, 0,
            this.width/2 + 150, 0
        );
        gradient.addColorStop(0, '#ff6b1a');
        gradient.addColorStop(0.5, '#ffaa1a');
        gradient.addColorStop(1, '#ff6b1a');
        
        this.ctx.fillStyle = gradient;
        this.ctx.font = 'bold 48px "Bebas Neue", sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        
        this.ctx.shadowColor = '#ff6b1a';
        this.ctx.shadowBlur = 20;
        
        this.ctx.fillText(this.selectedPilot, this.width/2, this.height/2);
        
        this.ctx.font = '20px "Courier Prime", monospace';
        this.ctx.fillStyle = '#ffaa1a';
        this.ctx.shadowBlur = 10;
        this.ctx.fillText('SELECTED', this.width/2, this.height/2 + 40);
        
        this.ctx.restore();
    }

    setSpeedMultiplier(value) {
        this.speedMultiplier = value;
    }

    setEffectsEnabled(enabled) {
        this.effectsEnabled = enabled;
    }
}

window.AnimationSystem = {
    MissionAnimation,
    Bomber,
    AAGun,
    Explosion,
    Forest
};