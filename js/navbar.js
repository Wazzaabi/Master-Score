function initNavbar() {
  const currentPage = window.location.pathname.split("/").pop().replace(".html", "");
  const theme = localStorage.getItem("theme") || "light";

  const pages = [
    { page: "index", icon: "accueil" },
    { page: "saisie_scores", icon: "edit" },
    { page: "tableau_scores", icon: "table" },
    { page: "statistiques", icon: "chart" },
    { page: "parametres_partie", icon: "param" },
  ];

  document.getElementById("navbar").innerHTML = pages.map(p => {
    const isActive = p.page === currentPage;
    const iconColor = isActive
      ? (theme === "dark" ? "beige" : "gris") // couleur opposée
      : (theme === "dark" ? "gris" : "beige"); // couleur normale

    return `
      <a href="${p.page}.html" class="nav-item ${isActive ? "active" : ""}" data-page="${p.page}">
        <div class="icon-wrapper">
          <img src="assets/icons/${p.icon}-32-${iconColor}.png"
               class="nav-icon"
               data-icon="${p.icon}" />
        </div>
      </a>
    `;
  }).join("");
}
