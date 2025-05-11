document.addEventListener('DOMContentLoaded', function() {
    // Функция для открытия модального окна
    function openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('show');
            document.body.classList.add('modal-open'); // Предотвращаем прокрутку фона
        }
    }

    // Функция для закрытия модального окна
    function closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('show');
            document.body.classList.remove('modal-open');
        }
    }

    // Закрытие модального окна при клике вне его
    window.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal')) {
            const modals = document.querySelectorAll('.modal.show');
            modals.forEach(modal => {
                closeModal(modal.id);
            });
        }
    });

    // Обработчики для кнопок закрытия
    document.querySelectorAll('.close').forEach(button => {
        button.addEventListener('click', function() {
            const modalId = this.closest('.modal').id;
            closeModal(modalId);
        });
    });

    // Обработчики для переключения между модальными окнами (Вход -> Регистрация)
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
});
const openRegisterModalLink = document.getElementById('openRegisterModalLink');
const openLoginModalLink = document.getElementById('openLoginModalLink');

console.log('openRegisterModalLink:', openRegisterModalLink);
console.log('openLoginModalLink:', openLoginModalLink);