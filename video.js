document.addEventListener("DOMContentLoaded", function () {
  // Текущее воспроизводимое видео
  let currentVideo = null;

  // Обработчик клика на кнопки play
  document.querySelectorAll(".play__btn").forEach((button) => {
    button.addEventListener("click", function (e) {
      e.stopPropagation();
      const container = this.closest(".team__img-container");
      const img = container.querySelector(".team__img");
      const icon = this.querySelector("img");

      // Если есть текущее видео и это не то же самое видео
      if (currentVideo && currentVideo.container !== container) {
        // Останавливаем предыдущее видео
        pauseVideo(
          currentVideo.video,
          currentVideo.img,
          currentVideo.icon,
          currentVideo.container
        );
        currentVideo = null;
      }

      // Проверяем, есть ли уже видео
      let video = container.querySelector("video");

      if (!video) {
        // Создаем видео элемент
        video = document.createElement("video");
        video.classList.add("team__video");
        video.loop = false; // УБИРАЕМ ЗАЦИКЛИВАНИЕ
        video.playsInline = true;

        // Заменяем src картинки на видео (предполагаем, что видео есть в той же папке с похожим названием)
        const imgSrc = img.getAttribute("src");
        const videoName = imgSrc
          .replace(".png", ".mp4")
          .replace("team", "video");
        video.src = videoName;

        // Назначаем стили для видео сразу
        video.style.position = "absolute";
        video.style.top = "0";
        video.style.left = "0";
        video.style.width = "100%";
        video.style.height = "100%";
        video.style.objectFit = "cover";
        video.style.borderRadius = "30px"; // Начальное значение как у картинки
        video.style.transition = "border-radius 0.5s ease";
        video.style.zIndex = "1"; // Чтобы было поверх кнопки

        // Сохраняем оригинальный border-radius
        const originalBorderRadius = window.getComputedStyle(img).borderRadius;
        img.setAttribute("data-original-radius", originalBorderRadius);
        video.setAttribute("data-original-radius", originalBorderRadius);

        // Вставляем видео в контейнер
        container.appendChild(video);

        // Показываем видео сразу
        video.style.display = "block";

        // Начинаем воспроизведение
        video
          .play()
          .then(() => {
            // Меняем иконку на паузу
            icon.src = "./img/pause-white.svg";

            // Анимация border-radius для картинки
            img.style.transition = "border-radius 0.5s ease, opacity 0.3s ease";
            img.style.borderRadius = "50%";

            // Анимируем видео в круг
            setTimeout(() => {
              video.style.borderRadius = "50%";
            }, 10);

            // Скрываем картинку
            setTimeout(() => {
              img.style.opacity = "0";
            }, 300);

            // Сохраняем текущее видео
            currentVideo = {
              video: video,
              img: img,
              icon: icon,
              container: container,
            };

            // ДОБАВЛЯЕМ ОБРАБОТЧИК ОКОНЧАНИЯ ВИДЕО
            video.addEventListener("ended", function onVideoEnded() {
              // Автоматически ставим на паузу и скрываем видео
              pauseVideo(video, img, icon, container);
              currentVideo = null;
              // Удаляем обработчик, чтобы не накапливались
              video.removeEventListener("ended", onVideoEnded);
            });
          })
          .catch((error) => {
            console.error("Ошибка воспроизведения видео:", error);
            // В случае ошибки удаляем видео
            video.remove();
            img.style.opacity = "1";
          });
      } else {
        // Видео уже существует
        if (video.paused) {
          // Проверяем, закончилось ли видео
          if (video.ended) {
            // Если видео закончилось, перематываем в начало
            video.currentTime = 0;
          }

          // Возобновляем воспроизведение
          video.play().then(() => {
            icon.src = "./img/pause-white.svg";

            // Анимация border-radius
            video.style.borderRadius = "50%";
            img.style.borderRadius = "50%";
            img.style.opacity = "0";
            video.style.display = "block";

            // Сохраняем текущее видео
            currentVideo = {
              video: video,
              img: img,
              icon: icon,
              container: container,
            };

            // ДОБАВЛЯЕМ ОБРАБОТЧИК ОКОНЧАНИЯ ВИДЕО
            video.addEventListener("ended", function onVideoEnded() {
              pauseVideo(video, img, icon, container);
              currentVideo = null;
              video.removeEventListener("ended", onVideoEnded);
            });
          });
        } else {
          // Ставим на паузу
          pauseVideo(video, img, icon, container);
          if (currentVideo && currentVideo.container === container) {
            currentVideo = null;
          }
        }
      }
    });
  });

  // Функция для остановки видео
  function pauseVideo(video, img, icon, container) {
    video.pause();
    icon.src = "./img/play-white.svg";

    // Возвращаем оригинальный border-radius для видео
    const originalRadius = video.getAttribute("data-original-radius") || "30px";
    video.style.borderRadius = originalRadius;

    // Возвращаем картинку
    img.style.opacity = "1";
    img.style.borderRadius = originalRadius;

    // Скрываем видео после завершения анимации
    video.addEventListener("transitionend", function onTransitionEnd() {
      if (video.style.borderRadius === originalRadius) {
        video.style.display = "none";
        video.removeEventListener("transitionend", onTransitionEnd);
      }
    });
  }
});
