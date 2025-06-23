// Script spécifique à la page d'accueil

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

  // Icônes modifier / supprimer
  document.querySelectorAll('.modify-btn, .delete-btn').forEach(img => {
    const name = img.dataset.iconName;
    if (name) {
      img.src = `assets/icons/${name}-32-${activeColor}.png`;
    }
  });

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