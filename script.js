// === ПАРОЛЬ (СМЕНИ НА СВОЙ) ===
const CORRECT_PASSWORD = '123456';

// === ЭЛЕМЕНТЫ ===
const loginScreen = document.getElementById('loginScreen');
const mainContent = document.getElementById('mainContent');
const passwordInput = document.getElementById('passwordInput');
const loginBtn = document.getElementById('loginBtn');
const errorMsg = document.getElementById('errorMsg');
const logoutBtn = document.getElementById('logoutBtn');
const playerOverlay = document.getElementById('playerOverlay');
const videoPlayer = document.getElementById('videoPlayer');
const videoSource = document.getElementById('videoSource');
const closePlayer = document.getElementById('closePlayer');

// === ПРОВЕРКА СЕССИИ ===
if (localStorage.getItem('loggedIn') === 'true') {
    loginScreen.style.display = 'none';
    mainContent.style.display = 'block';
}

// === ВХОД ===
function handleLogin() {
    const pass = passwordInput.value.trim();
    
    if (pass === CORRECT_PASSWORD) {
        localStorage.setItem('loggedIn', 'true');
        loginScreen.style.display = 'none';
        mainContent.style.display = 'block';
        errorMsg.style.display = 'none';
        passwordInput.value = '';
    } else {
        errorMsg.style.display = 'block';
        passwordInput.value = '';
        passwordInput.focus();
    }
}

loginBtn.addEventListener('click', handleLogin);
passwordInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleLogin();
});

// === ВЫХОД ===
logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('loggedIn');
    location.reload();
});

// === ПЛЕЕР ===
document.querySelectorAll('.playBtn').forEach(btn => {
    btn.addEventListener('click', function(e) {
        e.stopPropagation();
        const card = this.closest('.movie-card');
        const videoUrl = card.dataset.src;
        
        if (!videoUrl || videoUrl === 'ССЫЛКА_НА_ТВОЕ_ВИДЕО.mp4') {
            alert('⚠️ Ссылка на видео отсутствует. Добавь data-src в карточку.');
            return;
        }
        
        videoSource.src = videoUrl;
        videoPlayer.load();
        playerOverlay.style.display = 'flex';
        videoPlayer.play().catch(() => {});
    });
});

// === ЗАКРЫТЬ ПЛЕЕР ===
function closePlayerHandler() {
    playerOverlay.style.display = 'none';
    videoPlayer.pause();
    videoPlayer.currentTime = 0;
}

closePlayer.addEventListener('click', closePlayerHandler);

playerOverlay.addEventListener('click', (e) => {
    if (e.target === playerOverlay) {
        closePlayerHandler();
    }
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && playerOverlay.style.display === 'flex') {
        closePlayerHandler();
    }
});
