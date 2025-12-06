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

    this.resetLines();
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
      this.play();
    }
  }

  async play() {
    try {
      await this.audio.play();
      this.isPlaying = true;
      this.playIcon.src = "./img/pause.svg";
      this.playBtn.classList.add("playing");

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
        line.style.opacity = "1";
        line.style.transition = "opacity 0.3s ease";
      } else {
        line.style.opacity = "0.2";
      }
    });
  }

  startProgressAnimation() {
    this.resetLines();

    this.animateLines();
  }

  resetLines() {
    this.lines.forEach((line) => {
      line.style.opacity = "0.2";
      line.style.transition = "opacity 0.1s ease";
    });
  }

  animateLines() {
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
    this.resetLines();
    this.stopProgressAnimation();

    this.audio.currentTime = 0;
  }

  destroy() {
    this.pause();
    this.audio.remove();
    this.playBtn.removeEventListener("click", this.togglePlayback);
  }
}

function initVoiceMessages() {
  const voiceContainers = document.querySelectorAll(".voice");

  voiceContainers.forEach((container) => {
    if (!container.dataset.voiceId) {
      container.dataset.voiceId = `voice-${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 9)}`;
    }

    const voiceMessage = new VoiceMessage(container);

    container.voiceInstance = voiceMessage;
  });
}

function stopAllVoiceMessages() {
  const voiceContainers = document.querySelectorAll(".voice");
  voiceContainers.forEach((container) => {
    if (container.voiceInstance) {
      container.voiceInstance.pause();
    }
  });
}

document.addEventListener("DOMContentLoaded", initVoiceMessages);

if (typeof window !== "undefined") {
  window.initVoiceMessages = initVoiceMessages;
  window.stopAllVoiceMessages = stopAllVoiceMessages;
}
