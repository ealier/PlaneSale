// auth.js - Основная логика авторизации

let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
let users = JSON.parse(localStorage.getItem('users')) || [];

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
    setupEventListeners();
    updateAuthUI();
    
    // Защита страниц
    protectPages();
});

// Проверка авторизации
function checkAuth() {
    const userFromStorage = JSON.parse(localStorage.getItem('currentUser'));
    if (userFromStorage) {
        currentUser = userFromStorage;
    }
}

// Обновление интерфейса в зависимости от авторизации
function updateAuthUI() {
    const loginBtn = document.getElementById('loginBtn');
    const sellBtn = document.getElementById('sellBtn');
    
    if (currentUser) {
        // Пользователь авторизован
        if (loginBtn) {
            loginBtn.textContent = currentUser.username;
            loginBtn.onclick = openProfileModal;
        }
        
        if (sellBtn) {
            sellBtn.onclick = function() { openModal('sellModal'); };
        }
    } else {
        // Пользователь не авторизован
        if (loginBtn) {
            loginBtn.textContent = 'Войти';
            loginBtn.onclick = function() { openModal('loginModal'); };
        }
        
        if (sellBtn) {
            sellBtn.onclick = showAuthRequiredModal;
        }
    }
}

// Настройка обработчиков событий
function setupEventListeners() {
    // Форма входа
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleLogin();
        });
    }
    
    // Форма регистрации
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleRegister();
        });
    }
    
    // Переключение между формами входа и регистрации
    document.getElementById('openRegisterModalLink')?.addEventListener('click', function(e) {
        e.preventDefault();
        closeModal('loginModal');
        openModal('registerModal');
    });
    
    document.getElementById('openLoginModalLink')?.addEventListener('click', function(e) {
        e.preventDefault();
        closeModal('registerModal');
        openModal('loginModal');
    });
    
    // Кнопка выхода
    document.getElementById('logoutBtn')?.addEventListener('click', handleLogout);
    
    // Защита кликабельных элементов
    protectClickableElements();
}

// Обработка входа
function handleLogin() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    // Простая валидация
    if (!username || !password) {
        showError('loginForm', 'Пожалуйста, заполните все поля');
        return;
    }
    
    // Поиск пользователя
    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
        // Успешный вход
        currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        updateAuthUI();
        closeModal('loginModal');
        
        // Очистка формы
        document.getElementById('loginForm').reset();
    } else {
        showError('loginForm', 'Неверное имя пользователя или пароль');
    }
}

// Обработка регистрации
function handleRegister() {
    const username = document.getElementById('registerUsername').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    // Валидация
    if (!username || !email || !password || !confirmPassword) {
        showError('registerForm', 'Пожалуйста, заполните все поля');
        return;
    }
    
    if (password !== confirmPassword) {
        showError('registerForm', 'Пароли не совпадают');
        return;
    }
    
    if (users.some(u => u.username === username)) {
        showError('registerForm', 'Имя пользователя уже занято');
        return;
    }
    
    if (users.some(u => u.email === email)) {
        showError('registerForm', 'Email уже используется');
        return;
    }
    
    // Создание нового пользователя
    const newUser = {
        id: Date.now().toString(),
        username,
        email,
        password,
        avatar: 'img/default-avatar.png',
        createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    // Автоматический вход после регистрации
    currentUser = newUser;
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    updateAuthUI();
    closeModal('registerModal');
    
    // Очистка формы
    document.getElementById('registerForm').reset();
    
    // Показать приветственное сообщение
    showWelcomeModal(username);
}

// Обработка выхода
function handleLogout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    updateAuthUI();
    closeModal('profile-modal');
}

// Открытие модального окна профиля
function openProfileModal() {
    if (!currentUser) return;
    
    document.getElementById('profile-username').textContent = currentUser.username;
    document.getElementById('profile-email').textContent = currentUser.email;
    document.getElementById('profile-avatar').src = currentUser.avatar;
    
    // Заполнение формы редактирования
    document.getElementById('editUsername').value = currentUser.username;
    document.getElementById('editEmail').value = currentUser.email;
    
    openModal('profile-modal');
}

// Обновление профиля
function updateProfile() {
    const newUsername = document.getElementById('editUsername').value;
    const newEmail = document.getElementById('editEmail').value;
    const avatarFile = document.getElementById('editAvatar').files[0];
    
    // Валидация
    if (!newUsername || !newEmail) {
        showError('editProfileForm', 'Пожалуйста, заполните все обязательные поля');
        return;
    }
    
    // Проверка уникальности username
    if (newUsername !== currentUser.username && users.some(u => u.username === newUsername)) {
        showError('editProfileForm', 'Это имя пользователя уже занято');
        return;
    }
    
    // Проверка уникальности email
    if (newEmail !== currentUser.email && users.some(u => u.email === newEmail)) {
        showError('editProfileForm', 'Этот email уже используется');
        return;
    }
    
    // Обновление данных пользователя
    currentUser.username = newUsername;
    currentUser.email = newEmail;
    
    // Обработка аватарки
    if (avatarFile) {
        const reader = new FileReader();
        reader.onload = function(e) {
            currentUser.avatar = e.target.result;
            saveUserData();
            updateProfileDisplay();
        };
        reader.readAsDataURL(avatarFile);
    } else {
        saveUserData();
        updateProfileDisplay();
    }
    
    alert('Профиль успешно обновлен!');
}

// Сохранение данных пользователя
function saveUserData() {
    // Обновляем в массиве пользователей
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    if (userIndex !== -1) {
        users[userIndex] = currentUser;
        localStorage.setItem('users', JSON.stringify(users));
    }
    
    // Обновляем текущего пользователя
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    updateAuthUI();
}

// Обновление отображения профиля
function updateProfileDisplay() {
    document.getElementById('profile-username').textContent = currentUser.username;
    document.getElementById('profile-email').textContent = currentUser.email;
    document.getElementById('profile-avatar').src = currentUser.avatar;
    
    // Обновляем кнопку входа в хедере
    const loginBtn = document.getElementById('loginBtn');
    if (loginBtn) {
        loginBtn.textContent = currentUser.username;
    }
}

// Защита страниц
function protectPages() {
    const allowedPages = ['index.html', 'aviablog.html', ''];
    const currentPage = window.location.pathname.split('/').pop();
    
    if (!currentUser && !allowedPages.includes(currentPage)) {
        // Перенаправляем на главную с сообщением
        window.location.href = 'index.html';
        localStorage.setItem('authRedirectMessage', 'Для доступа к этой странице необходимо войти в систему');
    }
    
    // Показываем сообщение если есть
    const redirectMessage = localStorage.getItem('authRedirectMessage');
    if (redirectMessage) {
        showAuthRequiredModal(redirectMessage);
        localStorage.removeItem('authRedirectMessage');
    }
}

// Защита кликабельных элементов
function protectClickableElements() {
    const protectedLinks = document.querySelectorAll('a[href]:not([href^="aviablog.html"]):not([href^="#"]):not([href^="index.html"])');
    
    protectedLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            if (!currentUser) {
                e.preventDefault();
                showAuthRequiredModal();
            }
        });
    });
}

// Показать модальное окно "Требуется авторизация"
function showAuthRequiredModal(message = 'Для доступа к этой странице необходимо войти в систему') {
    const authRequiredModal = document.getElementById('authRequiredModal');
    if (!authRequiredModal) return;
    
    document.getElementById('authRequiredMessage').textContent = message;
    openModal('authRequiredModal');
}

// Показать приветственное модальное окно
function showWelcomeModal(username) {
    const welcomeModal = document.getElementById('welcomeModal');
    if (!welcomeModal) return;
    
    document.getElementById('welcomeUsername').textContent = username;
    openModal('welcomeModal');
    
    // Закрыть через 3 секунды
    setTimeout(() => {
        closeModal('welcomeModal');
    }, 3000);
}

// Показать ошибку в форме
function showError(formId, message) {
    const form = document.getElementById(formId);
    let errorElement = form.querySelector('.error-message');
    
    if (!errorElement) {
        errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        form.prepend(errorElement);
    }
    
    errorElement.textContent = message;
    errorElement.style.display = 'block';
    
    // Скрыть через 3 секунды
    setTimeout(() => {
        errorElement.style.display = 'none';
    }, 3000);
}

// Функции для работы с модальными окнами
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'block';
        document.body.classList.add('modal-open');
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
        document.body.classList.remove('modal-open');
    }
}

// Закрытие модалок по клику вне контента
window.addEventListener('click', function(event) {
    if (event.target.classList.contains('modal')) {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            modal.style.display = 'none';
            document.body.classList.remove('modal-open');
        });
    }
});