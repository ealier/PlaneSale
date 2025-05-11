document.addEventListener('DOMContentLoaded', function() {
    // *** Модальные окна (Вход, Регистрация, Продажа, Корзина) ***
    function openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'block'; // Устанавливаем display: block
            modal.classList.add('show');
            document.body.classList.add('modal-open');
        }
    }

    function closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('show');
            modal.style.display = 'none'; // Устанавливаем display: none
            document.body.classList.remove('modal-open');
        }
    }

    // Обработчик клика за пределами модального окна
    window.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal')) {
            closeModal(event.target.id); // Закрываем только то модальное окно, на которое кликнули
        }
    });

    // Закрытие модальных окон через крестик
    document.querySelectorAll('.close').forEach(button => {
        button.addEventListener('click', function() {
            const modalId = this.closest('.modal').id;
            closeModal(modalId);
        });
    });

    // Переключение между модальными окнами (Вход/Регистрация)
    const openRegisterModalLink = document.getElementById('openRegisterModalLink');
    const openLoginModalLink = document.getElementById('openLoginModalLink');

    if (openRegisterModalLink) {
        openRegisterModalLink.addEventListener('click', function(event) {
            event.preventDefault();
            closeModal('loginModal');
            openModal('registerModal');
        });
    }

    if (openLoginModalLink) {
        openLoginModalLink.addEventListener('click', function(event) {
            event.preventDefault();
            closeModal('registerModal');
            openModal('loginModal');
        });
    }

    // Открытие модальных окон (Вход, Продажа)
    const loginBtn = document.getElementById("loginBtn");
    const sellBtn = document.getElementById("sellBtn");

    if (loginBtn) {
        loginBtn.addEventListener("click", function() {
            openModal('loginModal');
        });
    }

    if (sellBtn) {
        sellBtn.addEventListener("click", function() {
            openModal('sellModal');
        });
    }

    // *** Корзина ***
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    updateCartCount();

    const cartButton = document.getElementById('cartButton');
    const cartModal = document.getElementById('cartModal');
    const closeCartModal = document.getElementById('closeCartModal');
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotalPriceElement = document.getElementById('cart-total-price');
    const checkoutBtn = document.getElementById('checkoutBtn');

    // Открытие модального окна корзины
    if (cartButton) {
        cartButton.addEventListener('click', function() {
            openCartModal();
        });
    }

    // Оформление заказа
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

    // Закрытие модального окна корзины через крестик
    if (closeCartModal) {
        closeCartModal.addEventListener('click', function() {
            closeModal('cartModal');
        });
    }

    // Добавление товара в корзину
    if (document.querySelector('.plane-cards-container')) {
        document.querySelectorAll('.add-to-cart-btn').forEach(button => {
            button.addEventListener('click', function(event) {
                event.preventDefault();
                event.stopPropagation();

                const itemName = this.dataset.name;
                const itemPrice = parseFloat(this.dataset.price);
                const itemImage = this.dataset.image;

                addItemToCart(itemName, itemPrice, itemImage);
                animateToCart(this, itemImage);
            });
        });
    }

    // Обработка кликов по карточкам (для перехода по ссылке)
    document.querySelectorAll('.plane-card').forEach(card => {
        card.addEventListener('click', function(event) {
            if (!event.target.closest('.add-to-cart-btn')) {
                const url = this.getAttribute('href');
                if (url && url !== '#') {
                    window.location.href = url;
                }
            }
        });
    });

    // Функция подсчета общего количества товаров в корзине
    function getTotalItemsInCart() {
        return cart.reduce((sum, item) => sum + item.quantity, 0);
    }

    // Функция добавления товара в корзину
    function addItemToCart(name, price, image) {
        console.log('Добавлен товар:', { name, price, image }); // Для отладки
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

    // Функция обновления счетчика корзины
    function updateCartCount() {
        const cartCountSpan = document.getElementById('cart-count');
        if (cartCountSpan) {
            const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);
            cartCountSpan.textContent = totalQuantity;
        }
    }

    // Функция открытия модального окна корзины
    function openCartModal() {
        cartItemsContainer.innerHTML = ''; // Очищаем содержимое корзины

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p>В корзине пока ничего нет.</p>';
            cartTotalPriceElement.textContent = '0 ₽'; // Обнуляем общую цену
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

            cartTotalPriceElement.textContent = totalPrice.toLocaleString() + ' ₽'; // Выводим общую цену

            // Добавляем обработчики для кнопок изменения количества
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

    // Функция изменения количества товара в корзине
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
            openCartModal(); // Обновляем модальное окно корзины
        }
    }

    // Анимация перелета товара в корзину
    function animateToCart(button, imageSrc) {
        const flyingItem = document.getElementById('flying-item');
        const flyingItemImage = document.getElementById('flying-item-image');

        flyingItemImage.src = imageSrc;

        const buttonRect = button.getBoundingClientRect();
        const cartIconRect = cartButton.getBoundingClientRect();

        flyingItem.style.left = buttonRect.left + buttonRect.width / 2 - 25 + 'px'; // Центрируем
        flyingItem.style.top = buttonRect.top + buttonRect.height / 2 - 25 + 'px';
        flyingItem.style.opacity = 1;
        flyingItem.style.display = 'block'; // Убедитесь, что элемент видим

        const deltaX = cartIconRect.left - buttonRect.left;
        const deltaY = cartIconRect.top - buttonRect.top;

        flyingItem.style.transition = 'transform 0.5s ease-in-out, opacity 0.5s ease-in-out';
        flyingItem.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(0.2)`; // Уменьшаем размер

        setTimeout(() => {
            flyingItem.style.transition = 'none';
            flyingItem.style.opacity = 0;
            flyingItem.style.transform = 'translate(0, 0) scale(1)'; // Возвращаем в исходное состояние
            flyingItem.style.display = 'none'; // Скрываем элемент после завершения анимации
        }, 500);
    }
});