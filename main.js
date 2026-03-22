document.addEventListener('DOMContentLoaded', function() {
    
    // Элементы DOM
    const btn = document.getElementById("btn_form");
    const form = document.getElementById("form-container"); // ИЗМЕНИТЬ: теперь form-container
    const blom = document.getElementById("bloom");
    const contactForm = document.getElementById("contactForm"); // ИЗМЕНИТЬ: форма теперь отдельно
    const submitBtn = document.getElementById("submit_form");

    // Поля формы
    const fullName = document.getElementById('fullName');
    const email = document.getElementById('email');
    const phone = document.getElementById('phone');
    const organization = document.getElementById('organization');
    const message = document.getElementById('message');
    const privacy = document.getElementById('privacy');

    let isFormOpen = false;

    const config = {
        apiEndpoint: 'https://formcarry.com/s/V-kfqpa_nHp',
        storageKey: 'contact_form_data',
        formOpenState: 'form-open'
    };

    const messageContainer = document.createElement('div');
    messageContainer.id = 'message-container';
    messageContainer.style.cssText = 'margin: 10px 0; padding: 10px; border-radius: 5px; display: none;';
    
    if (contactForm && contactForm.firstChild) {
        contactForm.insertBefore(messageContainer, contactForm.firstChild);
    }

    // ==================== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ====================
    
    function showMessage(text, type = 'success') {
        console.log('Показать сообщение:', text, type);
        messageContainer.textContent = text;
        messageContainer.style.display = 'block';
        messageContainer.style.backgroundColor = type === 'success' ? '#d4edda' : '#f8d7da';
        messageContainer.style.color = type === 'success' ? '#155724' : '#721c24';
        messageContainer.style.border = `1px solid ${type === 'success' ? '#c3e6cb' : '#f5c6cb'}`;
        
        setTimeout(() => {
            messageContainer.style.display = 'none';
        }, 5000);
    }

    function openf() {
        console.log("Открытие формы");
        form.classList.add('on');
        form.classList.remove('off');
        blom.classList.add('on');
        blom.classList.remove('off');
        isFormOpen = true;
        
        // Загружаем сохраненные данные
        loadFormData();
        
        // Добавляем в историю
        history.pushState({ formOpen: true }, '', '#form-open');
        
        // Блокируем прокрутку
        document.body.style.overflow = 'hidden';
    }

    function closef() {
        console.log("Закрытие формы");
        form.classList.remove('on');
        form.classList.add('off');
        blom.classList.remove('on');
        blom.classList.add('off');
        isFormOpen = false;
        
        // Скрываем сообщения
        messageContainer.style.display = 'none';
        
        // Если есть хэш формы, возвращаемся назад
        if (window.location.hash === '#form-open') {
            history.back();
        }
        
        // Восстанавливаем прокрутку
        document.body.style.overflow = 'auto';
    }

    function clearFormData() {
        localStorage.removeItem(config.storageKey);
        console.log('Данные очищены из LocalStorage');
    }

    // ==================== LOCALSTORAGE ФУНКЦИИ ====================
    
    function saveFormData() {
        const formData = {
            fullName: fullName ? fullName.value : '',
            email: email ? email.value : '',
            phone: phone ? phone.value : '',
            organization: organization ? organization.value : '',
            message: message ? message.value : '',
            privacy: privacy ? privacy.checked : false
        };
        localStorage.setItem(config.storageKey, JSON.stringify(formData));
        console.log('Данные сохранены в LocalStorage');
    }

    function loadFormData() {
        const savedData = localStorage.getItem(config.storageKey);
        
        if (savedData) {
            try {
                const formData = JSON.parse(savedData);
                
                if (fullName) fullName.value = formData.fullName || '';
                if (email) email.value = formData.email || '';
                if (phone) phone.value = formData.phone || '';
                if (organization) organization.value = formData.organization || '';
                if (message) message.value = formData.message || '';
                if (privacy) privacy.checked = formData.privacy || false;
                
                console.log('Данные загружены из LocalStorage');
            } catch (error) {
                console.error('Ошибка при загрузке данных:', error);
                clearFormData();
            }
        }
    }

    // ==================== ВАЛИДАЦИЯ И ОТПРАВКА ====================
    
    function validateForm() {
        let isValid = true;
        
        // Сброс стилей ошибок
        const fieldsToValidate = [fullName, email, message];
        fieldsToValidate.forEach(field => {
            if (field) field.style.borderColor = '';
        });
        
        // Проверка полей
        if (!fullName || !fullName.value.trim()) {
            showMessage('Пожалуйста, введите ФИО', 'error');
            if (fullName) fullName.style.borderColor = 'red';
            isValid = false;
        } else if (!email || !email.value.trim() || !email.value.includes('@')) {
            showMessage('Пожалуйста, введите корректный email', 'error');
            if (email) email.style.borderColor = 'red';
            isValid = false;
        } else if (!message || !message.value.trim()) {
            showMessage('Пожалуйста, введите сообщение', 'error');
            if (message) message.style.borderColor = 'red';
            isValid = false;
        } else if (!privacy || !privacy.checked) {
            showMessage('Необходимо согласие с политикой конфиденциальности', 'error');
            isValid = false;
        }
        
        return isValid;
    }

    async function submitForm(event) {
        console.log("Отправка формы");
        event.preventDefault();
        
        // Валидация
        if (!validateForm()) {
            return;
        }
        
        // Собираем данные
        const formData = {
            fullName: fullName.value,
            email: email.value,
            phone: phone.value,
            organization: organization.value,
            message: message.value,
            _subject: 'Новое сообщение с сайта'
        };
        
        try {
            // Отправка через Formcarry
            const response = await fetch(config.apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                showMessage('Форма успешно отправлена! Спасибо за обращение.', 'success');
                // Очищаем форму и LocalStorage
                if (contactForm) contactForm.reset();
                clearFormData();
                
            } else {
                throw new Error(`Ошибка сервера: ${response.status}`);
            }
            
        } catch (error) {
            console.error('Ошибка отправки формы:', error);
            showMessage(`Ошибка отправки: ${error.message}`, 'error');
            
        } finally {
            // Восстанавливаем кнопку
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = 'отправить форму';
            }
        }
    }

    // ==================== СОБЫТИЯ ====================
    
    // Открытие формы
    if (btn) {
        btn.addEventListener('click', openf);
        console.log('Кнопка открытия формы найдена');
    } else {
        console.error('Кнопка открытия формы не найдена!');
    }
    
    // Закрытие по клику на фон
    if (blom) {
        blom.addEventListener('click', closef);
    }
    
    // Закрытие по Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && isFormOpen) {
            closef();
        }
    });
    
    // Сохранение данных при изменении полей
    const fieldsToSave = [fullName, email, phone, organization, message];
    fieldsToSave.forEach(field => {
        if (field) {
            field.addEventListener('input', saveFormData);
        }
    });
    
    if (privacy) {
        privacy.addEventListener('change', saveFormData);
    }
    
    // Отправка формы
    if (contactForm) {
        contactForm.addEventListener('submit', submitForm);
    } else {
        console.error('Форма contactForm не найдена!');
        // Альтернативно, вешаем на кнопку
        if (submitBtn) {
            submitBtn.addEventListener('click', function(e) {
                e.preventDefault();
                submitForm(e);
            });
            console.log('Событие click привязано к кнопке отправки');
        }
    }
});