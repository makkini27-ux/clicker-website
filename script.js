// Элементы DOM
const clickButton = document.getElementById('clickButton');
const clickCountElement = document.getElementById('clickCount');
const cpsElement = document.getElementById('cps');
const bestScoreElement = document.getElementById('bestScore');
const timerButtons = document.querySelectorAll('.timer-btn');
const resetBtn = document.getElementById('resetBtn');
const currentTimer = document.getElementById('currentTimer');
const timerDisplay = document.getElementById('timerDisplay');
const timerProgressBar = document.getElementById('timerProgressBar');
const timerLabel = document.getElementById('timerLabel');
const buttonText = document.getElementById('buttonText');
const clickArea = document.querySelector('.click-area');
const pulseRing = document.querySelector('.pulse-ring');

// Состояние игры
let clickCount = 0;
let timerDuration = 0;
let selectedTimer = 0;
let timerActive = false;
let gameStarted = false;
let timerInterval;
let timeLeft = 0;
let startTime = 0;
let bestScore = localStorage.getItem('bestScore') || 0;
let clicksDuringSession = 0;

// Инициализация
function initGame() {
    bestScoreElement.textContent = bestScore;
    updateButtonState();
}

// Обновление состояния кнопки
function updateButtonState() {
    if (selectedTimer === 0) {
        clickButton.classList.remove('active');
        clickButton.classList.add('inactive');
        buttonText.innerHTML = 'ВЫБЕРИТЕ<br>ТАЙМЕР';
        pulseRing.classList.remove('active');
    } else if (!gameStarted) {
        clickButton.classList.remove('inactive');
        clickButton.classList.add('active');
        buttonText.innerHTML = 'НАЖМИТЕ<br>ДЛЯ СТАРТА';
        pulseRing.classList.add('active');
    } else if (timerActive) {
        clickButton.classList.remove('inactive');
        clickButton.classList.add('active');
        buttonText.innerHTML = 'КЛИКАЙ!<br>БЫСТРЕЕ!';
        pulseRing.classList.add('active');
    } else {
        clickButton.classList.remove('active');
        clickButton.classList.add('inactive');
        buttonText.innerHTML = 'ВРЕМЯ<br>ВЫШЛО';
        pulseRing.classList.remove('active');
    }
}

// Анимация клика
function createClickAnimation(x, y) {
    const animation = document.createElement('div');
    animation.style.position = 'absolute';
    animation.style.width = '20px';
    animation.style.height = '20px';
    animation.style.background = 'rgba(255, 255, 255, 0.8)';
    animation.style.borderRadius = '50%';
    animation.style.left = x + 'px';
    animation.style.top = y + 'px';
    animation.style.pointerEvents = 'none';
    animation.style.zIndex = '10';
    animation.style.animation = 'clickEffect 0.5s ease-out forwards';
    
    clickArea.appendChild(animation);
    
    setTimeout(() => animation.remove(), 500);
}

// Клик по основной кнопке
clickButton.addEventListener('click', function(e) {
    if (selectedTimer === 0) return;
    
    if (!gameStarted) {
        startGame();
        return;
    }
    
    if (timerActive) {
        clickCount++;
        clicksDuringSession++;
        clickCountElement.textContent = clickCount;
        
        const rect = clickButton.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        createClickAnimation(x, y);
        
        clickButton.style.transform = 'scale(0.95)';
        setTimeout(() => {
            if (timerActive) clickButton.style.transform = 'scale(1.05)';
        }, 100);
        
        updateCPS();
    }
});

// Обновление скорости кликов
function updateCPS() {
    if (timerActive && startTime > 0) {
        const elapsed = (timerDuration - timeLeft) / 1000;
        if (elapsed > 0) {
            const cps = clicksDuringSession / elapsed;
            cpsElement.textContent = cps.toFixed(1);
        }
    }
}

// Выбор таймера
timerButtons.forEach(button => {
    button.addEventListener('click', function() {
        if (gameStarted) return;
        
        timerButtons.forEach(btn => btn.classList.remove('active'));
        this.classList.add('active');
        
        selectedTimer = parseInt(this.getAttribute('data-time'));
        timerDuration = selectedTimer * 1000;
        timeLeft = timerDuration;
        
        let timerText = '';
        switch(selectedTimer) {
            case 10: timerText = '10 секунд'; break;
            case 30: timerText = '30 секунд'; break;
            case 60: timerText = '1 минута'; break;
        }
        timerLabel.textContent = timerText;
        
        updateTimerDisplay();
        currentTimer.classList.add('active');
        updateButtonState();
    });
});

// Обновление отображения таймера
function updateTimerDisplay() {
    const seconds = Math.ceil(timeLeft / 1000);
    const displaySeconds = seconds < 10 ? `0${seconds}` : seconds;
    timerDisplay.textContent = `00:${displaySeconds}`;
    
    const progress = (timeLeft / timerDuration) * 100;
    timerProgressBar.style.width = `${progress}%`;
}

// Старт игры
function startGame() {
    gameStarted = true;
    timerActive = true;
    timeLeft = timerDuration;
    startTime = Date.now();
    clicksDuringSession = 0;
    
    updateButtonState();
    clickButton.style.background = 'linear-gradient(145deg, #fc00ff, #00dbde)';
    
    timerInterval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        timeLeft = timerDuration - elapsed;
        
        if (timeLeft <= 0) {
            timeLeft = 0;
            stopGame();
        }
        
        updateTimerDisplay();
        updateCPS();
    }, 50);
}

// Остановка игры
function stopGame() {
    clearInterval(timerInterval);
    timerActive = false;
    
    updateButtonState();
    clickButton.style.transform = 'scale(1)';
    
    if (clickCount > bestScore) {
        bestScore = clickCount;
        bestScoreElement.textContent = bestScore;
        localStorage.setItem('bestScore', bestScore);
        
        bestScoreElement.style.color = '#fc00ff';
        setTimeout(() => bestScoreElement.style.color = '#00dbde', 1000);
    }
    
    showNotification(`Время вышло! Вы сделали ${clickCount} кликов (${cpsElement.textContent} в секунду)`);
}

// Сброс игры
function resetGame() {
    if (timerActive) clearInterval(timerInterval);
    
    clickCount = 0;
    gameStarted = false;
    timerActive = false;
    clicksDuringSession = 0;
    selectedTimer = 0;
    timeLeft = 0;
    
    timerButtons.forEach(btn => btn.classList.remove('active'));
    clickCountElement.textContent = '0';
    cpsElement.textContent = '0.0';
    clickButton.style.background = 'linear-gradient(145deg, #333, #222)';
    clickButton.style.transform = 'scale(1)';
    currentTimer.classList.remove('active');
    updateButtonState();
}

// Уведомление
function showNotification(message) {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: linear-gradient(to right, #00dbde, #fc00ff);
        color: white;
        padding: 15px 25px;
        border-radius: 50px;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
        z-index: 1000;
        font-weight: bold;
        animation: fadeIn 0.5s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transition = 'opacity 0.5s ease';
        setTimeout(() => notification.remove(), 500);
    }, 3000);
}

// Обработчики
resetBtn.addEventListener('click', resetGame);

clickButton.addEventListener('mouseenter', function() {
    if (selectedTimer !== 0 && !timerActive) {
        this.style.transform = 'scale(1.05)';
    }
});

clickButton.addEventListener('mouseleave', function() {
    if (selectedTimer !== 0 && !timerActive) {
        this.style.transform = 'scale(1)';
    }
});

// Инициализация при загрузке
window.addEventListener('DOMContentLoaded', initGame);

// 1. Звуковые эффекты (простое кликание)
function playClickSound() {
    const audio = new Audio('data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAAAA==');
    audio.volume = 0.1;
    audio.play().catch(() => {});
}

// В обработчике клика добавьте:
clickButton.addEventListener('click', function(e) {
    // ... существующий код ...
    playClickSound(); // Добавить эту строку
});

// 2. Эффект при рекорде
function celebrateRecord() {
    if (clickCount > bestScore) {
        // Анимация рекорда
        document.querySelectorAll('.stat-value').forEach(el => {
            el.style.animation = 'pulse 0.5s 3';
        });
        
        // Уведомление
        showNotification(`🎉 НОВЫЙ РЕКОРД! ${clickCount} кликов!`);
    }
}

// 3. Подсветка активной кнопки таймера
function highlightTimerButtons() {
    timerButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            timerButtons.forEach(b => b.style.boxShadow = 'none');
            this.style.boxShadow = '0 0 20px rgba(0, 219, 222, 0.7)';
        });
    });
}