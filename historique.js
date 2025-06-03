// historique.js

function loadHistoryPage() {
  // Récupère l’historique depuis localStorage (tableau d’objets { date, players, scores })
  const hist = JSON.parse(localStorage.getItem('history')) || [];
  const container = document.getElementById('history-list');
  container.innerHTML = '';

  // Parcours à l’envers pour afficher la plus récente en premier
  hist.slice().reverse().forEach((rec, revIdx) => {
    const origIdx = hist.length - 1 - revIdx;
    // Formatage de la date en JJ/MM/AA
    const dateStr = new Date(rec.date)
      .toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: '2-digit' });

    // Création de la carte
    const card = document.createElement('div');
    card.className = 'history-card';

    // En-tête de la carte
    const hdr = document.createElement('div');
    hdr.className = 'history-header';
    hdr.innerHTML = `
      <div class="history-title">Rikiki du ${dateStr}</div>
      <div class="history-buttons">
        <button class="modify-btn" data-index="${origIdx}" aria-label="Éditer">
          <img src="assets/icons/edit-32-gris.png" alt="Editer">
        </button>
        <button class="delete-btn" data-index="${origIdx}" aria-label="Supprimer">
          <img src="assets/icons/delete-32-rouge.png" alt="Supprimer">
        </button>
      </div>`;
    card.appendChild(hdr);

    // Corps de la carte : liste des joueurs et totaux
    const inner = document.createElement('div');
    inner.className = 'history-inner';
    rec.players.forEach((p, i) => {
      const total = rec.scores.reduce((sum, tour) => sum + (tour[i] || 0), 0);
      inner.innerHTML += `
        <div class="history-player">
          <div class="number">${i + 1}</div>
          <span class="player-name">${p}</span>
          <span class="player-score">${total} pts</span>
        </div>`;
    });
    card.appendChild(inner);

    container.appendChild(card);
  });

  // Boutons ÉDITER
  container.querySelectorAll('.modify-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      const rec = hist[+e.currentTarget.dataset.index];
      // Prépare le mode édition : stocke rec.players et rec.scores
      localStorage.setItem('historyEditMode', 'true');
      localStorage.setItem('currentGame', JSON.stringify({ players: rec.players }));
      localStorage.setItem('scores', JSON.stringify(rec.scores));
      localStorage.setItem('currentTurn', 0);
      window.location.href = 'saisie_scores.html';
    });
  });

  // Boutons SUPPRIMER (avec confirmation)
  container.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      const idx = +e.currentTarget.dataset.index;
      const dateStr = new Date(hist[idx].date)
        .toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: '2-digit' });
      const message = `Voulez-vous vraiment supprimer la partie du ${dateStr} ?`;
      if (confirm(message)) {
        hist.splice(idx, 1);
        localStorage.setItem('history', JSON.stringify(hist));
        loadHistoryPage();
      }
    });
  });
}

// Au chargement de la page, on lance l’affichage
document.addEventListener('DOMContentLoaded', loadHistoryPage);
