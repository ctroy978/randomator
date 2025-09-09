class Ghost {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.x = canvas.width / 2;
        this.y = canvas.height / 2 - 50;
        this.baseY = this.y;
        this.width = 150;
        this.height = 180;
        this.floatOffset = 0;
        this.floatSpeed = 0.002;
        this.opacity = 0;
        this.visible = false;
        this.bagY = this.y + 60;
        
        // Name card properties
        this.nameCard = null;
        this.nameCardX = canvas.width / 2;
        this.nameCardY = canvas.height / 2 + 100;
        this.nameCardVX = 0;
        this.nameCardVY = 0;
        this.nameCardRotation = 0;
        this.nameCardRotationSpeed = 0;
        this.nameCardOpacity = 1;
        this.showNameCard = false;
        
        // Speech bubble
        this.speechText = null;
        this.speechOpacity = 0;
        this.speechTimer = 0;
        
        this.currentPhase = 'idle';
    }

    appear() {
        this.visible = true;
        this.opacity = 0;
        return new Promise(resolve => {
            const fadeIn = () => {
                this.opacity += 0.02;
                if (this.opacity >= 1) {
                    this.opacity = 1;
                    resolve();
                } else {
                    requestAnimationFrame(fadeIn);
                }
            };
            fadeIn();
        });
    }

    update(deltaTime) {
        if (!this.visible) return;
        
        // Floating animation
        this.floatOffset += this.floatSpeed * deltaTime;
        this.y = this.baseY + Math.sin(this.floatOffset) * 10;
        this.bagY = this.y + 60;
        
        // Update name card toss animation
        if (this.currentPhase === 'tossing' && this.showNameCard) {
            this.nameCardX += this.nameCardVX;
            this.nameCardY += this.nameCardVY;
            this.nameCardVY += 0.5; // gravity
            this.nameCardRotation += this.nameCardRotationSpeed;
            this.nameCardOpacity *= 0.98;
            
            // Hide card when it goes off screen
            if (Math.abs(this.nameCardX - this.canvas.width / 2) > this.canvas.width ||
                this.nameCardY > this.canvas.height) {
                this.showNameCard = false;
                this.currentPhase = 'idle';
            }
        }
        
        // Update speech bubble
        if (this.speechTimer > 0) {
            this.speechTimer -= deltaTime;
            if (this.speechTimer <= 0) {
                this.speechText = null;
                this.speechOpacity = 0;
            }
        }
    }

    drawGhost() {
        const ctx = this.ctx;
        ctx.save();
        ctx.globalAlpha = this.opacity;
        
        // Ghost body
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.beginPath();
        // Head
        ctx.arc(this.x, this.y - 30, 60, Math.PI, 0, false);
        // Body with wavy bottom
        ctx.lineTo(this.x + 60, this.y + 40);
        for (let i = 0; i < 4; i++) {
            const waveX = this.x + 60 - (i + 1) * 30;
            const waveY = this.y + 40 + Math.sin(this.floatOffset + i) * 5;
            ctx.quadraticCurveTo(
                waveX + 15, waveY + 10,
                waveX, waveY
            );
        }
        ctx.closePath();
        ctx.fill();
        
        // Ghost glow
        ctx.shadowColor = 'rgba(138, 43, 226, 0.8)';
        ctx.shadowBlur = 30;
        ctx.fill();
        ctx.shadowBlur = 0;
        
        // Eyes
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(this.x - 20, this.y - 35, 8, 0, Math.PI * 2);
        ctx.arc(this.x + 20, this.y - 35, 8, 0, Math.PI * 2);
        ctx.fill();
        
        // Mouth
        ctx.beginPath();
        ctx.arc(this.x, this.y - 15, 15, 0, Math.PI);
        ctx.stroke();
        
        // Arms holding bag
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.lineWidth = 15;
        ctx.lineCap = 'round';
        
        // Left arm
        ctx.beginPath();
        ctx.moveTo(this.x - 40, this.y);
        ctx.quadraticCurveTo(this.x - 50, this.y + 20, this.x - 30, this.bagY - 10);
        ctx.stroke();
        
        // Right arm
        ctx.beginPath();
        ctx.moveTo(this.x + 40, this.y);
        ctx.quadraticCurveTo(this.x + 50, this.y + 20, this.x + 30, this.bagY - 10);
        ctx.stroke();
        
        ctx.restore();
    }

    drawBag() {
        const ctx = this.ctx;
        ctx.save();
        ctx.globalAlpha = this.opacity;
        
        // Bag body
        const gradient = ctx.createLinearGradient(
            this.x - 40, this.bagY,
            this.x + 40, this.bagY + 60
        );
        gradient.addColorStop(0, '#ff6600');
        gradient.addColorStop(1, '#ff8c00');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.moveTo(this.x - 35, this.bagY);
        ctx.lineTo(this.x + 35, this.bagY);
        ctx.lineTo(this.x + 30, this.bagY + 50);
        ctx.quadraticCurveTo(this.x, this.bagY + 55, this.x - 30, this.bagY + 50);
        ctx.closePath();
        ctx.fill();
        
        // Bag handles
        ctx.strokeStyle = '#cc5200';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(this.x - 20, this.bagY);
        ctx.quadraticCurveTo(this.x - 20, this.bagY - 15, this.x - 10, this.bagY);
        ctx.moveTo(this.x + 20, this.bagY);
        ctx.quadraticCurveTo(this.x + 20, this.bagY - 15, this.x + 10, this.bagY);
        ctx.stroke();
        
        // Jack-o'-lantern face on bag
        ctx.fillStyle = '#000';
        ctx.beginPath();
        // Eyes
        ctx.moveTo(this.x - 15, this.bagY + 15);
        ctx.lineTo(this.x - 10, this.bagY + 20);
        ctx.lineTo(this.x - 5, this.bagY + 15);
        ctx.closePath();
        ctx.fill();
        
        ctx.beginPath();
        ctx.moveTo(this.x + 15, this.bagY + 15);
        ctx.lineTo(this.x + 10, this.bagY + 20);
        ctx.lineTo(this.x + 5, this.bagY + 15);
        ctx.closePath();
        ctx.fill();
        
        // Mouth
        ctx.beginPath();
        ctx.moveTo(this.x - 15, this.bagY + 25);
        ctx.quadraticCurveTo(this.x, this.bagY + 35, this.x + 15, this.bagY + 25);
        ctx.lineWidth = 2;
        ctx.stroke();
        
        ctx.restore();
    }

    drawSpeechBubble() {
        if (!this.speechText || this.speechOpacity <= 0) return;
        
        const ctx = this.ctx;
        ctx.save();
        ctx.globalAlpha = this.speechOpacity;
        
        const bubbleX = this.x + 80;
        const bubbleY = this.y - 40;
        const bubbleWidth = 100;
        const bubbleHeight = 50;
        
        // Draw speech bubble
        ctx.fillStyle = '#fff';
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        
        // Bubble body
        ctx.beginPath();
        ctx.roundRect(bubbleX - bubbleWidth/2, bubbleY - bubbleHeight/2, bubbleWidth, bubbleHeight, 10);
        ctx.fill();
        ctx.stroke();
        
        // Bubble tail
        ctx.beginPath();
        ctx.moveTo(bubbleX - 20, bubbleY + bubbleHeight/2 - 5);
        ctx.lineTo(bubbleX - 30, bubbleY + bubbleHeight/2 + 10);
        ctx.lineTo(bubbleX - 10, bubbleY + bubbleHeight/2);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        
        // Text
        ctx.fillStyle = '#000';
        ctx.font = 'bold 24px Creepster';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.speechText, bubbleX, bubbleY);
        
        ctx.restore();
    }
    
    drawNameCard() {
        if (!this.nameCard || !this.showNameCard) return;
        
        const ctx = this.ctx;
        ctx.save();
        ctx.globalAlpha = this.nameCardOpacity * this.opacity;
        
        // Apply rotation and position for tossing animation
        ctx.translate(this.nameCardX, this.nameCardY);
        ctx.rotate(this.nameCardRotation);
        
        // Card dimensions
        const cardWidth = 280;
        const cardHeight = 80;
        
        // Draw card background
        const gradient = ctx.createLinearGradient(
            -cardWidth/2, -cardHeight/2,
            cardWidth/2, cardHeight/2
        );
        gradient.addColorStop(0, '#fff');
        gradient.addColorStop(1, '#f0e6ff');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(-cardWidth/2, -cardHeight/2, cardWidth, cardHeight);
        
        // Draw border
        ctx.strokeStyle = '#8a2be2';
        ctx.lineWidth = 3;
        ctx.strokeRect(-cardWidth/2, -cardHeight/2, cardWidth, cardHeight);
        
        // Draw decorative corners
        ctx.fillStyle = '#ff8c00';
        const cornerSize = 10;
        ctx.fillRect(-cardWidth/2, -cardHeight/2, cornerSize, cornerSize);
        ctx.fillRect(cardWidth/2 - cornerSize, -cardHeight/2, cornerSize, cornerSize);
        ctx.fillRect(-cardWidth/2, cardHeight/2 - cornerSize, cornerSize, cornerSize);
        ctx.fillRect(cardWidth/2 - cornerSize, cardHeight/2 - cornerSize, cornerSize, cornerSize);
        
        // Draw name
        ctx.fillStyle = '#4d0099';
        ctx.font = 'bold 28px Griffy';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Add text shadow
        ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        ctx.shadowBlur = 2;
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 1;
        
        ctx.fillText(this.nameCard, 0, 0);
        
        ctx.restore();
    }

    async revealName(name) {
        this.nameCard = name;
        this.nameCardX = this.canvas.width / 2;
        this.nameCardY = this.canvas.height / 2 + 100;
        this.nameCardRotation = 0;
        this.nameCardOpacity = 0;
        this.showNameCard = true;
        this.currentPhase = 'revealing';
        
        return new Promise(resolve => {
            const fadeIn = () => {
                this.nameCardOpacity += 0.05;
                if (this.nameCardOpacity >= 1) {
                    this.nameCardOpacity = 1;
                    this.currentPhase = 'displayed';
                    resolve();
                } else {
                    requestAnimationFrame(fadeIn);
                }
            };
            fadeIn();
        });
    }
    
    async sayNope() {
        this.speechText = "Nope!";
        this.speechOpacity = 1;
        this.speechTimer = 1500;
        
        // Start toss animation
        this.currentPhase = 'tossing';
        const direction = Math.random() > 0.5 ? 1 : -1;
        this.nameCardVX = direction * (10 + Math.random() * 5);
        this.nameCardVY = -(5 + Math.random() * 5);
        this.nameCardRotationSpeed = direction * 0.2;
        
        return new Promise(resolve => {
            setTimeout(resolve, 800);
        });
    }
    
    async sayBoo() {
        this.speechText = "BOO!";
        this.speechOpacity = 1;
        this.speechTimer = 2000;
        
        return new Promise(resolve => {
            setTimeout(resolve, 500);
        });
    }
    
    resetCard() {
        this.nameCard = null;
        this.showNameCard = false;
        this.nameCardOpacity = 1;
        this.nameCardVX = 0;
        this.nameCardVY = 0;
        this.nameCardRotation = 0;
        this.nameCardRotationSpeed = 0;
        this.currentPhase = 'idle';
    }

    draw() {
        if (!this.visible) return;
        
        this.drawGhost();
        this.drawBag();
        this.drawSpeechBubble();
        this.drawNameCard();
    }
}

class Confetti {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.particles = [];
        this.colors = ['#ff6600', '#ff8c00', '#8a2be2', '#ffaa00', '#ff00ff', '#00ff00'];
    }

    createBurst(x, y, count = 100) {
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
            const velocity = 5 + Math.random() * 10;
            
            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * velocity,
                vy: Math.sin(angle) * velocity - Math.random() * 5,
                color: this.colors[Math.floor(Math.random() * this.colors.length)],
                size: 5 + Math.random() * 5,
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.2,
                life: 1,
                gravity: 0.2
            });
        }
    }

    update(deltaTime) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            
            p.x += p.vx;
            p.y += p.vy;
            p.vy += p.gravity;
            p.rotation += p.rotationSpeed;
            p.life -= 0.01;
            
            // Bounce off bottom
            if (p.y > this.canvas.height - 10) {
                p.y = this.canvas.height - 10;
                p.vy *= -0.5;
                p.vx *= 0.9;
            }
            
            // Remove dead particles
            if (p.life <= 0 || p.x < -50 || p.x > this.canvas.width + 50) {
                this.particles.splice(i, 1);
            }
        }
    }

    draw() {
        const ctx = this.ctx;
        
        this.particles.forEach(p => {
            ctx.save();
            ctx.globalAlpha = p.life;
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rotation);
            ctx.fillStyle = p.color;
            ctx.fillRect(-p.size/2, -p.size/2, p.size, p.size);
            ctx.restore();
        });
    }
}

class AnimationSystem {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.ghost = new Ghost(canvas);
        this.confetti = new Confetti(canvas);
        this.stars = [];
        this.initStars();
    }

    initStars() {
        for (let i = 0; i < 50; i++) {
            this.stars.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: Math.random() * 2 + 1,
                twinkle: Math.random() * Math.PI * 2
            });
        }
    }

    drawBackground() {
        const ctx = this.ctx;
        
        // Draw stars
        this.stars.forEach(star => {
            star.twinkle += 0.05;
            const opacity = 0.3 + Math.sin(star.twinkle) * 0.3;
            
            ctx.save();
            ctx.globalAlpha = opacity;
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        });
        
        // Draw moon
        ctx.save();
        ctx.fillStyle = '#ffffcc';
        ctx.shadowColor = '#ffffcc';
        ctx.shadowBlur = 30;
        ctx.beginPath();
        ctx.arc(100, 80, 40, 0, Math.PI * 2);
        ctx.fill();
        
        // Moon craters
        ctx.fillStyle = 'rgba(200, 200, 150, 0.3)';
        ctx.beginPath();
        ctx.arc(90, 75, 8, 0, Math.PI * 2);
        ctx.arc(105, 85, 5, 0, Math.PI * 2);
        ctx.arc(95, 90, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    update(deltaTime) {
        this.ghost.update(deltaTime);
        this.confetti.update(deltaTime);
    }

    draw() {
        this.drawBackground();
        this.ghost.draw();
        this.confetti.draw();
    }

    async startSelection(allStudents, selectedStudent) {
        // Ghost appears
        await this.ghost.appear();
        await this.delay(1000);
        
        // Determine number of teases (2-4)
        const numTeases = 2 + Math.floor(Math.random() * 3);
        
        // Create array of tease names (random students, but not the selected one)
        const availableForTease = allStudents.filter(s => s !== selectedStudent);
        
        // Perform teases with random names
        for (let i = 0; i < numTeases - 1; i++) {
            // Pick a random name for this tease (different from selected student)
            let teaseName;
            if (availableForTease.length > 0) {
                const randomIndex = Math.floor(Math.random() * availableForTease.length);
                teaseName = availableForTease[randomIndex];
            } else {
                // Fallback if somehow we don't have enough students
                teaseName = selectedStudent;
            }
            
            // Reveal the name in the winner spot
            await this.ghost.revealName(teaseName);
            await this.delay(1000); // Let them see the name
            
            // Ghost says "Nope!" and tosses the card
            if (window.audioManager) {
                audioManager.playTease();
            }
            await this.ghost.sayNope();
            await this.delay(800); // Wait for card to fly away
            
            this.ghost.resetCard();
            await this.delay(300);
        }
        
        // Final reveal with the actual selected student
        await this.ghost.revealName(selectedStudent);
        await this.delay(1000);
        
        // Ghost says "BOO!" for the winner
        await this.ghost.sayBoo();
        
        // Confetti burst
        this.confetti.createBurst(this.canvas.width / 2, this.canvas.height / 2 + 100, 150);
        
        // Play success sound
        if (window.audioManager) {
            audioManager.playSuccess();
        }
        
        // Keep the card visible with the final name
        
        return selectedStudent;
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    reset() {
        this.ghost.visible = false;
        this.ghost.opacity = 0;
        this.ghost.resetCard();
        this.ghost.speechText = null;
        this.ghost.speechOpacity = 0;
        this.ghost.speechTimer = 0;
        this.confetti.particles = [];
    }
}
