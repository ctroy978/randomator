class Confetti {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.particles = [];
        this.isActive = false;
        this.colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#ffd700', '#ff69b4'];
    }

    start(x, y) {
        this.isActive = true;
        this.createParticles(x, y, 100);
    }

    createParticles(x, y, count) {
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 * i) / count;
            const velocity = 5 + Math.random() * 10;
            
            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * velocity,
                vy: Math.sin(angle) * velocity - Math.random() * 10,
                size: 4 + Math.random() * 4,
                color: this.colors[Math.floor(Math.random() * this.colors.length)],
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.2,
                life: 1,
                decay: 0.01 + Math.random() * 0.01
            });
        }
    }

    update(deltaTime) {
        if (!this.isActive) return;

        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            
            particle.x += particle.vx * deltaTime * 0.06;
            particle.y += particle.vy * deltaTime * 0.06;
            particle.vy += 0.5;
            particle.rotation += particle.rotationSpeed;
            particle.life -= particle.decay;
            
            if (particle.life <= 0 || particle.y > this.canvas.height) {
                this.particles.splice(i, 1);
            }
        }

        if (this.particles.length === 0) {
            this.isActive = false;
        }
    }

    draw(ctx) {
        if (!this.isActive) return;

        this.particles.forEach(particle => {
            ctx.save();
            ctx.translate(particle.x, particle.y);
            ctx.rotate(particle.rotation);
            ctx.globalAlpha = particle.life;
            ctx.fillStyle = particle.color;
            
            ctx.fillRect(-particle.size/2, -particle.size/2, particle.size, particle.size);
            
            ctx.restore();
        });
    }

    burst(count = 3) {
        for (let i = 0; i < count; i++) {
            setTimeout(() => {
                const x = Math.random() * this.canvas.width;
                const y = Math.random() * this.canvas.height / 2;
                this.createParticles(x, y, 50);
            }, i * 200);
        }
        this.isActive = true;
    }

    clear() {
        this.particles = [];
        this.isActive = false;
    }
}