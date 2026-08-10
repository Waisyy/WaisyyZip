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
let currentEpisodeSrc = null;
let progressInterval = null;

// === КЛЮЧИ ДЛЯ ХРАНЕНИЯ ===
const PROGRESS_KEY = 'animebox_progress';
const WATCHED_KEY = 'animebox_watched';

// === ЗАГРУЗКА ДАННЫХ ===
async function loadData() {
    try {
        const response = await fetch('data.json');
        const data = await response.json();
        allTitles = data.titles;
        renderHomePage();
    } catch (error) {
        console.error('Ошибка загрузки data.json:', error);
        homePage.innerHTML = `
            <div class="no-results">
                <span>⚠️</span>
                Не удалось загрузить базу данных. Проверь файл data.json.
            </div>
        `;
    }
}

// === РАБОТА С ПРОГРЕССОМ ===
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

// === ОТОБРАЖЕНИЕ ГЛАВНОЙ ===
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

// === ОТОБРАЖЕНИЕ СЕТКИ ===
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
    
    // Клик по карточке
    container.querySelectorAll('.result-card').forEach(card => {
        card.addEventListener('click', () => {
            const id = parseInt(card.dataset.id);
            const titleData = allTitles.find(t => t.id === id);
            if (titleData) showDetails(titleData);
        });
    });
}

// === КАТЕГОРИИ ===
categoriesNav.addEventListener('click', (e) => {
    if (!e.target.classList.contains('category-btn')) return;
    
    // Обновляем активную кнопку
    document.querySelectorAll('.category-btn').forEach(btn => btn.classList.remove('active'));
    e.target.classList.add('active');
    
    currentFilter = e.target.dataset.filter;
    
    if (currentFilter === 'продолжить') {
        // Показать только те, где есть прогресс
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

// === ПОИСК ===
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
