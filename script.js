document.addEventListener("DOMContentLoaded", () => {
  const glow = document.querySelector(".cover_wrap_content.--cover-glow");
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
    link.addEventListener("click", () => {
      menu.classList.remove("menu__open");
    });
  });
});
