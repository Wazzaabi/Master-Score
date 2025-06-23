document.addEventListener("DOMContentLoaded", () => {
  initHeader();
  initNavbar();
  initDarkMode();
});

// Appliquer dark-mode avant le rendu pour éviter le flash
if (localStorage.getItem('theme') === 'dark') {
  document.body.classList.add('dark-mode');
}

// Fonction centrale : applique les couleurs des icônes et l'icône toggle
function applyTheme() {
  const isDark = document.body.classList.contains('dark-mode');
  const activeColor = isDark ? 'gris' : 'beige';
  const inactiveColor = isDark ? 'beige' : 'gris';
  const toggleIcon = document.getElementById('theme-icon');

  // Nav bar
  const navMap = {
    'index.html': ['nav-home', 'accueil'],
    'tableau_scores.html': ['nav-table', 'table'],
    'saisie_scores.html': ['nav-saisie', 'edit'],
    'statistiques.html': ['nav-stats', 'chart'],
    'parametres_partie.html': ['nav-param', 'param']
  };

  const currentPage = location.pathname.split('/').pop();
  const navData = navMap[currentPage];

  document.querySelectorAll('.bottom-nav a').forEach(el => {
    const img = el.querySelector('img');
    const iconName = img?.dataset.iconName;
    if (!iconName) return;

    const isActive = el.id === navData?.[0];
    img.src = `assets/icons/${iconName}-32-${isActive ? activeColor : inactiveColor}.png`;
    el.classList.toggle('active-nav-bar', isActive);
  });

  // Icônes modifier / supprimer
  document.querySelectorAll('.modify-btn, .delete-btn').forEach(img => {
    const name = img.dataset.iconName;
    if (name) {
      img.src = `assets/icons/${name}-32-${activeColor}.png`;
    }
  });

  // Icône du bouton toggle
  if (toggleIcon) {
    toggleIcon.src = isDark
      ? 'assets/icons/sun-32-gris.png'
      : 'assets/icons/dark-32-beige.png';
  }
}

// Toggle bouton thème
const toggleBtn = document.getElementById('toggle-theme');
if (toggleBtn) {
  toggleBtn.addEventListener('click', () => {
    const isDark = document.body.classList.toggle('dark-mode');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    applyTheme();
  });
}

// Gère l’état du bouton Reprendre + déclenchement Nouvelle Partie
document.addEventListener('DOMContentLoaded', () => {
  const cont = document.getElementById('reprendre-container');
  if (cont) {
    if (!localStorage.getItem('currentGame')) {
      cont.classList.add('disabled');
    } else {
      cont.classList.remove('disabled');
    }
  }

  const newGameBtn = document.getElementById('start-new-game');
  if (newGameBtn) {
    newGameBtn.addEventListener('click', (e) => {
      e.preventDefault();

      if (localStorage.getItem('currentGame')) {
        alertManager.show({
          message: "Une partie est déjà en cours. Si vous continuez, elle sera sauvegardée dans l'historique.",
          confirmText: "Continuer",
          cancelText: "Annuler",
          onConfirm: () => {
            const scores = JSON.parse(localStorage.getItem('scores') || '[]');
            const players = JSON.parse(localStorage.getItem('currentGame')).players;
            const history = JSON.parse(localStorage.getItem('history') || '[]');
            history.push({ date: new Date().toISOString(), players, scores });
            localStorage.setItem('history', JSON.stringify(history));

            localStorage.removeItem('currentGame');
            localStorage.removeItem('scores');
            localStorage.removeItem('currentTurn');
            localStorage.removeItem('historyEditMode');

            window.location.href = 'nouvelle_partie.html';
          }
        });
      } else {
        window.location.href = 'nouvelle_partie.html';
      }
    });
  }
});
