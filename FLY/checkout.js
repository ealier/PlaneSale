document.addEventListener('DOMContentLoaded', function() {
    // 1. Инициализация EmailJS
    emailjs.init("BsDSMjMIlwoTaMiGr"); // Ваш User ID

    const checkoutItemsContainer = document.getElementById('checkout-items');
    const checkoutTotalPriceElement = document.getElementById('checkout-total-price');
    const orderForm = document.getElementById('order-form');
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const nameError = document.getElementById('name-error');
    const emailError = document.getElementById('email-error');
    const successMessage = document.getElementById('success-message');

    // Получаем данные корзины из localStorage
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    // Функция для форматирования списка товаров
    function getFormattedOrderItems(cartItems) {
        return cartItems.map(item => 
            `${item.name} - ${item.quantity} x ${item.price} ₽`
        ).join('\n');
    }

    function displayCartItems() {
        checkoutItemsContainer.innerHTML = '';
        if (cart.length === 0) {
            checkoutItemsContainer.innerHTML = '<p>Корзина пуста.</p>';
            checkoutTotalPriceElement.textContent = '0 ₽';
        } else {
            let totalPrice = 0;
            cart.forEach(item => {
                const itemTotal = item.price * item.quantity;
                totalPrice += itemTotal;
                
                checkoutItemsContainer.innerHTML += `
                    <div class="checkout-item">
                        <img src="${item.image}" alt="${item.name}">
                        <div class="checkout-item-details">
                            <div class="checkout-item-name">${item.name}</div>
                            <div>${item.price.toLocaleString()} ₽ x ${item.quantity}</div>
                            <div>Итого: ${itemTotal.toLocaleString()} ₽</div>
                        </div>
                    </div>
                `;
            });
            checkoutTotalPriceElement.textContent = totalPrice.toLocaleString() + ' ₽';
        }
    }

    function validateForm() {
        let isValid = true;
        nameError.textContent = '';
        emailError.textContent = '';

        if (!nameInput.value.trim()) {
            nameError.textContent = 'Пожалуйста, введите ваше имя.';
            isValid = false;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value)) {
            emailError.textContent = 'Пожалуйста, введите корректный email.';
            isValid = false;
        }

        return isValid;
    }

    orderForm.addEventListener('submit', function(e) {
        e.preventDefault();

        if (!validateForm()) return;

        const templateParams = {
            to_name: nameInput.value,
            to_email: emailInput.value,
            order_details: getFormattedOrderItems(cart)
        };

        emailjs.send(
            "service_9vbxhgf",      // Service ID
            "template_aeg4kgn",        // Template ID
            templateParams
        )
        .then(function() {
            successMessage.textContent = "Заявка успешно отправлена! Проверьте вашу почту.";
            localStorage.removeItem('cart');
            cart = [];
            displayCartItems();
        })
        .catch(function(error) {
            console.error("Ошибка отправки:", error);
            successMessage.textContent = "Ошибка отправки. Пожалуйста, попробуйте позже.";
        });
    });

    // Инициализация корзины при загрузке
    displayCartItems();
});