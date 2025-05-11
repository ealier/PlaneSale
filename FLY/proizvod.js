// proizvod.js - Логика для страницы proizvod.html

let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Инициализация
document.addEventListener('DOMContentLoaded', function() {
    updateCartCount();

    // Обработчики фильтров и сортировки
    const priceFilter = document.getElementById('price-filter');
    const typeFilter = document.getElementById('type-filter');
    const sortBy = document.getElementById('sort-by');
    const searchButton = document.getElementById('search-button');
    const searchInput = document.getElementById('search-input');
    const resetFiltersBtn = document.getElementById('reset-filters');

    if (priceFilter) priceFilter.addEventListener('change', filterPlanes);
    if (typeFilter) typeFilter.addEventListener('change', filterPlanes);
    if (sortBy) sortBy.addEventListener('change', sortPlanes);
    if (searchButton) searchButton.addEventListener('click', searchPlanes);
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') searchPlanes();
        });
    }
    if (resetFiltersBtn) resetFiltersBtn.addEventListener('click', resetFilters);

    // Избранное
    document.querySelectorAll('.wishlist-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            this.classList.toggle('active');
            const icon = this.querySelector('i');
            if (this.classList.contains('active')) {
                icon.classList.remove('far');
                icon.classList.add('fas');
                addToWishlist(this.dataset.name);
            } else {
                icon.classList.remove('fas');
                icon.classList.add('far');
                removeFromWishlist(this.dataset.name);
            }
        });
    });

    // Быстрый просмотр
    document.querySelectorAll('.plane-card').forEach(card => {
        card.addEventListener('click', function(e) {
            if (!e.target.classList.contains('add-to-cart-btn') && !e.target.classList.contains('wishlist-btn')) {
                e.preventDefault();
                const name = this.dataset.name;
                const price = this.dataset.price;
                const image = this.dataset.image;
                showQuickView(name, price, image);
            }
        });
    });

    // Корзина
    const cartButton = document.getElementById('cartButton');
    const closeCartModal = document.getElementById('closeCartModal');
    const checkoutBtn = document.getElementById('checkoutBtn');

    if (cartButton) {
        cartButton.addEventListener('click', openCartModal);
    }

    if (closeCartModal) {
        closeCartModal.addEventListener('click', function() {
            closeModal('cartModal');
        });
    }

    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', function() {
            if (cart.length > 0) {
                localStorage.setItem('cart', JSON.stringify(cart));
                window.location.href = 'checkout.html';
            } else {
                alert('Корзина пуста. Нечего оформлять.');
            }
        });
    }

    // Добавление в корзину
    document.querySelectorAll('.add-to-cart-btn').forEach(button => {
        button.addEventListener('click', function() {
            const itemName = this.dataset.name;
            const itemPrice = parseFloat(this.dataset.price);
            const itemImage = this.dataset.image;
            addItemToCart(itemName, itemPrice, itemImage);
            animateToCart(this, itemImage);
        });
    });
});

// Функции корзины
function addItemToCart(name, price, image) {
    const existingItem = cart.find(item => item.name === name);

    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({
            name: name,
            price: price,
            image: image,
            quantity: 1
        });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
}

function updateCartCount() {
    const cartCountSpan = document.getElementById('cart-count');
    if (cartCountSpan) {
        const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCountSpan.textContent = totalQuantity;
    }
}

function openCartModal() {
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotalPriceElement = document.getElementById('cart-total-price');
    
    cartItemsContainer.innerHTML = '';

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p>В корзине пока ничего нет.</p>';
        cartTotalPriceElement.textContent = '0 ₽';
    } else {
        let totalPrice = 0;

        cart.forEach(item => {
            const cartItemDiv = document.createElement('div');
            cartItemDiv.classList.add('cart-item');

            const itemTotal = item.price * item.quantity;
            totalPrice += itemTotal;

            cartItemDiv.innerHTML = `
                <img src="${item.image}" alt="${item.name}">
                <div class="cart-item-details">
                    <div class="cart-item-name">${item.name}</div>
                    <div>${item.price.toLocaleString()} ₽</div>
                    <div class="cart-item-quantity">
                        <button class="quantity-button decrease" data-name="${item.name}">-</button>
                        <span>${item.quantity}</span>
                        <button class="quantity-button increase" data-name="${item.name}">+</button>
                    </div>
                </div>
            `;
            cartItemsContainer.appendChild(cartItemDiv);
        });

        cartTotalPriceElement.textContent = totalPrice.toLocaleString() + ' ₽';

        document.querySelectorAll('.quantity-button').forEach(button => {
            button.addEventListener('click', function() {
                const itemName = this.dataset.name;
                const type = this.classList.contains('increase') ? 'increase' : 'decrease';
                changeQuantity(itemName, type);
            });
        });
    }
    openModal('cartModal');
}

function changeQuantity(itemName, type) {
    const item = cart.find(item => item.name === itemName);

    if (item) {
        if (type === 'increase') {
            item.quantity++;
        } else if (type === 'decrease' && item.quantity > 1) {
            item.quantity--;
        } else if (type === 'decrease' && item.quantity === 1) {
            cart = cart.filter(item => item.name !== itemName);
        }

        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
        openCartModal();
    }
}

function animateToCart(button, imageSrc) {
    const flyingItem = document.getElementById('flying-item');
    const flyingItemImage = document.getElementById('flying-item-image');

    flyingItemImage.src = imageSrc;

    const buttonRect = button.getBoundingClientRect();
    const cartIconRect = document.getElementById('cartButton').getBoundingClientRect();

    flyingItem.style.left = buttonRect.left + buttonRect.width / 2 - 25 + 'px';
    flyingItem.style.top = buttonRect.top + buttonRect.height / 2 - 25 + 'px';
    flyingItem.style.opacity = 1;
    flyingItem.style.display = 'block';

    const deltaX = cartIconRect.left - buttonRect.left;
    const deltaY = cartIconRect.top - buttonRect.top;

    flyingItem.style.transition = 'transform 0.5s ease-in-out, opacity 0.5s ease-in-out';
    flyingItem.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(0.2)`;

    setTimeout(() => {
        flyingItem.style.transition = 'none';
        flyingItem.style.opacity = 0;
        flyingItem.style.transform = 'translate(0, 0) scale(1)';
        flyingItem.style.display = 'none';
    }, 500);
}

// Функции фильтров и сортировки
function filterPlanes() {
    const priceFilter = document.getElementById('price-filter').value;
    const typeFilter = document.getElementById('type-filter').value;
    
    document.querySelectorAll('.plane-card').forEach(card => {
        const price = parseFloat(card.dataset.price);
        const name = card.dataset.name.toLowerCase();
        let priceMatch = true;
        let typeMatch = true;
        
        if (priceFilter !== 'all') {
            const [min, max] = priceFilter.split('-').map(Number);
            if (max && (price < min || price > max)) priceMatch = false;
            if (!max && price < min) priceMatch = false;
        }
        
        if (typeFilter !== 'all') {
            if (typeFilter === 'business' && !name.includes('bombardier') && !name.includes('gulfstream')) typeMatch = false;
            if (typeFilter === 'commercial' && !name.includes('boeing') && !name.includes('airbus')) typeMatch = false;
            if (typeFilter === 'light' && !name.includes('cessna') && !name.includes('zlin')) typeMatch = false;
        }
        
        if (priceMatch && typeMatch) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

function sortPlanes() {
    const sortBy = document.getElementById('sort-by').value;
    const container = document.querySelector('.plane-cards-container');
    const cards = Array.from(document.querySelectorAll('.plane-card'));
    
    cards.sort((a, b) => {
        const aPrice = parseFloat(a.dataset.price);
        const bPrice = parseFloat(b.dataset.price);
        const aName = a.dataset.name.toLowerCase();
        const bName = b.dataset.name.toLowerCase();
        
        switch (sortBy) {
            case 'price-asc': return aPrice - bPrice;
            case 'price-desc': return bPrice - aPrice;
            case 'name-asc': return aName.localeCompare(bName);
            case 'name-desc': return bName.localeCompare(aName);
            default: return 0;
        }
    });
    
    container.innerHTML = '';
    cards.forEach(card => container.appendChild(card));
}

function searchPlanes() {
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    
    document.querySelectorAll('.plane-card').forEach(card => {
        const name = card.dataset.name.toLowerCase();
        if (name.includes(searchTerm)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

function resetFilters() {
    document.getElementById('price-filter').value = 'all';
    document.getElementById('type-filter').value = 'all';
    document.getElementById('sort-by').value = 'default';
    document.getElementById('search-input').value = '';
    
    document.querySelectorAll('.plane-card').forEach(card => {
        card.style.display = 'block';
    });
    
    const container = document.querySelector('.plane-cards-container');
    const cards = Array.from(document.querySelectorAll('.plane-card'));
    container.innerHTML = '';
    cards.forEach(card => container.appendChild(card));
}

// Избранное
function addToWishlist(name) {
    let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
    if (!wishlist.includes(name)) {
        wishlist.push(name);
        localStorage.setItem('wishlist', JSON.stringify(wishlist));
    }
}

function removeFromWishlist(name) {
    let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
    wishlist = wishlist.filter(item => item !== name);
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
}

// Быстрый просмотр
function showQuickView(name, price, image) {
    const quickViewHTML = `
        <div class="quick-view-modal">
            <div class="quick-view-content">
                <span class="close-quick-view">×</span>
                <div class="quick-view-image">
                    <img src="${image}" alt="${name}">
                </div>
                <div class="quick-view-details">
                    <h3>${name}</h3>
                    <div class="quick-view-price">${Number(price).toLocaleString()} ₽</div>
                    <p class="quick-view-description">Здесь будет подробное описание самолета, его характеристики и особенности.</p>
                    <button class="button primary add-to-cart-quick-view" 
                            data-name="${name}" 
                            data-price="${price}" 
                            data-image="${image}">
                        В корзину
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', quickViewHTML);
    
    document.querySelector('.close-quick-view').addEventListener('click', () => {
        document.querySelector('.quick-view-modal').remove();
    });
    
    document.querySelector('.add-to-cart-quick-view').addEventListener('click', function() {
        addItemToCart(this.dataset.name, parseFloat(this.dataset.price), this.dataset.image);
        animateToCart(this, this.dataset.image);
        document.querySelector('.quick-view-modal').remove();
    });
}