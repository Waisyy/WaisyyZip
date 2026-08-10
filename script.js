// === ПАРОЛЬ ===
const CORRECT_PASSWORD = '123456';

// === ЭЛЕМЕНТЫ ===
const loginScreen = document.getElementById('loginScreen');
const mainContent = document.getElementById('mainContent');
const passwordInput = document.getElementById('passwordInput');
const loginBtn = document.getElementById('loginBtn');
const errorMsg = document.getElementById('errorMsg');
const logoutBtn = document.getElementById('logoutBtn');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const categoriesNav = document.getElementById('categoriesNav');
const homePage = document.getElementById('homePage');
const searchPage = document.getElementById('searchPage');
const detailsPage = document.getElementById('detailsPage');
const searchResults = document.getElementById('searchResults');
const searchTitle = document.getElementById('searchTitle');
const detailsContent = document.getElementById('detailsContent');
const backBtn = document.getElementById('backBtn');
const playerOverlay = document.getElementById('playerOverlay');
const videoPlayer = document.getElementById('videoPlayer');
const videoSource = document.getElementById('videoSource');
const closePlayer = document.getElementById('closePlayer');
const playerTitle = document.getElementById('playerTitle');

// === ДАННЫЕ ===
let allTitles = [];
let currentFilter = 'all';
let currentTitleId = null;
let currentSeason = null;
let currentEpisode = null;
let progressInterval = null; // <--- ОБЪЯВЛЯЕМ ЗДЕСЬ В ГЛОБАЛЬНОЙ ОБЛАСТИ

// === КЛЮЧИ ДЛЯ ХРАНЕНИЯ ===
const PROGRESS_KEY = 'animebox_progress';
const WATCHED_KEY = 'animebox_watched';

// ==========================================
// === ВХОД / ВЫХОД / СЕССИЯ ===
// ==========================================

// Проверка сессии
if (localStorage.getItem('loggedIn') === 'true') {
    loginScreen.style.display = 'none';
    mainContent.style.display = 'block';
    loadData();
}

// Вход
function handleLogin() {
    const pass = passwordInput.value.trim();
    
    if (pass === CORRECT_PASSWORD) {
        localStorage.setItem('loggedIn', 'true');
        loginScreen.style.display = 'none';
        mainContent.style.display = 'block';
        errorMsg.style.display = 'none';
        passwordInput.value = '';
        loadData();
    } else {
        errorMsg.style.display = 'block';
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

// Выход
logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('loggedIn');
    location.reload();
});

// ==========================================
// === ЗАГРУЗКА ДАННЫХ ===
// ==========================================

async function loadData() {
    try {
        const response = await fetch('data.json');
        const data = await response.json();
        allTitles = data.titles;
        renderHomePage();
    } catch (error) {
        console.error('Ошибка загрузки data.json:', error);
        homePage.innerHTML = `
            <div style="text-align: center; padding: 60px 20px; color: var(--text-secondary);">
                <span style="font-size: 48px; display: block; margin-bottom: 16px;">⚠️</span>
                Не удалось загрузить базу данных. Проверь файл data.json.
            </div>
        `;
    }
}

// ==========================================
// === РАБОТА С ПРОГРЕССОМ ===
// ==========================================

function getProgress(titleId, season, episode) {
    const key = `${titleId}_${season}_${episode}`;
    const all = JSON.parse(localStorage.getItem(PROGRESS_KEY) || '{}');
    return all[key] || 0;
}

function saveProgress(titleId, season, episode, time) {
    const key = `${titleId}_${season}_${episode}`;
    const all = JSON.parse(localStorage.getItem(PROGRESS_KEY) || '{}');
    all[key] = time;
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(all));
}

function getWatched(titleId) {
    const all = JSON.parse(localStorage.getItem(WATCHED_KEY) || '{}');
    return all[titleId] || 0;
}

function incrementWatched(titleId) {
    const all = JSON.parse(localStorage.getItem(WATCHED_KEY) || '{}');
    all[titleId] = (all[titleId] || 0) + 1;
    localStorage.setItem(WATCHED_KEY, JSON.stringify(all));
}

function isWatched(titleId, season, episode) {
    const progress = getProgress(titleId, season, episode);
    return progress > 0;
}

// ==========================================
// === ОТОБРАЖЕНИЕ ГЛАВНОЙ ===
// ==========================================

function renderHomePage() {
    homePage.style.display = 'block';
    searchPage.style.display = 'none';
    detailsPage.style.display = 'none';
    
    // Новинки (первые 4)
    const newReleases = allTitles.slice(0, 4);
    document.getElementById('newCount').textContent = newReleases.length;
    renderGrid('newReleases', newReleases);
    
    // Популярные (по просмотрам)
    const popular = [...allTitles].sort((a, b) => {
        return (getWatched(b.id) || 0) - (getWatched(a.id) || 0);
    }).slice(0, 4);
    document.getElementById('popularCount').textContent = popular.length;
    renderGrid('popularTitles', popular);
    
    // Продолжить просмотр
    const continueTitles = allTitles.filter(t => {
        return t.seasons.some(s => 
            s.episodes.some(e => isWatched(t.id, s.season, e.number))
        );
    });
    document.getElementById('continueCount').textContent = continueTitles.length;
    
    const continueSection = document.getElementById('continueSection');
    if (continueTitles.length === 0) {
        continueSection.style.display = 'none';
    } else {
        continueSection.style.display = 'block';
        renderGrid('continueWatching', continueTitles);
    }
}

// ==========================================
// === ОТОБРАЖЕНИЕ СЕТКИ ===
// ==========================================

function renderGrid(containerId, titles) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    if (titles.length === 0) {
        container.innerHTML = `<div style="color: var(--text-secondary); padding: 20px;">Нет контента</div>`;
        return;
    }
    
    let html = '';
    titles.forEach(item => {
        const watched = getWatched(item.id);
        const hasProgress = item.seasons.some(s => 
            s.episodes.some(e => isWatched(item.id, s.season, e.number))
        );
        
        html += `
            <div class="result-card" data-id="${item.id}">
                ${hasProgress ? `<div class="badge">⏳ Продолжить</div>` : ''}
                <img src="${item.poster}" alt="${item.title}" loading="lazy">
                <div class="info">
                    <h4>${item.title}</h4>
                    <div class="meta">
                        <span>${item.type}</span>
                        <span>${item.year}</span>
                        ${watched > 0 ? `<span>👁️ ${watched}</span>` : ''}
                    </div>
                </div>
                ${hasProgress ? `<div class="progress-bar" style="width: 30%;"></div>` : ''}
            </div>
        `;
    });
    
    container.innerHTML = html;
    
    container.querySelectorAll('.result-card').forEach(card => {
        card.addEventListener('click', () => {
            const id = parseInt(card.dataset.id);
            const titleData = allTitles.find(t => t.id === id);
            if (titleData) showDetails(titleData);
        });
    });
}

// ==========================================
// === ПОИСК ===
// ==========================================

function showSearchResults(title, results) {
    homePage.style.display = 'none';
    searchPage.style.display = 'block';
    detailsPage.style.display = 'none';
    
    searchTitle.textContent = title;
    
    if (results.length === 0) {
        searchResults.innerHTML = `
            <div style="text-align: center; padding: 60px 20px; color: var(--text-secondary); grid-column: 1 / -1;">
                <span style="font-size: 48px; display: block; margin-bottom: 16px;">😢</span>
                Ничего не найдено
            </div>
        `;
        return;
    }
    
    let html = '';
    results.forEach(item => {
        html += `
            <div class="result-card" data-id="${item.id}">
                <img src="${item.poster}" alt="${item.title}" loading="lazy">
                <div class="info">
                    <h4>${item.title}</h4>
                    <div class="meta">
                        <span>${item.type}</span>
                        <span>${item.year}</span>
                    </div>
                </div>
            </div>
        `;
    });
    searchResults.innerHTML = html;
    
    searchResults.querySelectorAll('.result-card').forEach(card => {
        card.addEventListener('click', () => {
            const id = parseInt(card.dataset.id);
            const titleData = allTitles.find(t => t.id === id);
            if (titleData) showDetails(titleData);
        });
    });
}

function handleSearch() {
    const query = searchInput.value.trim();
    if (!query) {
        renderHomePage();
        return;
    }
    
    const results = allTitles.filter(item => {
        return item.title.toLowerCase().includes(query.toLowerCase()) ||
               item.type.toLowerCase().includes(query.toLowerCase()) ||
               String(item.year).includes(query);
    });
    
    showSearchResults(`Результаты поиска: "${query}"`, results);
}

searchBtn.addEventListener('click', handleSearch);
searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleSearch();
});

// ==========================================
// === КАТЕГОРИИ ===
// ==========================================

categoriesNav.addEventListener('click', (e) => {
    if (!e.target.classList.contains('category-btn')) return;
    
    document.querySelectorAll('.category-btn').forEach(btn => btn.classList.remove('active'));
    e.target.classList.add('active');
    
    currentFilter = e.target.dataset.filter;
    
    if (currentFilter === 'продолжить') {
        const continueTitles = allTitles.filter(t => {
            return t.seasons.some(s => 
                s.episodes.some(e => isWatched(t.id, s.season, e.number))
            );
        });
        showSearchResults('Продолжить просмотр', continueTitles);
        return;
    }
    
    if (currentFilter === 'all') {
        renderHomePage();
        return;
    }
    
    const filtered = allTitles.filter(t => t.type === currentFilter);
    showSearchResults(`Все ${currentFilter}ы`, filtered);
});

// ==========================================
// === ДЕТАЛИ ТАЙТЛА ===
// ==========================================

function showDetails(titleData) {
    homePage.style.display = 'none';
    searchPage.style.display = 'none';
    detailsPage.style.display = 'block';
    
    currentTitleId = titleData.id;
    
    let html = `
        <div class="detail-header">
            <img src="${titleData.poster}" alt="${titleData.title}">
            <div class="info">
                <h2>${titleData.title}</h2>
                <div class="meta">
                    <span>${titleData.type}</span>
                    <span>${titleData.year}</span>
                    <span>👁️ ${getWatched(titleData.id)} просмотров</span>
                </div>
                <p class="description">${titleData.description || ''}</p>
            </div>
        </div>
    `;
    
    titleData.seasons.forEach(season => {
        html += `<div class="season-block">`;
        html += `<h3>Сезон ${season.season}</h3>`;
        season.episodes.forEach(ep => {
            const progress = getProgress(titleData.id, season.season, ep.number);
            const progressPercent = progress > 0 ? Math.min(Math.round((progress / 60) * 100), 100) : 0;
            const progressBar = progressPercent > 0 ? `<div class="progress-bar" style="width: ${progressPercent}%;"></div>` : '';
            
            html += `
                <div class="episode-item" data-season="${season.season}" data-episode="${ep.number}" data-src="${ep.src}">
                    <span class="ep-number">${ep.number}</span>
                    <span class="ep-title">${ep.title}</span>
                    ${progress > 0 ? `<span class="ep-duration">⏱️ ${Math.round(progress)} сек</span>` : ''}
                    <button class="play-ep-btn">▶ Смотреть</button>
                    ${progressBar}
                </div>
            `;
        });
        html += `</div>`;
    });
    
    detailsContent.innerHTML = html;
    
    // Клик по серии
    document.querySelectorAll('.episode-item').forEach(item => {
        item.addEventListener('click', (e) => {
            if (e.target.classList.contains('play-ep-btn')) return;
            const src = item.dataset.src;
            const season = parseInt(item.dataset.season);
            const episode = parseInt(item.dataset.episode);
            openPlayer(src, currentTitleId, season, episode);
        });
        
        item.querySelector('.play-ep-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            const src = item.dataset.src;
            const season = parseInt(item.dataset.season);
            const episode = parseInt(item.dataset.episode);
            openPlayer(src, currentTitleId, season, episode);
        });
    });
}

// === НАЗАД ===
backBtn.addEventListener('click', () => {
    // Если мы на странице деталей
    if (detailsPage.style.display === 'block') {
        // Возвращаемся к предыдущему состоянию
        if (searchPage.style.display === 'block') {
            // Если пришли из поиска, показываем его
            const query = searchInput.value.trim();
            if (query) {
                const results = allTitles.filter(item => {
                    return item.title.toLowerCase().includes(query.toLowerCase());
                });
                showSearchResults(`Результаты поиска: "${query}"`, results);
            } else {
                renderHomePage();
            }
        } else {
            renderHomePage();
        }
    }
});

// ==========================================
// === ПЛЕЕР ===
// ==========================================

function openPlayer(videoUrl, titleId, season, episode) {
    if (!videoUrl || videoUrl === 'ССЫЛКА_НА_ВИДЕО_В_MEGA') {
        alert('⚠️ Ссылка на видео отсутствует. Добавь src в data.json.');
        return;
    }
    
    // Сохраняем текущую серию для прогресса
    currentTitleId = titleId;
    currentSeason = season;
    currentEpisode = episode;
    
    // Находим название тайтла
    const titleData = allTitles.find(t => t.id === titleId);
    const epTitle = titleData ? `${titleData.title} — Сезон ${season}, Серия ${episode}` : 'Видео';
    playerTitle.textContent = `▶ ${epTitle}`;
    
    videoSource.src = videoUrl;
    videoPlayer.load();
    playerOverlay.classList.add('show');
    
    // Восстанавливаем прогресс
    const savedProgress = getProgress(titleId, season, episode);
    if (savedProgress > 0) {
        videoPlayer.currentTime = savedProgress;
    }
    
    videoPlayer.play().catch(() => {});
    
    // Сохраняем прогресс каждые 3 секунды
    if (progressInterval) clearInterval(progressInterval);
    progressInterval = setInterval(() => {
        if (!videoPlayer.paused) {
            saveProgress(titleId, season, episode, videoPlayer.currentTime);
        }
    }, 3000);
    
    // Увеличиваем счетчик просмотров при первом запуске
    incrementWatched(titleId);
}

function closePlayerHandler() {
    playerOverlay.classList.remove('show');
    if (progressInterval) {
        clearInterval(progressInterval);
        progressInterval = null;
    }
    // Сохраняем финальный прогресс
    if (currentTitleId && currentSeason && currentEpisode) {
        saveProgress(currentTitleId, currentSeason, currentEpisode, videoPlayer.currentTime);
    }
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
    if (e.key === 'Escape' && playerOverlay.classList.contains('show')) {
        closePlayerHandler();
    }
});

// Сохраняем прогресс при закрытии вкладки
window.addEventListener('beforeunload', () => {
    if (currentTitleId && currentSeason && currentEpisode) {
        saveProgress(currentTitleId, currentSeason, currentEpisode, videoPlayer.currentTime);
    }
});
