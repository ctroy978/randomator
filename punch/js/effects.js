class Effects {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.particles = [];
        this.impacts = [];
        this.enabled = true;
    }

    setEnabled(enabled) {
        this.enabled = enabled;
        if (!enabled) {
            this.particles = [];
            this.impacts = [];
        }
    }

    addPunchEffect(x, y, hit) {
        if (!this.enabled) return;
        
        if (hit) {
            this.addImpact(x, y);
            this.addSweatParticles(x, y, 10);
            this.addStars(x, y, 3);
        } else {
            this.addSweatParticles(x, y, 5);
        }
    }

    addImpact(x, y) {
        this.impacts.push({
            x,
            y,
            radius: 10,
            maxRadius: 30,
            alpha: 1,
            color: '#ffff00'
        });
    }

    addSweatParticles(x, y, count) {
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
            const speed = 2 + Math.random() * 3;
            
            this.particles.push({
                x,
                y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 2,
                size: 2 + Math.random() * 3,
                alpha: 1,
                color: '#87CEEB',
                gravity: 0.2
            });
        }
    }

    addStars(x, y, count) {
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 * i) / count;
            const radius = 20 + Math.random() * 10;
            
            this.particles.push({
                x: x + Math.cos(angle) * radius,
                y: y + Math.sin(angle) * radius,
                vx: Math.cos(angle) * 0.5,
                vy: Math.sin(angle) * 0.5,
                size: 10,
                alpha: 1,
                color: '#ffff00',
                isStar: true,
                rotation: 0,
                rotationSpeed: 0.1
            });
        }
    }

    addBloodEffect(x, y) {
        if (!this.enabled) return;
        
        for (let i = 0; i < 8; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 1 + Math.random() * 4;
            
            this.particles.push({
                x,
                y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 1,
                size: 3 + Math.random() * 5,
                alpha: 0.8,
                color: '#ff0000',
                gravity: 0.3
            });
        }
    }

    addVictoryConfetti(x, y) {
        if (!this.enabled) return;
        
        const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];
        
        for (let i = 0; i < 30; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 2 + Math.random() * 5;
            
            this.particles.push({
                x,
                y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 5,
                size: 5 + Math.random() * 5,
                alpha: 1,
                color: colors[Math.floor(Math.random() * colors.length)],
                gravity: 0.2,
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: 0.1 + Math.random() * 0.1
            });
        }
    }

    update(deltaTime) {
        if (!this.enabled) return;
        
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            
            particle.x += particle.vx;
            particle.y += particle.vy;
            
            if (particle.gravity) {
                particle.vy += particle.gravity;
            }
            
            particle.alpha -= 0.02;
            
            if (particle.rotation !== undefined) {
                particle.rotation += particle.rotationSpeed;
            }
            
            if (particle.alpha <= 0 || particle.y > this.canvas.height) {
                this.particles.splice(i, 1);
            }
        }
        
        for (let i = this.impacts.length - 1; i >= 0; i--) {
            const impact = this.impacts[i];
            
            impact.radius += 2;
            impact.alpha -= 0.05;
            
            if (impact.radius >= impact.maxRadius || impact.alpha <= 0) {
                this.impacts.splice(i, 1);
            }
        }
    }

    draw(ctx) {
        if (!this.enabled) return;
        
        for (const impact of this.impacts) {
            ctx.save();
            ctx.globalAlpha = impact.alpha;
            ctx.strokeStyle = impact.color;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(impact.x, impact.y, impact.radius, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
        }
        
        for (const particle of this.particles) {
            ctx.save();
            ctx.globalAlpha = particle.alpha;
            ctx.fillStyle = particle.color;
            
            if (particle.isStar) {
                ctx.translate(particle.x, particle.y);
                ctx.rotate(particle.rotation);
                this.drawStar(ctx, 0, 0, particle.size);
            } else if (particle.rotation !== undefined) {
                ctx.translate(particle.x, particle.y);
                ctx.rotate(particle.rotation);
                ctx.fillRect(-particle.size / 2, -particle.size / 2, particle.size, particle.size);
            } else {
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                ctx.fill();
            }
            
            ctx.restore();
        }
    }

    drawStar(ctx, x, y, size) {
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
            const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
            const innerAngle = angle + Math.PI / 5;
            
            if (i === 0) {
                ctx.moveTo(x + Math.cos(angle) * size, y + Math.sin(angle) * size);
            } else {
                ctx.lineTo(x + Math.cos(angle) * size, y + Math.sin(angle) * size);
            }
            
            ctx.lineTo(x + Math.cos(innerAngle) * size * 0.5, y + Math.sin(innerAngle) * size * 0.5);
        }
        ctx.closePath();
        ctx.fill();
    }

    clear() {
        this.particles = [];
        this.impacts = [];
    }
}