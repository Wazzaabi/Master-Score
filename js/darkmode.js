function initDarkMode() {
  const theme = localStorage.getItem("theme") || "light";
  applyTheme(theme);

  const toggle = document.getElementById("theme-toggle");
  toggle?.addEventListener("click", () => {
    const newTheme = document.documentElement.classList.contains("dark") ? "light" : "dark";
    applyTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  });
}

function applyTheme(theme) {
  document.documentElement.classList.remove("light", "dark");
  document.documentElement.classList.add(theme);

  // Changer les icônes selon le thème
  const allIconsA = document.querySelectorAll("img.theme-icon");
  allIconsA.forEach((img) => {
    img.src = img.src
      .replace("-gris.png", `-${theme === "dark" ? "beige" : "gris"}.png`)
      .replace("-beige.png", `-${theme === "dark" ? "beige" : "gris"}.png`);
  });
  // Changer les icônes selon le thème
  const allIconsB = document.querySelectorAll("img.nav-icon");
  allIconsB.forEach((img) => {
    img.src = img.src
      .replace("-gris.png", `-${theme === "dark" ? "gris" : "beige"}.png`)
      .replace("-beige.png", `-${theme === "dark" ? "gris" : "beige"}.png`);
  });
  localStorage.setItem("theme", theme);
  initNavbar(); // ← recharge les icônes avec les bons suffixes
}
