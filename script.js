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
const resultsContainer = document.getElementById('resultsContainer');
const detailsContainer = document.getElementById('detailsContainer');
const detailsContent = document.getElementById('detailsContent');
const backBtn = document.getElementById('backBtn');
const playerOverlay = document.getElementById('playerOverlay');
const videoPlayer = document.getElementById('videoPlayer');
const videoSource = document.getElementById('videoSource');
const closePlayer = document.getElementById('closePlayer');

// === ДАННЫЕ ===
let allTitles = []; // Будет загружено из data.json

// === ЗАГРУЗКА ДАННЫХ ===
async function loadData() {
    try {
        const response = await fetch('data.json');
        const data = await response.json();
        allTitles = data.titles;
        // Показываем все тайтлы при загрузке
        renderResults(allTitles);
    } catch (error) {
        console.error('Ошибка загрузки data.json:', error);
        resultsContainer.innerHTML = `
            <div class="no-results">
                <span>⚠️</span>
                Не удалось загрузить базу данных. Проверь файл data.json.
            </div>
        `;
    }
}

// === ПРОВЕРКА СЕССИИ ===
if (localStorage.getItem('loggedIn') === 'true') {
    loginScreen.style.display = 'none';
    mainContent.style.display = 'block';
    loadData(); // Загружаем данные после входа
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
        loadData(); // Загружаем данные после входа
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

// === ПОИСК ===
function searchTitles(query) {
    if (!query.trim()) {
        return allTitles;
    }
    
    const lowerQuery = query.toLowerCase().trim();
    return allTitles.filter(item => {
        return item.title.toLowerCase().includes(lowerQuery) ||
               item.type.toLowerCase().includes(lowerQuery) ||
               String(item.year).includes(lowerQuery);
    });
}

function handleSearch() {
    const query = searchInput.value;
    const results = searchTitles(query);
    renderResults(results);
}

searchBtn.addEventListener('click', handleSearch);
searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleSearch();
});

// === ОТОБРАЖЕНИЕ РЕЗУЛЬТАТОВ ===
function renderResults(titles) {
    detailsContainer.classList.remove('active');
    detailsContainer.style.display = 'none';
    resultsContainer.style.display = 'block';
    
    if (titles.length === 0) {
        resultsContainer.innerHTML = `
            <div class="no-results">
                <span>😢</span>
                Ничего не найдено. Попробуй другой запрос.
            </div>
        `;
        return;
    }
    
    let html = '<div class="results-grid">';
    titles.forEach(item => {
        html += `
            <div class="result-card" data-id="${item.id}">
                <img src="${item.poster}" alt="${item.title}">
                <div class="info">
                    <h3>${item.title}</h3>
                    <div class="meta">
                        <span>${item.type}</span>
                        <span>${item.year}</span>
                    </div>
                </div>
            </div>
        `;
    });
    html += '</div>';
    resultsContainer.innerHTML = html;
    
    // Клик по карточке → показать серии
    document.querySelectorAll('.result-card').forEach(card => {
        card.addEventListener('click', () => {
            const id = parseInt(card.dataset.id);
            const titleData = allTitles.find(t => t.id === id);
            if (titleData) showDetails(titleData);
        });
    });
}

// === ПОКАЗАТЬ СЕРИИ ===
function showDetails(titleData) {
    resultsContainer.style.display = 'none';
    detailsContainer.style.display = 'block';
    detailsContainer.classList.add('active');
    
    let html = `
        <div class="detail-header">
            <img src="${titleData.poster}" alt="${titleData.title}">
            <div class="info">
                <h2>${titleData.title}</h2>
                <div class="meta">
                    <span>${titleData.type}</span>
                    <span>${titleData.year}</span>
                </div>
                <p class="description">${titleData.description || ''}</p>
            </div>
        </div>
    `;
    
    titleData.seasons.forEach(season => {
        html += `<div class="season-block">`;
        html += `<h3>Сезон ${season.season}</h3>`;
        season.episodes.forEach(ep => {
            html += `
                <div class="episode-item" data-src="${ep.src}">
                    <span class="ep-number">${ep.number}</span>
                    <span class="ep-title">${ep.title}</span>
                    <button class="play-ep-btn">▶ Смотреть</button>
                </div>
            `;
        });
        html += `</div>`;
    });
    
    detailsContent.innerHTML = html;
    
    // Клик по серии → открыть плеер
    document.querySelectorAll('.episode-item').forEach(item => {
        item.addEventListener('click', (e) => {
            // Если кликнули на кнопку, не дублируем
            if (e.target.classList.contains('play-ep-btn')) return;
            openPlayer(item.dataset.src);
        });
        
        // Клик по кнопке "Смотреть"
        item.querySelector('.play-ep-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            openPlayer(item.dataset.src);
        });
    });
}

// === НАЗАД ===
backBtn.addEventListener('click', () => {
    detailsContainer.classList.remove('active');
    detailsContainer.style.display = 'none';
    resultsContainer.style.display = 'block';
    // Показываем все тайтлы
    renderResults(allTitles);
});

// === ПЛЕЕР ===
function openPlayer(videoUrl) {
    if (!videoUrl || videoUrl === 'ССЫЛКА_НА_ВИДЕО_В_MEGA') {
        alert('⚠️ Ссылка на видео отсутствует. Добавь src в data.json.');
        return;
    }
    
    videoSource.src = videoUrl;
    videoPlayer.load();
    playerOverlay.style.display = 'flex';
    videoPlayer.play().catch(() => {});
}

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
