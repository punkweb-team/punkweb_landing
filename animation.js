document.addEventListener("DOMContentLoaded", function () {
  setTimeout(initAnimation, 100);
});

function initAnimation() {
  const smallVideo = document.querySelector(".home__video-small");
  const bigVideo = document.querySelector(".home__video-big");
  const homeSection = document.querySelector(".home");

  if (!smallVideo || !bigVideo || !homeSection) {
    console.error("Не найдены необходимые видео элементы");
    return;
  }

  // Регистрируем ScrollTrigger
  gsap.registerPlugin(ScrollTrigger);

  // Создаем копию маленького видео для анимации
  const animatedVideo = smallVideo.cloneNode(true);
  animatedVideo.classList.remove("home__video-small");
  animatedVideo.classList.add("home__video-animated");

  // Получаем позиции элементов ДО добавления в DOM
  const smallRect = smallVideo.getBoundingClientRect();

  // Устанавливаем абсолютную позицию внутри секции home
  Object.assign(animatedVideo.style, {
    width: smallRect.width + "px",
    height: smallRect.height + "px",
    borderRadius: "20px",
    opacity: "1",
    position: "absolute",
    zIndex: "1000",
    pointerEvents: "none",
    objectFit: "cover",
    backgroundColor: "#000",
  });

  // Добавляем анимируемое видео прямо в секцию home
  homeSection.style.position = "relative";
  homeSection.appendChild(animatedVideo);

  // Скрываем оригинальное маленькое видео
  smallVideo.style.opacity = "0";
  smallVideo.style.visibility = "hidden";

  // Изначально скрываем большое видео
  bigVideo.style.opacity = "0";
  bigVideo.style.visibility = "hidden";

  // Перезапускаем видео для синхронизации
  smallVideo.pause();
  bigVideo.pause();
  animatedVideo.pause();

  // Даем время на загрузку видео
  setTimeout(() => {
    animatedVideo.play().catch((e) => console.log("Video play error:", e));
    smallVideo.play().catch((e) => console.log("Small video play error:", e));
    bigVideo.play().catch((e) => console.log("Big video play error:", e));
  }, 500);

  // Функция для обновления анимации
  function setupAnimation() {
    // Получаем актуальные позиции относительно секции home
    const smallRect = smallVideo.getBoundingClientRect();
    const bigRect = bigVideo.getBoundingClientRect();
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
    animatedVideo.style.top = startTop + "px";
    animatedVideo.style.left = startLeft + "px";
    animatedVideo.style.width = startWidth + "px";
    animatedVideo.style.height = startHeight + "px";
    animatedVideo.style.opacity = "1";
    animatedVideo.style.display = "block";

    // Убедимся что видео играет
    animatedVideo
      .play()
      .catch((e) => console.log("Animated video play error:", e));

    // Рассчитываем, сколько нужно проскроллить
    // Начинаем анимацию, когда маленькое видео на 30% от верха экрана
    const startOffset = startTop - windowHeight * 0.3;

    // Заканчиваем анимацию, когда большое видео на 50% от верха экрана (центр)
    const endOffset = endTop - windowHeight * 0.5;

    // Дистанция анимации
    const animationDistance = Math.abs(endOffset - startOffset);

    // Создаем анимацию
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: homeSection,
        start: `top+=${Math.max(0, startOffset)} top`,
        end: `top+=${Math.max(0, endOffset)} top`,
        scrub: true,
        markers: false,
        onUpdate: (self) => {
          const progress = self.progress;
          console.log(progress, "progress");

          // Рассчитываем текущие значения
          const currentTop = startTop + deltaY * progress;
          const currentLeft = startLeft + deltaX * progress;
          const currentWidth = startWidth + deltaWidth * progress;
          const currentHeight = startHeight + deltaHeight * progress;

          // Применяем
          animatedVideo.style.top = currentTop + "px";
          animatedVideo.style.left = currentLeft + "px";
          animatedVideo.style.width = currentWidth + "px";
          animatedVideo.style.height = currentHeight + "px";

          // Плавное переключение в конце
          if (progress > 0.95) {
            const fadeProgress = (progress - 0.95) / 0.05;
            animatedVideo.style.opacity = (1 - fadeProgress).toString();
            bigVideo.style.opacity = fadeProgress.toString();
            bigVideo.style.visibility = "visible";
            bigVideo
              .play()
              .catch((e) => console.log("Big video play error:", e));
          } else {
            animatedVideo.style.opacity = "1";
            bigVideo.style.opacity = "0";
            bigVideo.style.visibility = "hidden";
            bigVideo.pause();
          }
        },
        onLeave: () => {
          // Когда прошли анимацию - скрываем анимированное видео
          animatedVideo.style.display = "none";
          animatedVideo.pause();
          bigVideo.style.opacity = "1";
          bigVideo.style.visibility = "visible";
          bigVideo.play().catch((e) => console.log("Big video play error:", e));
        },
        onEnterBack: () => {
          // Когда возвращаемся назад - показываем анимированное
          animatedVideo.style.display = "block";
          animatedVideo.style.opacity = "1";
          animatedVideo
            .play()
            .catch((e) => console.log("Animated video play error:", e));
          bigVideo.style.opacity = "0";
          bigVideo.style.visibility = "hidden";
          bigVideo.pause();
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
