// Константы
const API_BASE_URL = 'https://rickandmortyapi.com/api/character';

// Глобальные переменные
let cart = {};
let totalItems = 0;
let totalPrice = 0;

// Загружаем корзину из localStorage
function loadCart() {
    const savedCart = localStorage.getItem('rickMortyCart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
        totalItems = parseInt(localStorage.getItem('rickMortyTotalItems')) || 0;
        totalPrice = parseFloat(localStorage.getItem('rickMortyTotalPrice')) || 0;
    }
}

// Сохраняем корзину в localStorage
function saveCart() {
    localStorage.setItem('rickMortyCart', JSON.stringify(cart));
    localStorage.setItem('rickMortyTotalItems', totalItems.toString());
    localStorage.setItem('rickMortyTotalPrice', totalPrice.toString());
}

// Функция получения ID персонажа из URL
function getCharacterIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}

// Функция генерации цены персонажа
function generateCharacterPrice(character) {
    const basePrice = 100;
    const statusMultiplier = character.status === 'Alive' ? 1.5 : character.status === 'Dead' ? 0.8 : 1.0;
    const speciesMultiplier = character.species === 'Human' ? 1.2 : 1.0;
    const episodeMultiplier = 1 + (character.episode.length * 0.1);
    
    return Math.round(basePrice * statusMultiplier * speciesMultiplier * episodeMultiplier);
}

// Функция форматирования цены
function formatPrice(price) {
    return `$${price}`;
}

// Функция получения эмодзи статуса
function getStatusEmoji(status) {
    const statusEmojis = {
        'Alive': '🟢',
        'Dead': '🔴',
        'unknown': '⚪'
    };
    return statusEmojis[status] || '❓';
}

// Функция получения эмодзи вида
function getSpeciesEmoji(species) {
    const speciesEmojis = {
        'Human': '👤',
        'Alien': '👽',
        'Robot': '🤖',
        'Mythological Creature': '🐉',
        'Animal': '🐾',
        'Cronenberg': '🧬',
        'Disease': '🦠',
        'Parasite': '🪱'
    };
    return speciesEmojis[species] || '👽';
}

// Функция загрузки детальной информации о персонаже
async function loadCharacterDetail() {
    const characterId = getCharacterIdFromUrl();
    
    if (!characterId) {
        showError('Character ID not found in URL');
        return;
    }

    const loading = document.getElementById('loading');
    const content = document.getElementById('characterDetailContent');
    const error = document.getElementById('errorMessage');

    try {
        // Показываем загрузку
        loading.style.display = 'block';
        content.style.display = 'none';
        error.style.display = 'none';

        // Загружаем информацию о персонаже
        const response = await fetch(`${API_BASE_URL}/${characterId}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const character = await response.json();

        // Загружаем информацию об эпизодах
        const episodePromises = character.episode.slice(0, 10).map(episodeUrl => 
            fetch(episodeUrl).then(res => res.json())
        );
        const episodes = await Promise.all(episodePromises);

        // Создаем детальную информацию
        const price = generateCharacterPrice(character);
        const statusEmoji = getStatusEmoji(character.status);
        const speciesEmoji = getSpeciesEmoji(character.species);

        content.innerHTML = `
            <div class="character-detail-header">
                <div class="character-detail-image">
                    <img src="${character.image}" alt="${character.name}">
                </div>
                <div class="character-detail-info">
                    <h1 class="character-detail-name">${character.name}</h1>
                    <div class="character-detail-badges">
                        <div class="character-badge-detail status">
                            ${statusEmoji} ${character.status}
                        </div>
                        <div class="character-badge-detail species">
                            ${speciesEmoji} ${character.species}
                        </div>
                        <div class="character-badge-detail gender">
                            ${character.gender}
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="character-detail-stats">
                <div class="stat-card">
                    <span class="stat-icon">📺</span>
                    <div class="stat-label">Episodes</div>
                    <div class="stat-value">${character.episode.length}</div>
                </div>
                <div class="stat-card">
                    <span class="stat-icon">💰</span>
                    <div class="stat-label">Price</div>
                    <div class="stat-value">${formatPrice(price)}</div>
                </div>
                <div class="stat-card">
                    <span class="stat-icon">🆔</span>
                    <div class="stat-label">ID</div>
                    <div class="stat-value">#${character.id}</div>
                </div>
                <div class="stat-card">
                    <span class="stat-icon">📅</span>
                    <div class="stat-label">Created</div>
                    <div class="stat-value">${new Date(character.created).toLocaleDateString()}</div>
                </div>
            </div>
            
            <div class="character-detail-sections">
                <div class="detail-section">
                    <h3 class="section-title">
                        <span>📍</span>
                        Origin & Location
                    </h3>
                    <div class="section-content">
                        <p><strong>Origin:</strong> ${character.origin.name}</p>
                        <p><strong>Current Location:</strong> ${character.location.name}</p>
                        ${character.type ? `<p><strong>Type:</strong> ${character.type}</p>` : ''}
                    </div>
                </div>
                
                <div class="detail-section">
                    <h3 class="section-title">
                        <span>📺</span>
                        Recent Episodes
                    </h3>
                    <div class="section-content">
                        <p>Appeared in ${character.episode.length} episodes:</p>
                        <div class="episodes-list">
                            ${episodes.map(episode => `
                                <div class="episode-item" title="${episode.name}">
                                    ${episode.episode}
                                </div>
                            `).join('')}
                            ${character.episode.length > 10 ? `<div class="episode-item">+${character.episode.length - 10} more</div>` : ''}
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="character-actions">
                <button class="action-btn" onclick="addCharacterToCart(${character.id}, ${price})">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="9" cy="21" r="1"></circle>
                        <circle cx="20" cy="21" r="1"></circle>
                        <path d="m1 1 4 4 13 0 3 8-13 0"></path>
                    </svg>
                    Add to Portal
                </button>
                <button class="action-btn secondary" onclick="goBack()">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M19 12H5"></path>
                        <path d="M12 19l-7-7 7-7"></path>
                    </svg>
                    Back to Multiverse
                </button>
            </div>
        `;

        // Скрываем загрузку и показываем контент
        loading.style.display = 'none';
        content.style.display = 'block';

        // Обновляем заголовок страницы
        document.title = `${character.name} - Rick & Morty Store`;

    } catch (error) {
        console.error('Error loading character details:', error);
        showError('Failed to load character data from the multiverse!');
    }
}

// Функция показа ошибки
function showError(message) {
    const loading = document.getElementById('loading');
    const content = document.getElementById('characterDetailContent');
    const error = document.getElementById('errorMessage');

    loading.style.display = 'none';
    content.style.display = 'none';
    error.style.display = 'block';
    
    error.querySelector('p').textContent = message;
}

// Функция добавления персонажа в корзину
window.addCharacterToCart = function(characterId, price) {
    // Находим персонажа по ID (нужно будет загрузить из API или передать данные)
    const characterName = document.querySelector('.character-detail-name').textContent;
    
    // Создаем объект персонажа для корзины
    const character = {
        id: characterId,
        name: characterName,
        image: document.querySelector('.character-detail-image img').src,
        price: price
    };
    
    // Обновляем корзину
    if (!cart[characterId]) {
        cart[characterId] = { quantity: 0, totalPrice: 0, character: character };
    }
    
    cart[characterId].quantity += 1;
    cart[characterId].totalPrice = cart[characterId].quantity * price;
    totalItems += 1;
    totalPrice += price;
    
    // Сохраняем корзину
    saveCart();
    
    // Обновляем сводку корзины
    updateCartSummary();
    
    // Показываем уведомление
    const actionBtn = document.querySelector('.action-btn');
    const originalText = actionBtn.innerHTML;
    actionBtn.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 12l2 2 4-4"></path>
        </svg>
        Added to Portal!
    `;
    actionBtn.style.background = 'linear-gradient(135deg, #ff6b6b 0%, #ff8e8e 100%)';
    actionBtn.style.color = 'white';
    
    setTimeout(() => {
        actionBtn.innerHTML = originalText;
        actionBtn.style.background = '';
        actionBtn.style.color = '';
    }, 2000);
    
    console.log(`Added to portal: ${character.name} for ${formatPrice(price)}`);
};

// Функция обновления сводки корзины
function updateCartSummary() {
    const cartBadge = document.getElementById('cartBadge');
    if (cartBadge) {
        cartBadge.textContent = totalItems;
        cartBadge.style.display = totalItems > 0 ? 'block' : 'none';
    }
}

// Функция перехода назад
window.goBack = function() {
    window.location.href = 'index.html';
};

// Функция показа корзины
window.showCart = function() {
    window.location.href = 'index.html#cart';
};

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    loadCart();
    updateCartSummary();
    loadCharacterDetail();
});
