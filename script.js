
const CORRECT_PASSWORD = '123456';
const STORAGE_KEY = 'isLoggedIn';

const loginScreen = document.getElementById('login-screen');
const mainScreen = document.getElementById('main-screen');
const passwordInput = document.getElementById('password-input');
const loginBtn = document.getElementById('login-btn');
const errorMsg = document.getElementById('error-message');
const logoutBtn = document.getElementById('logout-btn');
const playerOverlay = document.getElementById('player-overlay');
const videoPlayer = document.getElementById('video-player');
const videoSource = document.getElementById('video-source');
const closePlayer = document.getElementById('close-player');

if (localStorage.getItem(STORAGE_KEY) === 'true') {
    showMainScreen();
}

loginBtn.addEventListener('click', () => {
    const pass = passwordInput.value.trim();
    if (pass === CORRECT_PASSWORD) {
        localStorage.setItem(STORAGE_KEY, 'true');
        showMainScreen();
    } else {
        errorMsg.classList.remove('hidden');
        passwordInput.value = '';
        passwordInput.focus();
    }
});

// Вход по Enter
passwordInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') loginBtn.click();
});

// === ВЫХОД ===
logoutBtn.addEventListener('click', () => {
    localStorage.removeItem(STORAGE_KEY);
    location.reload(); // Возврат на экран входа
});

function showMainScreen() {
    loginScreen.classList.remove('active');
    mainScreen.classList.add('active');
}

// === ПЛЕЕР ===
document.querySelectorAll('.play-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const card = btn.closest('.movie-card');
        const videoUrl = card.dataset.src;
        videoSource.src = videoUrl;
        videoPlayer.load();
        playerOverlay.classList.remove('hidden');
        videoPlayer.play();
    });
});

// Закрыть плеер
closePlayer.addEventListener('click', () => {
    playerOverlay.classList.add('hidden');
    videoPlayer.pause();
});

// Закрыть по клику на фон
playerOverlay.addEventListener('click', (e) => {
    if (e.target === playerOverlay) {
        playerOverlay.classList.add('hidden');
        videoPlayer.pause();
    }
});
