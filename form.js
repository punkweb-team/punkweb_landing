// Ждем загрузки DOM
document.addEventListener("DOMContentLoaded", function () {
  // Находим элементы формы
  const form = document.querySelector(".form__main");
  const nameInput = form.querySelector('input[type="text"]');
  const emailInput = form.querySelector('input[type="email"]');
  const phoneInput = form.querySelector('input[type="tel"]');
  const checkbox = form.querySelector(".form__checkbox");
  const checkboxBtn = form.querySelector(".form__checkbox-btn");
  const checkboxImg = checkboxBtn.querySelector("img");
  const errorParagraph = document.querySelector(".form__error");
  const submitBtn = form.querySelector(".form__btn");

  // Состояние галочки (по умолчанию не отмечена)
  let isCheckboxChecked = false;

  // Изначально скрываем ошибку
  errorParagraph.style.display = "none";

  // Устанавливаем начальное изображение для чекбокса (box.png)
  checkboxImg.src = "./img/box.png";
  checkboxImg.alt = "Чекбокс не отмечен";

  // Функция для проверки имени
  function validateName(name) {
    // Убираем пробелы по краям
    const trimmedName = name.trim();

    // Проверяем, что имя не пустое
    if (trimmedName.length === 0) {
      return "Имя обязательно для заполнения";
    }

    // Минимальная длина имени - 2 символа
    if (trimmedName.length < 2) {
      return "Имя должно содержать минимум 2 символа";
    }

    // Проверяем, что имя содержит только буквы (русские и английские) и пробелы
    const nameRegex = /^[a-zA-Zа-яА-ЯёЁ\s-]+$/;
    if (!nameRegex.test(trimmedName)) {
      return "Имя может содержать только буквы и пробелы";
    }

    return "";
  }

  // Функция для проверки email
  function validateEmail(email) {
    const trimmedEmail = email.trim();

    if (trimmedEmail.length === 0) {
      return "Email обязателен для заполнения";
    }

    // Регулярное выражение для проверки email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      return "Введите корректный email адрес (например, example@mail.com)";
    }

    // Дополнительная проверка на длину домена
    const parts = trimmedEmail.split("@");
    if (parts.length !== 2) {
      return "Введите корректный email адрес";
    }

    const domain = parts[1];
    if (!domain.includes(".") || domain.split(".").pop().length < 2) {
      return "Email должен содержать домен (например, .com, .ru)";
    }

    return "";
  }

  // Функция для проверки телефона
  function validatePhone(phone) {
    const trimmedPhone = phone.trim();

    if (trimmedPhone.length === 0) {
      return "Телефон обязателен для заполнения";
    }

    // Убираем все нецифровые символы
    const digitsOnly = trimmedPhone.replace(/\D/g, "");

    // Проверяем российские номера
    if (digitsOnly.startsWith("7") || digitsOnly.startsWith("8")) {
      // Для российских номеров ожидаем 10 цифр (без кода страны)
      const russianDigits = digitsOnly.substring(1);
      if (russianDigits.length !== 10) {
        return "Введите корректный российский номер телефона (10 цифр)";
      }
    } else if (trimmedPhone.startsWith("+")) {
      // Для номеров с кодом страны
      if (digitsOnly.length < 10) {
        return "Номер телефона слишком короткий";
      }
    } else {
      // Для других форматов
      if (digitsOnly.length < 5) {
        return "Введите корректный номер телефона";
      }
    }

    return "";
  }

  // Функция для проверки чекбокса
  function validateCheckbox() {
    if (!isCheckboxChecked) {
      return "Необходимо согласиться с обработкой персональных данных";
    }
    return "";
  }

  // Функция для добавления/удаления класса ошибки
  function setInputError(inputElement, hasError) {
    if (hasError) {
      inputElement.classList.add("form__input-error");
    } else {
      inputElement.classList.remove("form__input-error");
    }
  }

  // Функция для отображения ошибки
  function showError(message) {
    errorParagraph.textContent = message;
    errorParagraph.style.display = "block";

    // Плавное появление
    errorParagraph.style.opacity = "0";
    errorParagraph.style.transition = "opacity 0.3s";
    setTimeout(() => {
      errorParagraph.style.opacity = "1";
    }, 10);
  }

  // Функция для скрытия ошибки
  function hideError() {
    errorParagraph.style.opacity = "0";
    setTimeout(() => {
      errorParagraph.style.display = "none";
    }, 300);
  }

  // Храним последние ошибки для каждого поля
  const fieldErrors = {
    name: "",
    email: "",
    phone: "",
    checkbox: "",
  };

  // Функция для получения общей ошибки
  function getGeneralErrorMessage() {
    const errors = [];

    if (fieldErrors.name) errors.push(fieldErrors.name);
    if (fieldErrors.email) errors.push(fieldErrors.email);
    if (fieldErrors.phone) errors.push(fieldErrors.phone);
    if (fieldErrors.checkbox) errors.push(fieldErrors.checkbox);

    if (errors.length === 0) return "";

    // Если одна ошибка - показываем ее
    if (errors.length === 1) {
      return errors[0];
    }

    // Если несколько ошибок - показываем первую
    return errors[0];
  }

  // Функция для валидации всего формы
  function validateForm() {
    let isValid = true;

    // Проверяем имя
    const nameError = validateName(nameInput.value);
    fieldErrors.name = nameError;
    if (nameError) {
      setInputError(nameInput, true);
      isValid = false;
    } else {
      setInputError(nameInput, false);
    }

    // Проверяем email
    const emailError = validateEmail(emailInput.value);
    fieldErrors.email = emailError;
    if (emailError) {
      setInputError(emailInput, true);
      isValid = false;
    } else {
      setInputError(emailInput, false);
    }

    // Проверяем телефон
    const phoneError = validatePhone(phoneInput.value);
    fieldErrors.phone = phoneError;
    if (phoneError) {
      setInputError(phoneInput, true);
      isValid = false;
    } else {
      setInputError(phoneInput, false);
    }

    // Проверяем чекбокс
    const checkboxError = validateCheckbox();
    fieldErrors.checkbox = checkboxError;

    // Показываем или скрываем ошибку
    if (!isValid || checkboxError) {
      const errorMessage = getGeneralErrorMessage();
      showError(errorMessage);
    } else {
      hideError();
    }

    return isValid && !checkboxError;
  }

  // Обработчик для чекбокса
  checkbox.addEventListener("click", function () {
    isCheckboxChecked = !isCheckboxChecked;

    if (isCheckboxChecked) {
      checkboxImg.src = "./img/check.svg";
      checkboxImg.alt = "Чекбокс отмечен";
      fieldErrors.checkbox = "";
      // Если это была единственная ошибка - скрываем сообщение
      if (!fieldErrors.name && !fieldErrors.email && !fieldErrors.phone) {
        hideError();
      }
    } else {
      checkboxImg.src = "./img/box.png";
      checkboxImg.alt = "Чекбокс не отмечен";
    }

    // Плавная анимация для чекбокса
    checkboxImg.style.transform = "scale(1.2)";
    setTimeout(() => {
      checkboxImg.style.transform = "scale(1)";
    }, 150);
  });

  // Вспомогательная функция для live валидации
  function validateField(input, validator, fieldName) {
    const error = validator(input.value);
    fieldErrors[fieldName] = error;
    setInputError(input, !!error);

    // Если есть ошибка - показываем ее
    if (error) {
      showError(error);
    } else {
      // Если ошибки нет, проверяем нет ли других ошибок
      const otherErrors = Object.entries(fieldErrors)
        .filter(([key, value]) => key !== fieldName && value)
        .map(([_, value]) => value);

      if (otherErrors.length > 0) {
        // Показываем первую из других ошибок
        showError(otherErrors[0]);
      } else if (fieldErrors.checkbox) {
        // Показываем ошибку чекбокса
        showError(fieldErrors.checkbox);
      } else {
        // Если больше нет ошибок - скрываем сообщение
        hideError();
      }
    }
  }

  // Обработчики для валидации при вводе (live validation)
  nameInput.addEventListener("input", function () {
    validateField(this, validateName, "name");
  });

  nameInput.addEventListener("blur", function () {
    validateField(this, validateName, "name");
  });

  emailInput.addEventListener("input", function () {
    validateField(this, validateEmail, "email");
  });

  emailInput.addEventListener("blur", function () {
    validateField(this, validateEmail, "email");
  });

  phoneInput.addEventListener("input", function () {
    validateField(this, validatePhone, "phone");
  });

  phoneInput.addEventListener("blur", function () {
    validateField(this, validatePhone, "phone");
  });

  // Обработчик для отправки формы
  form.addEventListener("submit", function (event) {
    event.preventDefault(); // Предотвращаем стандартную отправку

    if (validateForm()) {
      // Если форма валидна, можно отправить данные
      console.log("Форма валидна, отправляем данные:");
      console.log("Имя:", nameInput.value.trim());
      console.log("Email:", emailInput.value.trim());
      console.log("Телефон:", phoneInput.value.trim());
      console.log("Согласие:", isCheckboxChecked);

      // Здесь можно добавить отправку данных на сервер
      // Например, с помощью fetch API

      // Показываем сообщение об успехе
      alert("Форма успешно отправлена!");

      // Сбрасываем форму
      form.reset();
      isCheckboxChecked = false;
      checkboxImg.src = "./img/box.png";
      checkboxImg.alt = "Чекбокс не отмечен";

      // Сбрасываем ошибки
      Object.keys(fieldErrors).forEach((key) => (fieldErrors[key] = ""));
      hideError();

      // Убираем классы ошибок
      [nameInput, emailInput, phoneInput].forEach((input) => {
        input.classList.remove("form__input-error");
      });
    }
  });

  // Обработчики для сброса ошибок при фокусе
  const inputs = [nameInput, emailInput, phoneInput];
  inputs.forEach((input) => {
    input.addEventListener("focus", function () {
      // Не скрываем ошибку полностью, чтобы пользователь видел что не так
      // Но можно убрать класс ошибки визуально
      this.classList.remove("form__input-error");
    });
  });
});

document.addEventListener("DOMContentLoaded", function () {
  let currentFormVideo = null;

  function toggleFormVideo(container) {
    const img = container.querySelector(".form__img");
    const button = container.querySelector(".form-play__btn");
    const icon = button.querySelector("img");

    // Останавливаем предыдущее видео
    if (currentFormVideo && currentFormVideo.container !== container) {
      stopFormVideo(
        currentFormVideo.video,
        currentFormVideo.img,
        currentFormVideo.icon,
        currentFormVideo.container
      );
      currentFormVideo = null;
    }

    let video = container.querySelector("video");

    // Если видео ещё нет — создаём
    if (!video) {
      video = document.createElement("video");
      video.classList.add("form__video");
      video.src = img.src.replace(".png", ".mp4").replace("team", "video");
      video.playsInline = true;
      video.loop = false;

      Object.assign(video.style, {
        position: "absolute",
        top: "0",
        left: "0",
        width: "100%",
        height: "100%",
        objectFit: "cover",
        borderRadius: "100px",
        zIndex: "-1",
        display: "block",
        cursor: "pointer",
      });

      container.appendChild(video);

      video.play().then(() => {
        icon.src = "./img/pause-white.svg";

        // Увеличение контейнера
        container.style.transform = "scale(1.5)";
        container.style.transition = "transform 0.4s ease";
        // container.style.transformOrigin = "left bottom";

        // Скрываем картинку
        img.style.opacity = "0";

        currentFormVideo = { video, img, icon, container };

        video.addEventListener("ended", function onEnd() {
          stopFormVideo(video, img, icon, container);
          currentFormVideo = null;
          video.removeEventListener("ended", onEnd);
        });
      });

      return;
    }

    // Если видео есть и оно играет → пауза
    if (!video.paused) {
      stopFormVideo(video, img, icon, container);
      currentFormVideo = null;
      return;
    }

    // Если видео есть и на паузе → продолжить
    video.play().then(() => {
      icon.src = "./img/pause-white.svg";
      img.style.opacity = "0";
      container.style.transform = "scale(1.5)";

      currentFormVideo = { video, img, icon, container };

      video.addEventListener("ended", function onEnd() {
        stopFormVideo(video, img, icon, container);
        currentFormVideo = null;
        video.removeEventListener("ended", onEnd);
      });
    });
  }

  function stopFormVideo(video, img, icon, container) {
    video.pause();
    icon.src = "./img/play-white.svg";

    // Возвращаем нормальные стили
    container.style.transform = "scale(1)";
    img.style.opacity = "1";

    // Убираем видео
    setTimeout(() => {
      video.remove();
    }, 300);
  }

  // Навешиваем обработчики
  document.querySelectorAll(".form__img-container").forEach((container) => {
    const img = container.querySelector(".form__img");
    const btn = container.querySelector(".form-play__btn");

    img.style.cursor = "pointer";

    img.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleFormVideo(container);
    });

    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleFormVideo(container);
    });
  });
});
