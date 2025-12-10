document.addEventListener("DOMContentLoaded", () => {
  const glow = document.querySelector(".cover_wrap_content.--cover-glow");
  if (glow) {
    const baseContent = glow.parentElement.querySelector(
      ".cover_wrap_content:not(.--cover-glow)"
    );
    const parent = glow.parentElement;

    const width = parent.offsetWidth + 400;
    const height = parent.offsetHeight + 400;

    const points = [
      { x: width, y: 0.5 * height },
      { x: width, y: height },
      { x: width, y: height },
      { x: 0.5 * width, y: height },
      { x: 0, y: 0 },
    ];

    const center = { x: 0, y: 0 };
    const offset = { x: -100, y: -100 };

    let progress = 40;
    let direction = 1;
    const maxProgress = 140;

    let cycleCount = 0;

    function animateGlow() {
      const wave = Math.sin(Date.now() * 0.003) * 0.6;
      progress += 0.4 * direction + wave;

      if (progress >= maxProgress || progress <= 0) {
        direction *= -1;
        if (direction === 1) cycleCount++;
      }

      if (cycleCount >= 1) {
        glow.style.display = "none";
        baseContent.classList.add("--cover-white");
        return;
      }

      const rad = ((progress - 90) * Math.PI) / 180;

      const rotatedPoints = points.map((p) => ({
        x:
          (p.x - center.x) * Math.cos(rad) -
          (p.y - center.y) * Math.sin(rad) +
          offset.x,
        y:
          (p.x - center.x) * Math.sin(rad) +
          (p.y - center.y) * Math.cos(rad) +
          offset.y,
      }));

      const polygon = `polygon(${rotatedPoints
        .map((p) => `${p.x}px ${p.y}px`)
        .join(", ")})`;

      glow.style.clipPath = polygon;
      glow.style.webkitClipPath = polygon;

      requestAnimationFrame(animateGlow);
    }

    animateGlow();
  }

  // ----------------------------------

  const menu = document.querySelector(".menu");
  const menuClose = document.querySelector(".menu__close");
  const menuLinks = document.querySelectorAll(".menu a");
  const headerBurger = document.querySelector(".header__burger");

  headerBurger.addEventListener("click", () => {
    menu.classList.add("menu__open");
  });

  menuClose.addEventListener("click", () => {
    menu.classList.remove("menu__open");
  });

  menuLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      menu.classList.remove("menu__open");
      const href = link.getAttribute("href");

      if (!href) return;

      if (href.startsWith("#")) {
        location.hash = href;
      } else if (
        !href.includes("#") &&
        (href.endsWith(".html") || href.includes("/"))
      ) {
        window.location.href = href;
      } else if (href.includes("#")) {
        window.location.href = href;
      }
    });
  });
});

class VoiceMessage {
  constructor(container) {
    this.container = container;
    this.playBtn = container.querySelector(".voice__btn");
    this.playIcon = this.playBtn.querySelector("img");
    this.lines = Array.from(container.querySelectorAll(".voice__line"));
    this.audio = null;
    this.isPlaying = false;
    this.currentLine = 0;
    this.totalLines = this.lines.length;

    this.init();
  }

  init() {
    this.audio = new Audio();

    const audioSrc = this.container.dataset.audioSrc || "./audio/sample.mp3";
    this.audio.src = audioSrc;

    this.audio.preload = "metadata";

    this.audio.addEventListener("timeupdate", () => this.updateProgress());
    this.audio.addEventListener("ended", () => this.resetPlayback());
    this.audio.addEventListener("loadedmetadata", () =>
      this.calculateLineDuration()
    );

    this.playBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.togglePlayback();
    });

    // Изначально все линии с opacity 1
    this.resetToInitialState();
  }

  resetToInitialState() {
    // Устанавливаем все линии с opacity 1 по умолчанию
    this.lines.forEach((line) => {
      line.style.opacity = "1";
      line.style.transition = "opacity 0.3s ease";
    });
  }

  calculateLineDuration() {
    if (this.audio.duration && !isNaN(this.audio.duration)) {
      this.lineDuration = this.audio.duration / this.totalLines;
    } else {
      this.lineDuration = 0.5;
    }
  }

  togglePlayback() {
    if (this.isPlaying) {
      this.pause();
    } else {
      // Останавливаем все другие голосовые сообщения перед воспроизведением
      this.stopAllOtherVoiceMessages();
      this.play();
    }
  }

  // Функция для остановки всех других голосовых сообщений
  stopAllOtherVoiceMessages() {
    const allVoiceContainers = document.querySelectorAll(".voice");
    allVoiceContainers.forEach((otherContainer) => {
      // Пропускаем текущий контейнер
      if (otherContainer === this.container) return;

      if (
        otherContainer.voiceInstance &&
        otherContainer.voiceInstance.isPlaying
      ) {
        otherContainer.voiceInstance.pause();
        // Возвращаем иконку play для других сообщений
        const otherPlayIcon = otherContainer.querySelector(".voice__btn img");
        if (otherPlayIcon) {
          otherPlayIcon.src = "./img/play.svg";
        }
        // Убираем класс playing
        const otherPlayBtn = otherContainer.querySelector(".voice__btn");
        if (otherPlayBtn) {
          otherPlayBtn.classList.remove("playing");
        }
        // Возвращаем линии других сообщений в исходное состояние
        otherContainer.voiceInstance.resetToInitialState();
      }
    });
  }

  async play() {
    try {
      await this.audio.play();
      this.isPlaying = true;
      this.playIcon.src = "./img/pause.svg";
      this.playBtn.classList.add("playing");

      // При старте воспроизведения устанавливаем все линии на opacity 0.2
      this.startProgressAnimation();
    } catch (error) {
      console.error("Ошибка воспроизведения:", error);
    }
  }

  pause() {
    this.audio.pause();
    this.isPlaying = false;
    this.playIcon.src = "./img/play.svg";
    this.playBtn.classList.remove("playing");

    this.stopProgressAnimation();
  }

  updateProgress() {
    if (!this.audio.duration || isNaN(this.audio.duration)) return;

    const currentTime = this.audio.currentTime;
    const duration = this.audio.duration;
    const progressPercent = currentTime / duration;

    const currentLineIndex = Math.floor(progressPercent * this.totalLines);

    this.updateLinesVisibility(currentLineIndex);
  }

  updateLinesVisibility(currentLineIndex) {
    this.lines.forEach((line, index) => {
      if (index <= currentLineIndex) {
        // Линии до текущего прогресса - opacity 1
        line.style.opacity = "1";
        line.style.transition = "opacity 0.3s ease";
      } else {
        // Остальные линии - opacity 0.2
        line.style.opacity = "0.2";
      }
    });
  }

  startProgressAnimation() {
    // При старте воспроизведения все линии становятся opacity 0.2
    this.lines.forEach((line) => {
      line.style.opacity = "0.2";
      line.style.transition = "opacity 0.3s ease";
    });

    // Затем начинаем анимацию
    this.animateLines();
  }

  animateLines() {
    // Очищаем предыдущий интервал если есть
    if (this.animationInterval) {
      clearInterval(this.animationInterval);
    }

    this.animationInterval = setInterval(() => {
      if (!this.isPlaying) {
        clearInterval(this.animationInterval);
        return;
      }

      if (this.audio.duration && !isNaN(this.audio.duration)) {
        const progress = this.audio.currentTime / this.audio.duration;
        const currentLine = Math.floor(progress * this.totalLines);
        this.updateLinesVisibility(currentLine);
      }
    }, 100);
  }

  stopProgressAnimation() {
    if (this.animationInterval) {
      clearInterval(this.animationInterval);
    }
  }

  resetPlayback() {
    this.isPlaying = false;
    this.playIcon.src = "./img/play.svg";
    this.playBtn.classList.remove("playing");

    // Возвращаем все линии в исходное состояние (opacity 1)
    this.resetToInitialState();

    this.stopProgressAnimation();
    this.audio.currentTime = 0;
  }

  // Метод для принудительной остановки (вызывается извне)
  forcePause() {
    this.pause();
    // При принудительной остановке возвращаем линии в исходное состояние
    this.resetToInitialState();
  }

  destroy() {
    this.pause();
    if (this.audio) {
      this.audio.remove();
    }
    this.playBtn.removeEventListener("click", this.togglePlayback);
  }
}

// Глобальный объект для управления всеми голосовыми сообщениями
const VoiceMessagesManager = {
  instances: [],

  register(instance) {
    this.instances.push(instance);
  },

  unregister(instance) {
    this.instances = this.instances.filter((inst) => inst !== instance);
  },

  stopAllExcept(exceptInstance) {
    this.instances.forEach((instance) => {
      if (instance !== exceptInstance && instance.isPlaying) {
        instance.forcePause();
      }
    });
  },

  stopAll() {
    this.instances.forEach((instance) => {
      if (instance.isPlaying) {
        instance.forcePause();
      }
    });
  },
};

function initVoiceMessages() {
  const voiceContainers = document.querySelectorAll(".voice");

  voiceContainers.forEach((container) => {
    if (!container.dataset.voiceId) {
      container.dataset.voiceId = `voice-${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 9)}`;
    }

    const voiceMessage = new VoiceMessage(container);

    // Регистрируем экземпляр в менеджере
    VoiceMessagesManager.register(voiceMessage);

    container.voiceInstance = voiceMessage;
  });
}

// Функция для остановки всех голосовых сообщений
function stopAllVoiceMessages() {
  VoiceMessagesManager.stopAll();
}

// Обновляем togglePlayback для использования менеджера
VoiceMessage.prototype.togglePlayback = function () {
  if (this.isPlaying) {
    this.pause();
  } else {
    // Останавливаем все другие голосовые сообщения через менеджер
    VoiceMessagesManager.stopAllExcept(this);
    this.play();
  }
};

// Инициализация при загрузке страницы
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initVoiceMessages);
} else {
  initVoiceMessages();
}

// Экспорт в глобальную область видимости
if (typeof window !== "undefined") {
  window.initVoiceMessages = initVoiceMessages;
  window.stopAllVoiceMessages = stopAllVoiceMessages;
  window.VoiceMessagesManager = VoiceMessagesManager;
}

// JavaScript для слайдера (добавить перед </body>)
// УНИВЕРСАЛЬНЫЙ СКРИПТ ДЛЯ ВСЕХ СТРАНИЦ (добавить в основной JS файл)
// ДОПОЛНИТЕЛЬНЫЙ КОД ДЛЯ ЧАСТИЧНОГО СЛАЙДЕРА
document.addEventListener("DOMContentLoaded", function () {
  // Функция для инициализации слайдера на конкретной секции
  function initReviewsSlider(section) {
    const sliderMobile = section.querySelector(".rewies__slider-track");
    const slides = section.querySelectorAll(".rewies__slide");
    const dots = section.querySelectorAll(".pagination__dot");

    // Если нет слайдера на этой странице - выходим
    if (!sliderMobile || !slides.length) return;

    let currentSlide = 0;
    let isDragging = false;
    let startPos = 0;
    let currentTranslate = 0;
    let prevTranslate = 0;
    let animationID;

    // Определяем, это partial слайдер или обычный
    const isPartialSlider = section.querySelector(
      ".rewies__slider-mobile--partial"
    );
    const slideWidthMultiplier = isPartialSlider ? 0.75 : 1; // Для partial показываем 75% слайда

    // Инициализация слайдера
    function initSlider() {
      const isMobile = window.innerWidth <= 675;

      if (isMobile) {
        // Показываем слайдер
        const sliderContainer = section.querySelector(".rewies__slider-mobile");
        if (sliderContainer) sliderContainer.style.display = "block";

        // Скрываем оригинальную структуру (ищем разные варианты)
        const originalContent =
          section.querySelector(".rewies__column") ||
          section.querySelector(".work__body");
        if (originalContent) originalContent.style.display = "none";

        updateSlider();
        addEventListeners();
        // Для partial не включаем автослайд
      } else {
        // Показываем оригинальную структуру
        const originalContent =
          section.querySelector(".rewies__column") ||
          section.querySelector(".work__body");
        if (originalContent) {
          // Для work используем grid, для reviews - block
          if (section.classList.contains("work")) {
            originalContent.style.display = "grid";
          } else {
            originalContent.style.display = "block";
          }
        }

        // Скрываем слайдер
        const sliderContainer = section.querySelector(".rewies__slider-mobile");
        if (sliderContainer) sliderContainer.style.display = "none";

        removeEventListeners();
        stopAutoSlide();
        currentSlide = 0;
      }
    }

    function addEventListeners() {
      // Свайп для мобильных
      sliderMobile.addEventListener("touchstart", touchStart);
      sliderMobile.addEventListener("touchend", touchEnd);
      sliderMobile.addEventListener("touchmove", touchMove);

      // Клики по пагинации
      dots.forEach((dot, index) => {
        dot.addEventListener("click", () => goToSlide(index));
      });
    }

    function removeEventListeners() {
      sliderMobile.removeEventListener("touchstart", touchStart);
      sliderMobile.removeEventListener("touchend", touchEnd);
      sliderMobile.removeEventListener("touchmove", touchMove);

      dots.forEach((dot, index) => {
        // Удаляем старые обработчики
        const newDot = dot.cloneNode(true);
        dot.parentNode.replaceChild(newDot, dot);
      });
    }

    function touchStart(event) {
      isDragging = true;
      startPos = event.touches[0].clientX;
      sliderMobile.style.transition = "none";
      cancelAnimationFrame(animationID);
      animationID = requestAnimationFrame(animation);
    }

    function touchMove(event) {
      if (!isDragging) return;
      const currentPosition = event.touches[0].clientX;
      const diff = currentPosition - startPos;
      currentTranslate = prevTranslate + diff;
    }

    function touchEnd() {
      if (!isDragging) return;
      isDragging = false;
      cancelAnimationFrame(animationID);

      const movedBy = currentTranslate - prevTranslate;

      // Для partial слайдера делаем порог срабатывания меньше
      const swipeThreshold = isPartialSlider ? 30 : 50;

      // Определяем направление свайпа
      if (movedBy < -swipeThreshold && currentSlide < slides.length - 1) {
        currentSlide++;
      } else if (movedBy > swipeThreshold && currentSlide > 0) {
        currentSlide--;
      }

      goToSlide(currentSlide);
    }

    function animation() {
      if (isDragging) {
        setSliderPosition();
        requestAnimationFrame(animation);
      }
    }

    function setSliderPosition() {
      sliderMobile.style.transform = `translateX(${currentTranslate}px)`;
    }

    function goToSlide(slideIndex) {
      if (slideIndex < 0 || slideIndex >= slides.length) return;

      currentSlide = slideIndex;
      updateSlider();
    }

    function updateSlider() {
      const slideElement = slides[0];
      if (!slideElement) return;

      // Для partial слайдера учитываем реальную ширину с отступами
      let slideWidth;
      if (isPartialSlider) {
        // Получаем вычисленные стили для правильной ширины
        const computedStyle = getComputedStyle(slideElement);
        const width = parseFloat(computedStyle.width);
        const marginRight = parseFloat(computedStyle.marginRight) || 0;
        slideWidth = width + marginRight;
      } else {
        slideWidth = slideElement.clientWidth;
      }

      const translateX = -currentSlide * slideWidth;

      sliderMobile.style.transform = `translateX(${translateX}px)`;
      sliderMobile.style.transition = "transform 0.3s ease";

      // Обновляем пагинацию
      dots.forEach((dot, index) => {
        if (index === currentSlide) {
          dot.classList.add("pagination__dot-active");
        } else {
          dot.classList.remove("pagination__dot-active");
        }
      });

      prevTranslate = translateX;
      currentTranslate = translateX;
    }

    // Инициализация
    initSlider();

    // Обработчик ресайза
    window.addEventListener("resize", function () {
      // При ресайзе обновляем позицию слайдера
      updateSlider();
    });

    // Возвращаем функцию для переинициализации при ресайзе
    return initSlider;
  }

  // Находим все секции с отзывами на странице
  const reviewSections = document.querySelectorAll(".rewies, .work");
  const resizeHandlers = [];

  // Инициализируем слайдеры для всех секций
  reviewSections.forEach((section, index) => {
    const initHandler = initReviewsSlider(section);
    if (initHandler) {
      resizeHandlers.push(initHandler);
    }
  });

  // Глобальный обработчик ресайза
  let resizeTimeout;
  window.addEventListener("resize", function () {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      resizeHandlers.forEach((handler) => handler());
    }, 100);
  });
});
