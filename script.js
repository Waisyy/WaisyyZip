// === КОНФИГ ===
const CORRECT_PASSWORD = '123456'; // СМЕНИ НА СВОЙ ПАРОЛЬ!
const SESSION_KEY = 'animebox_session';

// === ЭЛЕМЕНТЫ ===
const loginOverlay = document.getElementById('login-overlay');
const mainContent = document.getElementById('main-content');
const passwordInput = document.getElementById('password-input');
const loginBtn = document.getElementById('login-btn');
const errorMsg = document.getElementById('error-message');
const logoutBtn = document.getElementById('logout-btn');
const playerOverlay = document.getElementById('player-overlay');
const videoPlayer = document.getElementById('video-player');
const videoSource = document.getElementById('video-source');
const closePlayer = document.getElementById('close-player');
const playerTitle = document.getElementById('player-title');

// === ПРОВЕРКА СЕССИИ ===
if (localStorage.getItem(SESSION_KEY) === 'true') {
    showMainContent();
}

// === ВХОД ===
function handleLogin() {
    const pass = passwordInput.value.trim();
    
    if (pass === CORRECT_PASSWORD) {
        localStorage.setItem(SESSION_KEY, 'true');
        showMainContent();
        errorMsg.classList.add('hidden');
        passwordInput.value = '';
    } else {
        errorMsg.classList.remove('hidden');
        passwordInput.value = '';
        passwordInput.focus();
        // Анимация тряски
        passwordInput.style.animation = 'shake 0.3s ease';
        setTimeout(() => passwordInput.style.animation = '', 300);
    }
}

loginBtn.addEventListener('click', handleLogin);
passwordInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleLogin();
});

// === ВЫХОД ===
logoutBtn.addEventListener('click', () => {
    localStorage.removeItem(SESSION_KEY);
    location.reload();
});

// === ПОКАЗАТЬ ОСНОВНОЙ КОНТЕНТ ===
function showMainContent() {
    loginOverlay.classList.add('hidden');
    mainContent.classList.add('active');
}

// === ОТКРЫТЬ ПЛЕЕР ===
document.querySelectorAll('.play-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const card = btn.closest('.movie-card');
        const videoUrl = card.dataset.src;
        const title = card.querySelector('.card-info h4').textContent;
        
        if (!videoUrl) {
            alert('⚠️ Ссылка на видео отсутствует. Добавьте data-src в карточку.');
            return;
        }
        
        playerTitle.textContent = `▶ ${title}`;
        videoSource.src = videoUrl;
        videoPlayer.load();
        playerOverlay.classList.remove('hidden');
        
        // Автовоспроизведение
        videoPlayer.play().catch(() => {
            // Если автоплей заблокирован — ничего страшного
        });
    });
});

// === ЗАКРЫТЬ ПЛЕЕР ===
function closePlayerHandler() {
    playerOverlay.classList.add('hidden');
    videoPlayer.pause();
    videoPlayer.currentTime = 0;
}

closePlayer.addEventListener('click', closePlayerHandler);

// Закрытие по клику на фон
playerOverlay.addEventListener('click', (e) => {
    if (e.target === playerOverlay) {
        closePlayerHandler();
    }
});

// Закрытие по Escape
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !playerOverlay.classList.contains('hidden')) {
        closePlayerHandler();
    }
});

// === АНИМАЦИЯ ТРЯСКИ (добавляем в CSS) ===
const style = document.createElement('style');
style.textContent = `
@keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-8px); }
    75% { transform: translateX(8px); }
}
`;
document.head.appendChild(style);
