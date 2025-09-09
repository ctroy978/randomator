class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        this.ctx.imageSmoothingEnabled = false;
        
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        
        this.state = 'MENU';
        this.lastTime = 0;
        this.deltaTime = 0;
        
        this.cards = [];
        this.selectedClass = null;
        this.selectedCard = null;
        this.winner = null;
        
        this.confetti = new Confetti(this.canvas);
        
        this.setupEventListeners();
        this.init();
        this.animate();
    }

    async init() {
        this.state = 'LOADING';
        
        try {
            await dataManager.loadClassData();
            await this.populateClassSelector();
            this.state = 'MENU';
            this.updateInstructions('Select a class and click "Deal Cards" to begin');
        } catch (error) {
            console.error('Failed to initialize game:', error);
            this.showError('Failed to load class data. Please refresh the page.');
        }
    }

    async populateClassSelector() {
        const select = document.getElementById('classSelect');
        const classNames = dataManager.getClassNames();
        
        select.innerHTML = '<option value="">-- Select a Class --</option>';
        
        classNames.forEach(className => {
            const option = document.createElement('option');
            option.value = className;
            option.textContent = className;
            select.appendChild(option);
        });
    }

    setupEventListeners() {
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('click', (e) => this.handleClick(e));
        this.canvas.addEventListener('touchstart', (e) => this.handleTouch(e));
        
        document.getElementById('classSelect').addEventListener('change', (e) => {
            this.selectedClass = e.target.value;
            document.getElementById('dealBtn').disabled = !this.selectedClass;
        });
        
        document.getElementById('dealBtn').addEventListener('click', () => {
            this.dealCards();
        });
        
        document.getElementById('newGameBtn').addEventListener('click', () => {
            this.resetGame();
        });
    }

    dealCards() {
        if (!this.selectedClass) return;
        
        this.state = 'DEALING';
        this.cards = [];
        this.selectedCard = null;
        this.winner = null;
        
        const students = dataManager.getRandomStudents(this.selectedClass, 4);
        
        if (students.length < 4) {
            this.showError('Not enough students in this class');
            return;
        }
        
        const cardWidth = 150;
        const cardHeight = 200;
        const spacing = 30;
        const totalWidth = (cardWidth * 4) + (spacing * 3);
        const startX = (this.width - totalWidth) / 2;
        const y = (this.height - cardHeight) / 2;
        
        students.forEach((student, index) => {
            const x = startX + (index * (cardWidth + spacing));
            const card = new Card(x, -cardHeight, cardWidth, cardHeight, student, index);
            card.targetY = y;
            this.cards.push(card);
        });
        
        document.getElementById('controls').style.display = 'none';
        this.updateInstructions('Pick a card (click on any card)');
        
        setTimeout(() => {
            this.state = 'PLAYING';
        }, 500);
    }

    handleMouseMove(event) {
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;
        
        if (this.state === 'PLAYING' && !this.selectedCard) {
            let hoveredCard = false;
            this.cards.forEach(card => {
                if (card.checkHover(mouseX, mouseY)) {
                    hoveredCard = true;
                    this.canvas.style.cursor = 'pointer';
                }
            });
            
            if (!hoveredCard) {
                this.canvas.style.cursor = 'default';
            }
        }
    }

    handleClick(event) {
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;
        
        if (this.state === 'PLAYING' && !this.selectedCard) {
            this.cards.forEach(card => {
                if (card.checkClick(mouseX, mouseY)) {
                    this.selectCard(card);
                }
            });
        }
    }

    handleTouch(event) {
        event.preventDefault();
        const touch = event.touches[0];
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = touch.clientX - rect.left;
        const mouseY = touch.clientY - rect.top;
        
        if (this.state === 'PLAYING' && !this.selectedCard) {
            this.cards.forEach(card => {
                if (card.checkClick(mouseX, mouseY)) {
                    this.selectCard(card);
                }
            });
        }
    }

    selectCard(card) {
        if (this.selectedCard) return;
        
        this.selectedCard = card;
        this.state = 'REVEALING';
        this.canvas.style.cursor = 'default';
        
        this.cards.forEach((c, index) => {
            if (c === card) {
                setTimeout(() => {
                    c.select();
                    c.targetX = this.width / 2 - c.width / 2;
                    c.targetY = this.height / 2 - c.height / 2;
                }, 800);
            } else {
                setTimeout(() => {
                    c.flip();
                }, index * 200);
                
                setTimeout(() => {
                    const direction = c.x < card.x ? -1 : 1;
                    c.toss(direction);
                }, 2000 + index * 200);
            }
        });
        
        setTimeout(() => {
            this.winner = card.studentName;
            this.showResult();
            this.confetti.burst(5);
            this.state = 'RESULT';
        }, 3500);
    }

    showResult() {
        document.getElementById('resultName').textContent = this.winner;
        document.getElementById('resultDisplay').style.display = 'block';
        document.getElementById('instructions').style.display = 'none';
    }

    resetGame() {
        this.state = 'MENU';
        this.cards = [];
        this.selectedCard = null;
        this.winner = null;
        this.confetti.clear();
        
        document.getElementById('resultDisplay').style.display = 'none';
        document.getElementById('controls').style.display = 'flex';
        document.getElementById('instructions').style.display = 'block';
        this.updateInstructions('Select a class and click "Deal Cards" to begin');
    }

    updateInstructions(text) {
        document.getElementById('instructions').textContent = text;
    }

    showError(message) {
        this.updateInstructions('Error: ' + message);
    }

    update(currentTime) {
        this.deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        this.cards.forEach(card => card.update(this.deltaTime));
        this.confetti.update(this.deltaTime);
    }

    draw() {
        this.ctx.clearRect(0, 0, this.width, this.height);
        
        this.cards.forEach(card => card.draw(this.ctx));
        this.confetti.draw(this.ctx);
        
        if (this.state === 'LOADING') {
            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = '24px Georgia';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('Loading...', this.width / 2, this.height / 2);
        }
    }

    animate(currentTime = 0) {
        this.update(currentTime);
        this.draw();
        requestAnimationFrame((time) => this.animate(time));
    }
}

window.addEventListener('DOMContentLoaded', () => {
    new Game();
});