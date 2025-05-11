let currentUser = null;
const hidePlaneModals = ['loginModal', 'registerModal', 'sellModal'];

// Проверка, открыто ли модальное окно, скрывающее самолет
function isAnyHidePlaneModalOpen() {
    return hidePlaneModals.some(modalId => document.getElementById(modalId).classList.contains('show'));
}

// Открытие модального окна
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('show');
        document.body.classList.add('modal-open');
        if (hidePlaneModals.includes(modalId)) {
            document.getElementById('bigPlane').style.display = 'none';
        }
    }
}

// Закрытие модального окна
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('show');
        document.body.classList.remove('modal-open');
        if (hidePlaneModals.includes(modalId) && !isAnyHidePlaneModalOpen()) {
            document.getElementById('bigPlane').style.display = 'block';
        }
    }
}

// Проверка авторизации перед навигацией
function checkAuthAndNavigate(url) {
    if (currentUser) {
        location.href = url;
    } else {
        const authModal = document.getElementById('authRequiredModal');
        const message = document.getElementById('authRequiredMessage');
        message.textContent = 'Пожалуйста, войдите или зарегистрируйтесь, чтобы продолжить.';
        openModal('authRequiredModal');
        localStorage.setItem('intendedUrl', url);
    }
}

// Обновление интерфейса при авторизации
function updateAuthUI() {
    const loginBtn = document.getElementById('loginBtn');
    if (loginBtn) {
        if (currentUser) {
            loginBtn.textContent = currentUser.username;
            loginBtn.classList.add('user-logged-in');
        } else {
            loginBtn.textContent = 'Войти';
            loginBtn.classList.remove('user-logged-in');
        }
    }
}

// Выход из системы
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    currentUser = null;
    updateAuthUI();
    closeModal('profile-modal');
    alert('Вы вышли из системы');
}

// Открытие модального окна профиля
function openProfileModal() {
    if (currentUser) {
        document.getElementById('profile-username').textContent = currentUser.username;
        document.getElementById('profile-email').textContent = currentUser.email;
        document.getElementById('editUsername').value = currentUser.username;
        document.getElementById('editEmail').value = currentUser.email;
        if (currentUser.avatar) {
            document.getElementById('profile-avatar').src = currentUser.avatar;
        } else {
            document.getElementById('profile-avatar').src = 'img/default-avatar.png';
        }
        openModal('profile-modal');
    }
}

// Обновление профиля
function updateProfile() {
    const editUsername = document.getElementById('editUsername').value;
    const editEmail = document.getElementById('editEmail').value;
    const editAvatar = document.getElementById('editAvatar').files[0];

    if (!editUsername || !editEmail) {
        alert('Пожалуйста, заполните все обязательные поля.');
        return;
    }

    // Для локального тестирования используем localStorage
    let avatarUrl = currentUser.avatar || 'img/default-avatar.png';
    if (editAvatar) {
        avatarUrl = URL.createObjectURL(editAvatar);
    }

    currentUser = {
        ...currentUser,
        username: editUsername,
        email: editEmail,
        avatar: avatarUrl
    };

    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    updateAuthUI();
    document.getElementById('profile-username').textContent = currentUser.username;
    document.getElementById('profile-email').textContent = currentUser.email;
    document.getElementById('profile-avatar').src = avatarUrl;
    alert('Профиль успешно обновлен!');
}

// Проверка авторизации при загрузке страницы
function checkAuth() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    const token = localStorage.getItem('token');
    if (user && token) {
        currentUser = user;
        updateAuthUI();
    }
}

// Обработчик формы входа
function setupLoginForm() {
    const loginForm = document.getElementById('loginForm');
    if (!loginForm) return;

    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        // Локальная проверка для тестирования
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const user = users.find(u => u.username === username && u.password === password);

        if (user) {
            currentUser = { username: user.username, email: user.email, avatar: user.avatar };
            localStorage.setItem('token', 'dummy-token');
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            updateAuthUI();
            closeModal('loginModal');
            const intendedUrl = localStorage.getItem('intendedUrl');
            if (intendedUrl) {
                location.href = intendedUrl;
                localStorage.removeItem('intendedUrl');
            } else {
                alert('Вы успешно вошли!');
            }
        } else {
            alert('Неверное имя пользователя или пароль.');
        }
    });
}

// Обработчик формы регистрации
function setupRegisterForm() {
    const registerForm = document.getElementById('registerForm');
    if (!registerForm) return;

    registerForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const username = document.getElementById('registerUsername').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (password !== confirmPassword) {
            alert('Пароли не совпадают.');
            return;
        }

        const users = JSON.parse(localStorage.getItem('users') || '[]');
        if (users.some(u => u.username === username)) {
            alert('Пользователь с таким именем уже существует.');
            return;
        }

        const newUser = { username, email, password, avatar: 'img/default-avatar.png' };
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
        currentUser = { username, email, avatar: 'img/default-avatar.png' };
        localStorage.setItem('token', 'dummy-token');
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        updateAuthUI();
        closeModal('registerModal');
        openProfileModal();
        alert('Регистрация успешна! Добро пожаловать!');
    });
}

// Обратный отсчет для скидки
function startCountdown() {
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 7);
    
    const timer = setInterval(function() {
        const now = new Date().getTime();
        const distance = endDate - now;
        
        if (distance < 0) {
            clearInterval(timer);
            const countdownElement = document.querySelector('.countdown-timer');
            if (countdownElement) {
                countdownElement.innerHTML = '<p>Предложение истекло!</p>';
            }
            return;
        }
        
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        
        const daysElement = document.getElementById('days');
        const hoursElement = document.getElementById('hours');
        const minutesElement = document.getElementById('minutes');
        const secondsElement = document.getElementById('seconds');
        
        if (daysElement) daysElement.textContent = days.toString().padStart(2, '0');
        if (hoursElement) hoursElement.textContent = hours.toString().padStart(2, '0');
        if (minutesElement) minutesElement.textContent = minutes.toString().padStart(2, '0');
        if (secondsElement) secondsElement.textContent = seconds.toString().padStart(2, '0');
    }, 1000);
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
    setupLoginForm();
    setupRegisterForm();

    // Блокируем действия для неавторизованных пользователей
    document.querySelectorAll('.nav-links a, .footer-section a').forEach(link => {
        link.addEventListener('click', function(event) {
            if (!currentUser) {
                event.preventDefault();
                checkAuthAndNavigate(this.href);
            }
        });
    });

    // Кнопка продажи
    const sellBtn = document.getElementById('sellBtn');
    if (sellBtn) {
        sellBtn.addEventListener('click', function(e) {
            if (currentUser) {
                openModal('sellModal');
            } else {
                e.preventDefault();
                openModal('authRequiredModal');
            }
        });
    }

    // Кнопка входа
    const loginBtn = document.getElementById('loginBtn');
    if (loginBtn) {
        loginBtn.addEventListener('click', function(e) {
            e.preventDefault();
            if (currentUser) {
                openProfileModal();
            } else {
                openModal('loginModal');
            }
        });
    }

    // Кнопка выхода
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }

    // Переключение между входом и регистрацией
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

    // Закрытие модальных окон
    window.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal')) {
            closeModal(event.target.id);
        }
    });

    document.querySelectorAll('.close').forEach(button => {
        button.addEventListener('click', function() {
            const modalId = this.closest('.modal').id;
            closeModal(modalId);
        });
    });

    // Модальное окно скидки
    const planeImage = document.querySelector('.plane-image');
    if (planeImage) {
        planeImage.addEventListener('click', function() {
            if (!document.body.classList.contains('modal-open')) {
                openModal('discountModal');
                startCountdown();
            }
        });
    }

    const closeDiscountModal = document.getElementById('closeDiscountModal');
    if (closeDiscountModal) {
        closeDiscountModal.addEventListener('click', function() {
            closeModal('discountModal');
        });
    }

    const useDiscountBtn = document.getElementById('useDiscountBtn');
    if (useDiscountBtn) {
        useDiscountBtn.addEventListener('click', function() {
            alert('Скидка 5% применена к вашему заказу!');
            closeModal('discountModal');
        });
    }
});