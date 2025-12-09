document.addEventListener("DOMContentLoaded", function () {
  setTimeout(initAnimation, 100);
});

function initAnimation() {
  const smallImg = document.querySelector(".home__img");
  const bigImg = document.querySelector(".home__img-big");
  const homeSection = document.querySelector(".home");

  if (!smallImg || !bigImg || !homeSection) {
    console.error("Не найдены необходимые элементы");
    return;
  }

  // Регистрируем ScrollTrigger
  gsap.registerPlugin(ScrollTrigger);

  // Создаем копию маленькой картинки для анимации
  const animatedImg = smallImg.cloneNode(true);
  animatedImg.classList.add("home__img-animated");

  // Получаем позиции элементов ДО добавления в DOM
  const smallRect = smallImg.getBoundingClientRect();
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

  // Устанавливаем абсолютную позицию внутри секции home
  Object.assign(animatedImg.style, {
    width: smallRect.width + "px",
    height: smallRect.height + "px",
    top: smallRect.top + "px",
    left: smallRect.left + "px",
    borderRadius: "20px",
    opacity: "1",
    position: "absolute", // Меняем на absolute!
    zIndex: "1000",
    pointerEvents: "none",
    objectFit: "cover",
  });

  // Добавляем анимируемую картинку прямо в секцию home
  homeSection.style.position = "relative"; // Делаем секцию контейнером
  homeSection.appendChild(animatedImg);

  // Скрываем оригинальную маленькую картинку
  smallImg.style.opacity = "0";
  smallImg.style.visibility = "hidden";

  // Изначально скрываем большую картинку
  bigImg.style.opacity = "0";
  bigImg.style.visibility = "hidden";

  // Функция для обновления анимации
  function setupAnimation() {
    // Получаем актуальные позиции относительно секции home
    const smallRect = smallImg.getBoundingClientRect();
    const bigRect = bigImg.getBoundingClientRect();
    const homeRect = homeSection.getBoundingClientRect();
    const windowHeight = window.innerHeight;

    // Рассчитываем относительные позиции внутри секции
    const startTop = smallRect.top - homeRect.top;
    const endTop = bigRect.top - homeRect.top;

    const startLeft = smallRect.left - homeRect.left;
    const endLeft = bigRect.left - homeRect.left;

    // Размеры
    const startWidth = smallRect.width;
    const endWidth = bigRect.width;

    const startHeight = smallRect.height;
    const endHeight = bigRect.height;

    // Разница
    const deltaY = endTop - startTop;
    const deltaX = endLeft - startLeft;
    const deltaWidth = endWidth - startWidth;
    const deltaHeight = endHeight - startHeight;

    // Устанавливаем начальную позицию
    animatedImg.style.top = startTop + "px";
    animatedImg.style.left = startLeft + "px";
    animatedImg.style.width = startWidth + "px";
    animatedImg.style.height = startHeight + "px";
    animatedImg.style.opacity = "1";
    animatedImg.style.display = "block";

    // Рассчитываем, сколько нужно проскроллить
    // Начинаем анимацию, когда маленькая картинка на 30% от верха экрана
    const startOffset = startTop - windowHeight * 0.3;

    // Заканчиваем анимацию, когда большая картинка на 50% от верха экрана (центр)
    const endOffset = endTop - windowHeight * 0.5;

    // Дистанция анимации
    const animationDistance = Math.abs(endOffset - startOffset);

    // Создаем анимацию
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: homeSection,
        start: `top+=${Math.max(0, startOffset)} top`, // Начинаем когда картинка на 30% от верха
        end: `top+=${Math.max(0, endOffset)} top`, // Заканчиваем когда на 50% от верха (центр)
        scrub: true,
        markers: false, // Для отладки можно поставить true
        onUpdate: (self) => {
          const progress = self.progress;

          // Рассчитываем текущие значения
          const currentTop = startTop + deltaY * progress;
          const currentLeft = startLeft + deltaX * progress;
          const currentWidth = startWidth + deltaWidth * progress;
          const currentHeight = startHeight + deltaHeight * progress;

          // Применяем
          animatedImg.style.top = currentTop + "px";
          animatedImg.style.left = currentLeft + "px";
          animatedImg.style.width = currentWidth + "px";
          animatedImg.style.height = currentHeight + "px";

          // Плавное переключение в конце
          if (progress > 0.95) {
            const fadeProgress = (progress - 0.95) / 0.05;
            animatedImg.style.opacity = (1 - fadeProgress).toString();
            bigImg.style.opacity = fadeProgress.toString();
            bigImg.style.visibility = "visible";
          } else {
            animatedImg.style.opacity = "1";
            bigImg.style.opacity = "0";
            bigImg.style.visibility = "hidden";
          }
        },
        onLeave: () => {
          // Когда прошли анимацию - скрываем анимированную картинку
          animatedImg.style.display = "none";
          bigImg.style.opacity = "1";
          bigImg.style.visibility = "visible";
        },
        onEnterBack: () => {
          // Когда возвращаемся назад - показываем анимированную
          animatedImg.style.display = "block";
          animatedImg.style.opacity = "1";
          bigImg.style.opacity = "0";
          bigImg.style.visibility = "hidden";
        },
      },
    });

    return tl;
  }

  // Инициализируем анимацию
  let animation = setupAnimation();

  // Обработка ресайза
  let resizeTimeout;
  window.addEventListener("resize", function () {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(function () {
      if (animation && animation.scrollTrigger) {
        animation.scrollTrigger.kill();
      }
      animation = setupAnimation();
      ScrollTrigger.refresh();
    }, 250);
  });
}
