// Rick and Morty Character Store
// Wubba Lubba Dub Dub!

// Глобальное состояние корзины
let cart = {};
let totalItems = 0;
let totalPrice = 0;
let characters = [];
let currentPage = 1;
let isLoading = false;

// API URL
const API_BASE_URL = 'https://rickandmortyapi.com/api/character';

// Функции для работы с localStorage
function loadCart() {
    const savedCart = localStorage.getItem('rickMortyCart');
    const savedTotalItems = localStorage.getItem('rickMortyTotalItems');
    const savedTotalPrice = localStorage.getItem('rickMortyTotalPrice');
    
    if (savedCart) {
        cart = JSON.parse(savedCart);
        totalItems = parseInt(savedTotalItems) || 0;
        totalPrice = parseFloat(savedTotalPrice) || 0;
        console.log('Cart loaded from localStorage:', cart);
    }
}

function saveCart() {
    localStorage.setItem('rickMortyCart', JSON.stringify(cart));
    localStorage.setItem('rickMortyTotalItems', totalItems.toString());
    localStorage.setItem('rickMortyTotalPrice', totalPrice.toString());
    console.log('Cart saved to localStorage:', cart);
}

// Функция форматирования цены (в долларах для тематики)
function formatPrice(price) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(price);
}

// Функция генерации случайной цены для персонажа
function generateCharacterPrice(character) {
    // Базовые цены в зависимости от статуса и вида
    let basePrice = 50;
    
    if (character.status === 'Alive') basePrice += 100;
    if (character.status === 'Dead') basePrice += 50;
    if (character.species === 'Human') basePrice += 200;
    if (character.species === 'Alien') basePrice += 150;
    if (character.species === 'Robot') basePrice += 300;
    if (character.species === 'Mythological Creature') basePrice += 500;
    
    // Бонус за количество эпизодов
    basePrice += character.episode.length * 10;
    
    // Случайный множитель от 0.8 до 1.5
    const multiplier = 0.8 + Math.random() * 0.7;
    
    return Math.round(basePrice * multiplier);
}

// Функция получения статуса персонажа с эмодзи
function getStatusEmoji(status) {
    switch (status) {
        case 'Alive': return '🟢';
        case 'Dead': return '🔴';
        case 'unknown': return '⚪';
        default: return '❓';
    }
}

// Функция получения эмодзи вида
function getSpeciesEmoji(species) {
    switch (species.toLowerCase()) {
        case 'human': return '👤';
        case 'alien': return '👽';
        case 'robot': return '🤖';
        case 'mythological creature': return '🐉';
        case 'animal': return '🐾';
        case 'cronenberg': return '🧬';
        case 'disease': return '🦠';
        case 'parasite': return '🪱';
        default: return '👾';
    }
}

// Функция загрузки персонажей из API
async function loadCharacters(page = 1) {
    if (isLoading) return;
    
    isLoading = true;
    const loadingElement = document.getElementById('loading');
    if (loadingElement) {
        loadingElement.style.display = 'block';
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}?page=${page}`);
        const data = await response.json();
        
        if (data.results) {
            characters = data.results;
            renderCharacters();
            currentPage = page;
        }
    } catch (error) {
        console.error('Ошибка загрузки персонажей:', error);
        showError('Не удалось загрузить персонажей из мультивселенной!');
    } finally {
        isLoading = false;
        if (loadingElement) {
            loadingElement.style.display = 'none';
        }
    }
}

// Функция отображения ошибки
function showError(message) {
    const catalog = document.getElementById('catalog');
    catalog.innerHTML = `
        <div class="error-message">
            <div class="error-icon">💥</div>
            <h3>Ошибка загрузки!</h3>
            <p>${message}</p>
            <button onclick="loadCharacters(1)" class="retry-btn">Попробовать снова</button>
        </div>
    `;
}

// Функция создания карточки персонажа
function createCharacterCard(character) {
    const price = generateCharacterPrice(character);
    const statusEmoji = getStatusEmoji(character.status);
    const speciesEmoji = getSpeciesEmoji(character.species);
    
    return `
        <div class="character-card" data-character-id="${character.id}">
            <div class="character-image" onclick="goToCharacterPage(${character.id})">
                <img src="${character.image}" alt="${character.name}" loading="lazy">
                <div class="character-badge ${character.status.toLowerCase()}">
                    ${statusEmoji} ${character.status}
                </div>
                <div class="character-species">
                    ${speciesEmoji} ${character.species}
                </div>
                <div class="click-hint">Click for details</div>
            </div>
            
            <div class="character-info">
                <h3 class="character-name" onclick="goToCharacterPage(${character.id})">${character.name}</h3>
                <div class="character-details">
                    <p class="character-gender">${character.gender}</p>
                    <p class="character-origin">📍 ${character.origin.name}</p>
                    <p class="character-location">🏠 ${character.location.name}</p>
                    <p class="character-episodes">📺 ${character.episode.length} episodes</p>
                </div>
                <p class="price">${formatPrice(price)}</p>
            </div>
            
            <div class="cart-controls">
                <button class="cart-button add-to-cart" data-character-id="${character.id}" data-price="${price}">
                    <svg class="cart-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="9" cy="21" r="1"></circle>
                        <circle cx="20" cy="21" r="1"></circle>
                        <path d="m1 1 4 4 13 0 3 8-13 0"></path>
                    </svg>
                    <span>Add to Portal</span>
                </button>
                
                <div class="quantity-controls">
                    <button class="quantity-btn minus-btn" data-character-id="${character.id}">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                    </button>
                    <span class="quantity">1</span>
                    <button class="quantity-btn plus-btn" data-character-id="${character.id}">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Функция отображения персонажей
function renderCharacters() {
    const catalog = document.getElementById('catalog');
    const charactersHTML = characters.map(character => createCharacterCard(character)).join('');
    
    catalog.innerHTML = `
        <div class="characters-grid">
            ${charactersHTML}
        </div>
        <div class="pagination">
            <button class="pagination-btn" id="prevPage" ${currentPage === 1 ? 'disabled' : ''}>
                ← Previous Dimension
            </button>
            <span class="page-info">Dimension ${currentPage} of 42</span>
            <button class="pagination-btn" id="nextPage" ${currentPage === 42 ? 'disabled' : ''}>
                Next Dimension →
            </button>
        </div>
    `;
    
    // Инициализация обработчиков для новых карточек
    initializeCharacterCards();
    initializePagination();
}

// Функция инициализации карточек персонажей
function initializeCharacterCards() {
    characters.forEach(character => {
        const characterCard = document.querySelector(`[data-character-id="${character.id}"]`);
        if (!characterCard) return;
        
        const addToCartBtn = characterCard.querySelector('.add-to-cart');
        const plusBtn = characterCard.querySelector('.plus-btn');
        const minusBtn = characterCard.querySelector('.minus-btn');
        const quantityDisplay = characterCard.querySelector('.quantity');
        
        let quantity = 1;
        let isAnimating = false;
        
        // Инициализация корзины для персонажа
        if (!cart[character.id]) {
            cart[character.id] = { quantity: 0, totalPrice: 0, character: character };
        }
        
        // Обработчики для кнопок количества
        plusBtn.addEventListener('click', () => {
            if (isAnimating) return;
            quantity++;
            quantityDisplay.textContent = quantity;
            updateCharacterPrice(character.id, quantity);
            updateAddToCartButton(character.id, quantity);
            
            plusBtn.style.transform = 'scale(0.9)';
            setTimeout(() => {
                plusBtn.style.transform = '';
            }, 150);
        });
        
        minusBtn.addEventListener('click', () => {
            if (isAnimating || quantity <= 1) return;
            quantity--;
            quantityDisplay.textContent = quantity;
            updateCharacterPrice(character.id, quantity);
            updateAddToCartButton(character.id, quantity);
            
            minusBtn.style.transform = 'scale(0.9)';
            setTimeout(() => {
                minusBtn.style.transform = '';
            }, 150);
        });
        
        // Обработчик добавления в корзину
        addToCartBtn.addEventListener('click', () => {
            if (isAnimating) return;
            
            isAnimating = true;
            const price = parseInt(addToCartBtn.dataset.price);
            
            // Обновляем корзину
            cart[character.id].quantity += quantity;
            cart[character.id].totalPrice = cart[character.id].quantity * price;
            totalItems += quantity;
            totalPrice += quantity * price;
            
            // Сохраняем корзину в localStorage
            saveCart();
            
            // Обновляем сводку корзины
            updateCartSummary();
            
            // Анимация добавления
            addToCartBtn.classList.add('added');
            const buttonText = addToCartBtn.querySelector('span');
            const originalText = buttonText.textContent;
            buttonText.textContent = 'Portalized!';
            
            // Эффект частиц
            createParticles(addToCartBtn);
            
            setTimeout(() => {
                addToCartBtn.classList.remove('added');
                buttonText.textContent = originalText;
                isAnimating = false;
            }, 2500);
            
            console.log(`Added to portal: ${character.name} - ${quantity} for ${formatPrice(quantity * price)}`);
        });
    });
}

// Функция инициализации пагинации
function initializePagination() {
    const prevBtn = document.getElementById('prevPage');
    const nextBtn = document.getElementById('nextPage');
    
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            if (currentPage > 1) {
                loadCharacters(currentPage - 1);
            }
        });
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            if (currentPage < 42) {
                loadCharacters(currentPage + 1);
            }
        });
    }
}

// Функция обновления цены персонажа
function updateCharacterPrice(characterId, quantity) {
    const characterCard = document.querySelector(`[data-character-id="${characterId}"]`);
    const priceElement = characterCard.querySelector('.price');
    const addToCartBtn = characterCard.querySelector('.add-to-cart');
    const price = parseInt(addToCartBtn.dataset.price);
    const totalPrice = price * quantity;
    
    priceElement.style.transform = 'scale(1.1)';
    priceElement.style.color = '#00ff88';
    
    setTimeout(() => {
        priceElement.textContent = formatPrice(totalPrice);
        priceElement.style.transform = 'scale(1)';
        priceElement.style.color = '#ff6b6b';
    }, 150);
}

// Функция обновления кнопки "Add to Portal"
function updateAddToCartButton(characterId, quantity) {
    const characterCard = document.querySelector(`[data-character-id="${characterId}"]`);
    const addToCartBtn = characterCard.querySelector('.add-to-cart');
    const buttonText = addToCartBtn.querySelector('span');
    const price = parseInt(addToCartBtn.dataset.price);
    const totalPrice = price * quantity;
    
    if (quantity === 1) {
        buttonText.textContent = 'Add to Portal';
    } else {
        buttonText.textContent = `Add ${quantity} to Portal`;
    }
    
    addToCartBtn.title = `Add to portal for ${formatPrice(totalPrice)}`;
}

// Функция создания эффекта частиц
function createParticles(element) {
    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    for (let i = 0; i < 12; i++) {
        const particle = document.createElement('div');
        particle.style.cssText = `
            position: fixed;
            width: 8px;
            height: 8px;
            background: linear-gradient(45deg, #00ff88, #00d4ff);
            border-radius: 50%;
            pointer-events: none;
            z-index: 1000;
            left: ${centerX}px;
            top: ${centerY}px;
            animation: portalParticle 1.5s ease-out forwards;
        `;
        
        document.body.appendChild(particle);
        
        setTimeout(() => {
            particle.remove();
        }, 1500);
    }
}

// Функция обновления сводки корзины
function updateCartSummary() {
    const cartBadge = document.getElementById('cartBadge');
    
    if (cartBadge) {
        cartBadge.textContent = totalItems;
        cartBadge.style.display = totalItems > 0 ? 'block' : 'none';
    }
}

// Функция переключения между каталогом и корзиной
function showCatalog() {
    document.getElementById('catalog').style.display = 'block';
    document.getElementById('cartPage').style.display = 'none';
    document.getElementById('catalogBtn').classList.add('active');
    document.getElementById('cartBtn').classList.remove('active');
}

function showCart() {
    document.getElementById('catalog').style.display = 'none';
    document.getElementById('cartPage').style.display = 'block';
    document.getElementById('catalogBtn').classList.remove('active');
    document.getElementById('cartBtn').classList.add('active');
    renderCartItems();
}

// Функция отображения товаров в корзине
function renderCartItems() {
    const cartItemsContainer = document.getElementById('cartItems');
    const totalItemsCount = document.getElementById('totalItemsCount');
    const totalPriceAmount = document.getElementById('totalPriceAmount');
    
    cartItemsContainer.innerHTML = '';
    
    const hasItems = Object.values(cart).some(item => item.quantity > 0);
    
    if (!hasItems) {
        cartItemsContainer.innerHTML = `
            <div class="empty-cart">
                <div class="empty-cart-icon">🌀</div>
                <h3>Your Portal Bag is Empty</h3>
                <p>Add some characters from the multiverse to get started!</p>
            </div>
        `;
        totalItemsCount.textContent = '0';
        totalPriceAmount.textContent = '$0';
        document.getElementById('checkoutBtn').disabled = true;
        return;
    }
    
    Object.keys(cart).forEach(characterId => {
        const cartItem = cart[characterId];
        if (cartItem.quantity > 0) {
            const character = cartItem.character;
            const cartItemElement = createCartItemElement(character, cartItem);
            cartItemsContainer.appendChild(cartItemElement);
        }
    });
    
    totalItemsCount.textContent = totalItems;
    totalPriceAmount.textContent = formatPrice(totalPrice);
    document.getElementById('checkoutBtn').disabled = false;
}

// Функция создания элемента персонажа в корзине
function createCartItemElement(character, cartItem) {
    const cartItemDiv = document.createElement('div');
    cartItemDiv.className = 'cart-item';
    cartItemDiv.innerHTML = `
        <div class="cart-item-image">
            <img src="${character.image}" alt="${character.name}">
        </div>
        <div class="cart-item-info">
            <div class="cart-item-name">${character.name}</div>
            <div class="cart-item-details">
                <span class="status">${getStatusEmoji(character.status)} ${character.status}</span>
                <span class="species">${getSpeciesEmoji(character.species)} ${character.species}</span>
            </div>
        </div>
        <div class="cart-item-controls">
            <div class="cart-quantity-controls">
                <button class="cart-quantity-btn minus" data-character-id="${character.id}">-</button>
                <span class="cart-quantity">${cartItem.quantity}</span>
                <button class="cart-quantity-btn plus" data-character-id="${character.id}">+</button>
            </div>
            <div class="cart-item-total">${formatPrice(cartItem.totalPrice)}</div>
            <button class="remove-item-btn" data-character-id="${character.id}" title="Remove from portal">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="3,6 5,6 21,6"></polyline>
                    <path d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"></path>
                </svg>
            </button>
        </div>
    `;
    
    return cartItemDiv;
}

// Функция обновления количества персонажа в корзине
function updateCartItemQuantity(characterId, change) {
    const cartItem = cart[characterId];
    if (!cartItem) return;
    
    const newQuantity = cartItem.quantity + change;
    
    if (newQuantity <= 0) {
        totalItems -= cartItem.quantity;
        totalPrice -= cartItem.totalPrice;
        cart[characterId] = { quantity: 0, totalPrice: 0, character: cartItem.character };
    } else {
        const quantityDiff = newQuantity - cartItem.quantity;
        const pricePerItem = cartItem.totalPrice / cartItem.quantity;
        totalItems += quantityDiff;
        totalPrice += quantityDiff * pricePerItem;
        
        cartItem.quantity = newQuantity;
        cartItem.totalPrice = newQuantity * pricePerItem;
    }
    
    // Сохраняем корзину в localStorage
    saveCart();
    
    updateCartSummary();
    renderCartItems();
}

// Функция удаления персонажа из корзины
function removeCartItem(characterId) {
    const cartItem = cart[characterId];
    if (!cartItem) return;
    
    totalItems -= cartItem.quantity;
    totalPrice -= cartItem.totalPrice;
    cart[characterId] = { quantity: 0, totalPrice: 0, character: cartItem.character };
    
    // Сохраняем корзину в localStorage
    saveCart();
    
    updateCartSummary();
    renderCartItems();
}

// Функция очистки корзины
function clearCart() {
    if (confirm('Are you sure you want to destroy the portal? This will remove all characters!')) {
        Object.keys(cart).forEach(characterId => {
            cart[characterId] = { quantity: 0, totalPrice: 0, character: cart[characterId].character };
        });
        totalItems = 0;
        totalPrice = 0;
        
        // Сохраняем корзину в localStorage
        saveCart();
        
        updateCartSummary();
        renderCartItems();
    }
}

// Функция оформления заказа
function checkout() {
    if (totalItems === 0) {
        alert('Your portal bag is empty!');
        return;
    }
    
    const orderSummary = Object.keys(cart)
        .filter(characterId => cart[characterId].quantity > 0)
        .map(characterId => {
            const cartItem = cart[characterId];
            return `${cartItem.character.name} - ${cartItem.quantity} (${formatPrice(cartItem.totalPrice)})`;
        })
        .join('\n');
    
    alert(`Portal Order Complete!\n\nCharacters:\n${orderSummary}\n\nTotal: ${formatPrice(totalPrice)}\n\nWubba Lubba Dub Dub! Thanks for shopping!`);
    
    clearCart();
}

// Функция перехода на страницу персонажа
window.goToCharacterPage = function(characterId) {
    window.location.href = `character.html?id=${characterId}`;
};

// Функция показа детальной информации о персонаже (устарела - используется отдельная страница)
window.showCharacterDetail = async function(characterId) {
    console.log('showCharacterDetail called with ID:', characterId);
    const modal = document.getElementById('characterModal');
    const modalBody = document.getElementById('modalBody');
    
    if (!modal || !modalBody) {
        console.error('Modal elements not found!');
        return;
    }
    
    // Показываем загрузку
    modalBody.innerHTML = `
        <div class="loading">
            <div class="portal-loader">
                <div class="portal-ring"></div>
                <div class="portal-ring"></div>
                <div class="portal-ring"></div>
            </div>
            <p>Scanning character data...</p>
        </div>
    `;
    
    modal.classList.add('active');
    
    try {
        // Загружаем детальную информацию о персонаже
        const response = await fetch(`${API_BASE_URL}/${characterId}`);
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
        
        modalBody.innerHTML = `
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
                <button class="action-btn secondary" onclick="closeCharacterModal()">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M18 6L6 18"></path>
                        <path d="M6 6l12 12"></path>
                    </svg>
                    Close
                </button>
            </div>
        `;
        
    } catch (error) {
        console.error('Error loading character details:', error);
        modalBody.innerHTML = `
            <div class="error-message">
                <div class="error-icon">💥</div>
                <h3>Error Loading Character</h3>
                <p>Failed to load character data from the multiverse!</p>
                <button onclick="closeCharacterModal()" class="retry-btn">Close</button>
            </div>
        `;
    }
}

// Функция закрытия модального окна
window.closeCharacterModal = function() {
    console.log('closeCharacterModal called');
    const modal = document.getElementById('characterModal');
    if (modal) {
        modal.classList.remove('active');
    }
}

// Функция добавления персонажа в корзину из модального окна
window.addCharacterToCart = function(characterId, price) {
    const character = characters.find(c => c.id === characterId);
    if (!character) return;
    
    // Обновляем корзину
    if (!cart[characterId]) {
        cart[characterId] = { quantity: 0, totalPrice: 0, character: character };
    }
    
    cart[characterId].quantity += 1;
    cart[characterId].totalPrice = cart[characterId].quantity * price;
    totalItems += 1;
    totalPrice += price;
    
    // Сохраняем корзину в localStorage
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
}

// Добавляем CSS для анимации частиц
const style = document.createElement('style');
style.textContent = `
    @keyframes portalParticle {
        0% {
            transform: translate(0, 0) scale(1);
            opacity: 1;
        }
        100% {
            transform: translate(${Math.random() * 300 - 150}px, ${Math.random() * 300 - 150}px) scale(0);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    // Загружаем корзину из localStorage
    loadCart();
    
    // Обновляем сводку корзины
    updateCartSummary();
    
    // Загружаем первых персонажей
    loadCharacters(1);
    
    // Обработчики навигации
    document.getElementById('catalogBtn').addEventListener('click', showCatalog);
    document.getElementById('cartBtn').addEventListener('click', showCart);
    
    // Обработчики корзины
    document.getElementById('clearCartBtn').addEventListener('click', clearCart);
    document.getElementById('checkoutBtn').addEventListener('click', checkout);
    
    // Обработчики для динамически создаваемых элементов корзины
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('cart-quantity-btn')) {
            const characterId = parseInt(e.target.dataset.characterId);
            const isPlus = e.target.classList.contains('plus');
            updateCartItemQuantity(characterId, isPlus ? 1 : -1);
        }
        
        if (e.target.closest('.remove-item-btn')) {
            const characterId = parseInt(e.target.closest('.remove-item-btn').dataset.characterId);
            removeCartItem(characterId);
        }
    });
    
    // Обработчики модального окна
    document.getElementById('modalClose').addEventListener('click', window.closeCharacterModal);
    document.getElementById('modalOverlay').addEventListener('click', window.closeCharacterModal);
    
    // Закрытие модального окна по Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            window.closeCharacterModal();
        }
    });
    
    // Показываем каталог по умолчанию
    showCatalog();
});