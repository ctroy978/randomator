class BoxingGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        this.boxerLeft = null;
        this.boxerRight = null;
        this.effects = new Effects(this.canvas);
        
        this.isRunning = false;
        this.gameOver = false;
        this.winner = null;
        
        this.lastTime = 0;
        this.punchTimer = 0;
        this.punchInterval = 800;
        
        this.crowdAudio = null;
        
        this.initializeGame();
    }

    initializeGame() {
        ui.startBtn.addEventListener('click', () => this.startGame());
        ui.nextBtn.addEventListener('click', () => this.resetGame());
        
        ui.effectsToggle.addEventListener('change', (e) => {
            this.effects.setEnabled(e.target.checked);
        });
        
        this.effects.setEnabled(ui.areEffectsEnabled());
        
        ui.populateClasses();
        
        this.animate();
    }

    async startGame() {
        const className = ui.getSelectedClass();
        const playerName = ui.getPlayerName();
        
        if (!className || !playerName) return;
        
        try {
            const opponentName = await dataManager.getRandomStudent(className);
            
            ui.hideControls();
            
            this.boxerLeft = new Boxer(300, 400, '#0000ff', playerName, true);
            this.boxerRight = new Boxer(700, 400, '#ff0000', opponentName, false);
            
            this.isRunning = true;
            this.gameOver = false;
            this.winner = null;
            this.punchTimer = 0;
            
            this.effects.clear();
            
            audioManager.playBell();
            
            if (ui.isSoundEnabled()) {
                this.crowdAudio = audioManager.playCrowd();
            }
            
            setTimeout(() => {
                this.startFight();
            }, 1000);
            
        } catch (error) {
            console.error('Error starting game:', error);
            alert('Error starting game. Please try again.');
            ui.showControls();
        }
    }

    startFight() {
        this.punchInterval = 800 / ui.getAnimationSpeed();
    }

    update(deltaTime) {
        if (!this.isRunning || this.gameOver) return;
        
        if (this.boxerLeft) this.boxerLeft.update(deltaTime);
        if (this.boxerRight) this.boxerRight.update(deltaTime);
        
        this.effects.update(deltaTime);
        
        if (this.isRunning && this.boxerLeft && this.boxerRight) {
            this.punchTimer += deltaTime;
            
            if (this.punchTimer >= this.punchInterval) {
                this.punchTimer = 0;
                this.executePunch();
            }
        }
    }

    executePunch() {
        if (this.gameOver) return;
        
        const attackerIsLeft = Math.random() < 0.5;
        const attacker = attackerIsLeft ? this.boxerLeft : this.boxerRight;
        const defender = attackerIsLeft ? this.boxerRight : this.boxerLeft;
        
        if (attacker.punch()) {
            audioManager.playPunch();
            
            setTimeout(() => {
                const hitChance = 0.6;
                const hit = Math.random() < hitChance;
                
                if (hit) {
                    const damage = Math.floor(Math.random() * 3) + 1;
                    defender.takeDamage(damage);
                    
                    audioManager.playHit();
                    
                    const impactX = attackerIsLeft ? defender.x - 40 : defender.x + 40;
                    const impactY = defender.y - 20;
                    
                    this.effects.addPunchEffect(impactX, impactY, true);
                    
                    if (damage > 1) {
                        this.effects.addBloodEffect(impactX, impactY);
                    }
                    
                    if (defender.health <= 0) {
                        this.endGame(attacker);
                    }
                } else {
                    const missX = attackerIsLeft ? defender.x - 60 : defender.x + 60;
                    const missY = defender.y - 20;
                    this.effects.addPunchEffect(missX, missY, false);
                }
            }, 200);
        }
    }

    endGame(winner) {
        this.gameOver = true;
        this.winner = winner;
        
        winner.celebrate();
        
        audioManager.playVictory();
        
        if (this.crowdAudio) {
            this.crowdAudio.pause();
            this.crowdAudio = null;
        }
        
        this.effects.addVictoryConfetti(winner.x, winner.y - 50);
        
        setTimeout(() => {
            ui.showResult(winner.name);
        }, 2000);
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.drawRing();
        
        if (this.boxerLeft) this.boxerLeft.draw(this.ctx);
        if (this.boxerRight) this.boxerRight.draw(this.ctx);
        
        this.effects.draw(this.ctx);
        
        if (!this.isRunning && !this.boxerLeft && !this.boxerRight) {
            this.drawStartScreen();
        }
    }

    drawRing() {
        this.ctx.fillStyle = '#87CEEB';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height * 0.6);
        
        this.ctx.fillStyle = '#8B7355';
        this.ctx.fillRect(0, this.canvas.height * 0.6, this.canvas.width, this.canvas.height * 0.4);
        
        this.ctx.strokeStyle = '#ff0000';
        this.ctx.lineWidth = 5;
        
        for (let i = 0; i < 4; i++) {
            const y = 280 + i * 40;
            this.ctx.beginPath();
            this.ctx.moveTo(50, y);
            this.ctx.lineTo(this.canvas.width - 50, y);
            this.ctx.stroke();
        }
        
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 3;
        
        this.ctx.beginPath();
        this.ctx.moveTo(50, 280);
        this.ctx.lineTo(50, 400);
        this.ctx.moveTo(this.canvas.width - 50, 280);
        this.ctx.lineTo(this.canvas.width - 50, 400);
        this.ctx.stroke();
        
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        for (let i = 0; i < 20; i++) {
            const x = Math.random() * this.canvas.width;
            const y = Math.random() * this.canvas.height * 0.6;
            const size = Math.random() * 50 + 10;
            this.ctx.beginPath();
            this.ctx.arc(x, y, size, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }

    drawStartScreen() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 48px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('BOXING MATCH', this.canvas.width / 2, this.canvas.height / 2 - 50);
        
        this.ctx.font = '24px Arial';
        this.ctx.fillText('Select a class and enter your name to begin!', this.canvas.width / 2, this.canvas.height / 2 + 20);
    }

    animate(currentTime = 0) {
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        this.update(deltaTime * ui.getAnimationSpeed());
        this.draw();
        
        requestAnimationFrame((time) => this.animate(time));
    }

    resetGame() {
        this.isRunning = false;
        this.gameOver = false;
        this.boxerLeft = null;
        this.boxerRight = null;
        this.winner = null;
        this.effects.clear();
        
        if (this.crowdAudio) {
            this.crowdAudio.pause();
            this.crowdAudio = null;
        }
        
        ui.reset();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const game = new BoxingGame();
});