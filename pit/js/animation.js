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

class Runner extends Sprite {
    constructor(x, y) {
        super(x, y, 48, 48);
        this.frame = 0;
        this.animationTime = 0;
        this.state = 'running';
        this.jumpVelocity = 0;
        this.groundY = y;
        this.hasBox = true;
        this.boxDropped = false;
        this.grabbed = false;
        this.grabOffset = 0;
    }

    setState(state) {
        this.state = state;
        this.frame = 0;
        this.animationTime = 0;
    }

    jump() {
        if (this.state === 'running' && this.y >= this.groundY - 5) {
            this.jumpVelocity = -12;
            this.setState('jumping');
            audioManager.playSound('jump');
        }
    }

    update(deltaTime) {
        this.animationTime += deltaTime;
        
        if (this.state === 'running') {
            if (this.animationTime > 100) {
                this.animationTime = 0;
                this.frame = (this.frame + 1) % 6;
                if (this.frame % 3 === 0) {
                    audioManager.playSound('running');
                }
            }
        } else if (this.state === 'jumping') {
            this.jumpVelocity += 0.6;
            this.y += this.jumpVelocity;
            
            if (this.y >= this.groundY) {
                this.y = this.groundY;
                this.setState('running');
            }
        } else if (this.state === 'grabbed') {
            this.grabOffset = Math.sin(this.animationTime * 0.01) * 5;
            if (!this.boxDropped && this.hasBox) {
                this.boxDropped = true;
                this.hasBox = false;
            }
        }
    }

    render(ctx) {
        ctx.translate(-this.width / 2, -this.height / 2);
        
        if (this.state === 'grabbed') {
            this.drawGrabbedRunner(ctx);
        } else {
            this.drawRunningRunner(ctx);
        }
        
        if (this.hasBox) {
            this.drawBox(ctx);
        }
    }

    drawRunningRunner(ctx) {
        const pixelSize = 3;
        const colors = {
            skin: '#fdbcb4',
            hair: '#654321',
            shirt: '#ff0000',
            pants: '#0000ff',
            shoes: '#000000'
        };
        
        const legOffset = this.state === 'jumping' ? 0 : 
                         [0, 3, 6, 3, 0, -3][this.frame];
        const armSwing = this.state === 'jumping' ? -10 : 
                        [0, 5, 10, 5, 0, -5][this.frame];
        
        ctx.fillStyle = colors.hair;
        ctx.fillRect(6 * pixelSize, 2 * pixelSize, 6 * pixelSize, 4 * pixelSize);
        
        ctx.fillStyle = colors.skin;
        ctx.fillRect(6 * pixelSize, 6 * pixelSize, 6 * pixelSize, 5 * pixelSize);
        
        ctx.fillStyle = '#000000';
        ctx.fillRect(8 * pixelSize, 7 * pixelSize, pixelSize, pixelSize);
        ctx.fillRect(10 * pixelSize, 7 * pixelSize, pixelSize, pixelSize);
        
        ctx.fillStyle = colors.shirt;
        ctx.fillRect(5 * pixelSize, 11 * pixelSize, 8 * pixelSize, 6 * pixelSize);
        
        ctx.fillStyle = colors.skin;
        ctx.fillRect(3 * pixelSize, (12 + armSwing / 2) * pixelSize, 2 * pixelSize, 4 * pixelSize);
        ctx.fillRect(13 * pixelSize, (12 - armSwing / 2) * pixelSize, 2 * pixelSize, 4 * pixelSize);
        
        ctx.fillStyle = colors.pants;
        ctx.fillRect(6 * pixelSize, 17 * pixelSize, 6 * pixelSize, 5 * pixelSize);
        
        ctx.fillRect(6 * pixelSize, (22 + Math.abs(legOffset) / 2) * pixelSize, 2 * pixelSize, 4 * pixelSize);
        ctx.fillRect(10 * pixelSize, (22 - Math.abs(legOffset) / 2) * pixelSize, 2 * pixelSize, 4 * pixelSize);
        
        ctx.fillStyle = colors.shoes;
        ctx.fillRect(5 * pixelSize, (26 + Math.abs(legOffset) / 2) * pixelSize, 3 * pixelSize, 2 * pixelSize);
        ctx.fillRect(10 * pixelSize, (26 - Math.abs(legOffset) / 2) * pixelSize, 3 * pixelSize, 2 * pixelSize);
    }

    drawGrabbedRunner(ctx) {
        const pixelSize = 3;
        const colors = {
            skin: '#fdbcb4',
            hair: '#654321',
            shirt: '#ff0000',
            pants: '#0000ff',
            shoes: '#000000'
        };
        
        ctx.save();
        ctx.translate(0, this.grabOffset);
        
        ctx.fillStyle = colors.hair;
        ctx.fillRect(6 * pixelSize, 2 * pixelSize, 6 * pixelSize, 4 * pixelSize);
        
        ctx.fillStyle = colors.skin;
        ctx.fillRect(6 * pixelSize, 6 * pixelSize, 6 * pixelSize, 5 * pixelSize);
        
        ctx.fillStyle = '#000000';
        ctx.fillRect(7 * pixelSize, 7 * pixelSize, pixelSize, pixelSize);
        ctx.fillRect(10 * pixelSize, 7 * pixelSize, pixelSize, pixelSize);
        ctx.fillRect(8 * pixelSize, 9 * pixelSize, 2 * pixelSize, pixelSize);
        
        ctx.fillStyle = colors.shirt;
        ctx.fillRect(5 * pixelSize, 11 * pixelSize, 8 * pixelSize, 6 * pixelSize);
        
        ctx.fillStyle = colors.skin;
        ctx.fillRect(2 * pixelSize, 8 * pixelSize, 3 * pixelSize, 3 * pixelSize);
        ctx.fillRect(13 * pixelSize, 8 * pixelSize, 3 * pixelSize, 3 * pixelSize);
        
        ctx.fillStyle = colors.pants;
        ctx.fillRect(6 * pixelSize, 17 * pixelSize, 6 * pixelSize, 5 * pixelSize);
        ctx.fillRect(5 * pixelSize, 22 * pixelSize, 3 * pixelSize, 5 * pixelSize);
        ctx.fillRect(10 * pixelSize, 22 * pixelSize, 3 * pixelSize, 5 * pixelSize);
        
        ctx.fillStyle = colors.shoes;
        ctx.fillRect(4 * pixelSize, 27 * pixelSize, 4 * pixelSize, 2 * pixelSize);
        ctx.fillRect(10 * pixelSize, 27 * pixelSize, 4 * pixelSize, 2 * pixelSize);
        
        ctx.restore();
    }

    drawBox(ctx) {
        const pixelSize = 3;
        const boxX = this.hasBox ? 14 * pixelSize : this.x;
        const boxY = this.hasBox ? 10 * pixelSize : this.y + 20;
        
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(boxX, boxY, 8 * pixelSize, 8 * pixelSize);
        
        ctx.strokeStyle = '#654321';
        ctx.lineWidth = 1;
        ctx.strokeRect(boxX, boxY, 8 * pixelSize, 8 * pixelSize);
        
        ctx.fillStyle = '#654321';
        ctx.fillRect(boxX + 3 * pixelSize, boxY + pixelSize, 2 * pixelSize, 6 * pixelSize);
        ctx.fillRect(boxX + pixelSize, boxY + 3 * pixelSize, 6 * pixelSize, 2 * pixelSize);
    }
}

class Obstacle extends Sprite {
    constructor(x, y, type) {
        super(x, y, 64, 64);
        this.type = type;
        this.animationTime = 0;
        this.frame = 0;
    }

    update(deltaTime) {
        this.animationTime += deltaTime;
        
        if (this.type === 'fire') {
            if (this.animationTime > 150) {
                this.animationTime = 0;
                this.frame = (this.frame + 1) % 4;
            }
        } else if (this.type === 'tiger') {
            if (this.animationTime > 200) {
                this.animationTime = 0;
                this.frame = (this.frame + 1) % 2;
            }
        }
    }

    render(ctx) {
        ctx.translate(-this.width / 2, -this.height / 2);
        
        switch(this.type) {
            case 'pit':
                this.drawPit(ctx);
                break;
            case 'fire':
                this.drawFire(ctx);
                break;
            case 'tiger':
                this.drawTiger(ctx);
                break;
        }
    }

    drawPit(ctx) {
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 40, 64, 24);
        
        ctx.strokeStyle = '#444444';
        ctx.lineWidth = 2;
        ctx.strokeRect(0, 40, 64, 24);
    }

    drawFire(ctx) {
        const colors = ['#ff0000', '#ff6600', '#ffaa00', '#ffff00'];
        const pixelSize = 4;
        
        for (let i = 0; i < 8; i++) {
            const height = 4 + Math.sin((this.frame + i) * 0.5) * 2;
            const color = colors[Math.floor(Math.random() * colors.length)];
            ctx.fillStyle = color;
            ctx.fillRect(i * 8, 64 - height * pixelSize, 6, height * pixelSize);
        }
    }

    drawTiger(ctx) {
        const pixelSize = 3;
        
        ctx.fillStyle = '#ff8800';
        ctx.fillRect(10 * pixelSize, 12 * pixelSize, 12 * pixelSize, 8 * pixelSize);
        
        ctx.fillStyle = '#000000';
        for (let i = 0; i < 3; i++) {
            ctx.fillRect((11 + i * 3) * pixelSize, 13 * pixelSize, pixelSize, 6 * pixelSize);
        }
        
        ctx.fillStyle = '#ff8800';
        ctx.fillRect(6 * pixelSize, 14 * pixelSize, 4 * pixelSize, 6 * pixelSize);
        
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(7 * pixelSize, 15 * pixelSize, pixelSize, pixelSize);
        ctx.fillRect(9 * pixelSize, 15 * pixelSize, pixelSize, pixelSize);
        
        ctx.fillStyle = '#000000';
        ctx.fillRect(7 * pixelSize, 18 * pixelSize, 3 * pixelSize, pixelSize);
        
        const tailWag = this.frame === 0 ? -2 : 2;
        ctx.fillStyle = '#ff8800';
        ctx.fillRect((22 + tailWag) * pixelSize, 10 * pixelSize, 3 * pixelSize, 8 * pixelSize);
    }
}

class Tentacle extends Sprite {
    constructor(x, y) {
        super(x, y, 100, 200);
        this.segments = [];
        this.animationTime = 0;
        this.grabbing = false;
        this.extension = 0;  // How far the tentacle extends upward
        this.maxExtension = 300;
        this.baseY = y;
        
        for (let i = 0; i < 12; i++) {
            this.segments.push({
                x: 0,
                y: i * 15,
                angle: 0,
                width: 30 - i * 2
            });
        }
    }

    startGrab() {
        this.grabbing = true;
        audioManager.playSound('tentacle');
    }

    update(deltaTime) {
        this.animationTime += deltaTime;
        
        if (this.grabbing && this.extension < this.maxExtension) {
            this.extension += 8;
        }
        
        for (let i = 0; i < this.segments.length; i++) {
            const waveAmount = this.grabbing ? 0.5 : 0.15;
            this.segments[i].angle = Math.sin(this.animationTime * 0.004 + i * 0.4) * waveAmount;
            this.segments[i].x = Math.sin(this.animationTime * 0.003 + i * 0.3) * (20 + i * 3);
        }
    }

    render(ctx) {
        ctx.translate(-this.width / 2, -this.height / 2);
        
        const pixelSize = 3;
        const visibleSegments = Math.min(this.segments.length, Math.floor(this.extension / 25) + 1);
        
        // Draw from bottom to top, keeping base anchored at ground
        for (let i = 0; i < visibleSegments; i++) {
            const segment = this.segments[i];
            const width = segment.width;
            
            ctx.save();
            // Base stays at y=200 (ground level), segments extend upward
            const segmentY = 200 - i * (this.extension / this.segments.length);
            ctx.translate(50 + segment.x, segmentY);
            ctx.rotate(segment.angle);
            
            // Outer dark purple
            ctx.fillStyle = '#330066';
            ctx.fillRect(-width * pixelSize / 2, -15, width * pixelSize, 30);
            
            // Middle purple
            ctx.fillStyle = '#6600cc';
            ctx.fillRect(-width * pixelSize / 2 + 3, -12, width * pixelSize - 6, 24);
            
            // Inner light purple
            ctx.fillStyle = '#9933ff';
            ctx.fillRect(-width * pixelSize / 2 + 6, -9, width * pixelSize - 12, 18);
            
            // Suction cups
            if (i % 2 === 0 && i > 0) {
                ctx.fillStyle = '#ff00ff';
                for (let j = 0; j < 3; j++) {
                    ctx.beginPath();
                    ctx.arc(-width * pixelSize / 2 + 20 + j * 20, 0, 5, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.strokeStyle = '#cc00cc';
                    ctx.lineWidth = 2;
                    ctx.stroke();
                }
            }
            
            ctx.restore();
        }
    }
}

class Box extends Sprite {
    constructor(x, y) {
        super(x, y, 32, 32);
        this.velocityY = 0;
        this.broken = false;
        this.pieces = [];
    }

    drop() {
        this.velocityY = 2;
    }

    break() {
        this.broken = true;
        audioManager.playSound('crash');
        
        for (let i = 0; i < 8; i++) {
            this.pieces.push({
                x: this.x + Math.random() * 32 - 16,
                y: this.y + Math.random() * 32 - 16,
                vx: (Math.random() - 0.5) * 5,
                vy: -Math.random() * 5 - 2,
                size: Math.random() * 10 + 5,
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.2
            });
        }
    }

    update(deltaTime) {
        if (!this.broken) {
            this.velocityY += 0.5;
            this.y += this.velocityY;
            
            if (this.y >= 400) {
                this.y = 400;
                this.break();
            }
        } else {
            for (let piece of this.pieces) {
                piece.x += piece.vx;
                piece.y += piece.vy;
                piece.vy += 0.3;
                piece.rotation += piece.rotationSpeed;
            }
        }
    }

    render(ctx) {
        if (!this.broken) {
            ctx.translate(-this.width / 2, -this.height / 2);
            
            ctx.fillStyle = '#8B4513';
            ctx.fillRect(0, 0, 32, 32);
            
            ctx.strokeStyle = '#654321';
            ctx.lineWidth = 2;
            ctx.strokeRect(0, 0, 32, 32);
            
            ctx.fillStyle = '#654321';
            ctx.fillRect(12, 4, 8, 24);
            ctx.fillRect(4, 12, 24, 8);
        } else {
            for (let piece of this.pieces) {
                ctx.save();
                ctx.translate(piece.x, piece.y);
                ctx.rotate(piece.rotation);
                ctx.fillStyle = '#8B4513';
                ctx.fillRect(-piece.size / 2, -piece.size / 2, piece.size, piece.size);
                ctx.restore();
            }
        }
    }
}

const AnimationSystem = {
    PitRunnerAnimation: class {
        constructor(canvas) {
            this.canvas = canvas;
            this.ctx = canvas.getContext('2d');
            this.width = canvas.width;
            this.height = canvas.height;
            
            this.runner = null;
            this.obstacles = [];
            this.tentacle = null;
            this.box = null;
            this.backgroundOffset = 0;
            this.particles = [];
            
            this.phase = 'running';
            this.obstaclesPassed = 0;
            this.selectedStudent = null;
            this.animationComplete = false;
            this.skipRequested = false;
            
            this.settings = {
                speed: 1,
                particlesEnabled: true
            };
        }

        start(studentName, settings = {}) {
            this.settings = { ...this.settings, ...settings };
            this.selectedStudent = studentName;
            this.phase = 'running';
            this.animationComplete = false;
            this.skipRequested = false;
            this.obstaclesPassed = 0;
            this.backgroundOffset = 0;
            this.particles = [];
            
            this.runner = new Runner(150, 350);
            this.obstacles = [
                new Obstacle(500, 350, 'pit'),
                new Obstacle(800, 350, 'fire'),
                new Obstacle(1100, 350, 'tiger'),
                new Obstacle(1400, 350, 'pit')
            ];
            this.tentacle = new Tentacle(1400, 400);
            this.box = null;
            
            audioManager.playBackgroundMusic();
        }

        skip() {
            this.skipRequested = true;
        }

        update(deltaTime) {
            if (this.animationComplete) return;
            
            deltaTime *= this.settings.speed;
            
            if (this.skipRequested) {
                this.phase = 'reveal';
                this.runner.setState('grabbed');
                this.runner.hasBox = false;
                if (!this.box) {
                    this.box = new Box(this.runner.x, this.runner.y + 50);
                    this.box.drop();
                }
            }
            
            this.updateBackground(deltaTime);
            this.updateParticles(deltaTime);
            
            if (this.phase === 'running') {
                this.runner.update(deltaTime);
                
                const nextObstacle = this.obstacles[this.obstaclesPassed];
                if (nextObstacle) {
                    if (nextObstacle.x - this.runner.x < 150 && this.runner.state === 'running') {
                        if (this.obstaclesPassed === this.obstacles.length - 1) {
                            // Don't jump over the last pit - fall into it
                        } else {
                            this.runner.jump();
                        }
                    }
                    
                    if (this.obstaclesPassed < this.obstacles.length - 1 && this.runner.x > nextObstacle.x + 50) {
                        this.obstaclesPassed++;
                    } else if (this.obstaclesPassed === this.obstacles.length - 1 && nextObstacle.x <= this.runner.x + 20) {
                        // Runner reaches last pit
                        this.phase = 'grabbed';
                        this.tentacle.x = nextObstacle.x;
                        this.tentacle.startGrab();
                        // Stop scrolling
                        return;
                    }
                }
                
                for (let obstacle of this.obstacles) {
                    obstacle.x -= 3 * this.settings.speed;
                    obstacle.update(deltaTime);
                }
                this.tentacle.x -= 3 * this.settings.speed;
            } else if (this.phase === 'grabbed') {
                this.runner.update(deltaTime);
                this.tentacle.update(deltaTime);
                
                if (this.tentacle.extension >= 200) {
                    this.runner.setState('grabbed');
                    this.runner.y = 400 - this.tentacle.extension;
                    
                    if (!this.box && this.runner.boxDropped) {
                        this.box = new Box(this.runner.x, this.runner.y + 50);
                        this.box.drop();
                        this.phase = 'falling';
                    }
                }
            } else if (this.phase === 'falling') {
                this.runner.update(deltaTime);
                this.tentacle.update(deltaTime);
                this.box.update(deltaTime);
                
                if (this.box.broken) {
                    this.phase = 'reveal';
                    setTimeout(() => {
                        audioManager.playSound('success');
                    }, 500);
                }
            } else if (this.phase === 'reveal') {
                if (this.box) this.box.update(deltaTime);
                this.tentacle.update(deltaTime);
                this.runner.update(deltaTime);
            }
        }

        updateBackground(deltaTime) {
            this.backgroundOffset -= 2 * this.settings.speed;
            if (this.backgroundOffset <= -100) {
                this.backgroundOffset += 100;
            }
        }

        updateParticles(deltaTime) {
            if (this.settings.particlesEnabled && this.phase === 'running') {
                if (Math.random() < 0.02) {
                    this.particles.push({
                        x: this.width,
                        y: Math.random() * 200,
                        vx: -3 - Math.random() * 2,
                        size: Math.random() * 3 + 1,
                        opacity: 0.5 + Math.random() * 0.5
                    });
                }
            }
            
            for (let i = this.particles.length - 1; i >= 0; i--) {
                const p = this.particles[i];
                p.x += p.vx * this.settings.speed;
                
                if (p.x < -10) {
                    this.particles.splice(i, 1);
                }
            }
        }

        draw() {
            this.ctx.fillStyle = '#000033';
            this.ctx.fillRect(0, 0, this.width, this.height);
            
            this.drawBackground();
            this.drawGround();
            
            for (let obstacle of this.obstacles) {
                if (obstacle.x > -100 && obstacle.x < this.width + 100) {
                    obstacle.draw(this.ctx);
                }
            }
            
            if (this.tentacle && (this.phase === 'grabbed' || this.phase === 'falling' || this.phase === 'reveal')) {
                this.tentacle.draw(this.ctx);
            }
            
            if (this.runner && this.phase !== 'falling' && this.phase !== 'reveal') {
                this.runner.draw(this.ctx);
            } else if (this.runner && (this.phase === 'falling' || this.phase === 'reveal')) {
                this.runner.draw(this.ctx);
            }
            
            if (this.box) {
                this.box.draw(this.ctx);
            }
            
            this.drawParticles();
            
            if (this.phase === 'reveal' && this.box && this.box.broken) {
                this.drawStudentName();
            }
        }

        drawBackground() {
            const gradient = this.ctx.createLinearGradient(0, 0, 0, this.height);
            gradient.addColorStop(0, '#000033');
            gradient.addColorStop(0.5, '#000066');
            gradient.addColorStop(1, '#000099');
            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(0, 0, this.width, this.height);
            
            this.ctx.fillStyle = '#ffffff';
            for (let i = 0; i < 50; i++) {
                const x = (i * 73) % this.width;
                const y = (i * 47) % 200;
                const size = (i % 3) + 1;
                this.ctx.fillRect(x, y, size, size);
            }
        }

        drawGround() {
            this.ctx.fillStyle = '#332211';
            this.ctx.fillRect(0, 400, this.width, 100);
            
            this.ctx.fillStyle = '#443322';
            for (let x = this.backgroundOffset; x < this.width; x += 100) {
                this.ctx.fillRect(x, 400, 50, 10);
                this.ctx.fillRect(x + 25, 410, 50, 10);
            }
        }

        drawParticles() {
            for (let p of this.particles) {
                this.ctx.save();
                this.ctx.globalAlpha = p.opacity;
                this.ctx.fillStyle = '#ffff99';
                this.ctx.fillRect(p.x, p.y, p.size, p.size);
                this.ctx.restore();
            }
        }

        drawStudentName() {
            const textRenderer = new UIComponents.TextRenderer();
            
            const glowIntensity = 0.5 + Math.sin(Date.now() * 0.003) * 0.5;
            textRenderer.drawGlowingText(
                this.ctx,
                this.selectedStudent,
                this.width / 2,
                this.height / 2 + 50,
                24,
                '#00ff00',
                glowIntensity
            );
        }

        isComplete() {
            return this.phase === 'reveal' && this.box && this.box.broken;
        }
    }
};