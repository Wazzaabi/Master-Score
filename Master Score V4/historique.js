// historique.js

// Affiche la liste des parties terminées, avec boutons Éditer / Supprimer
function loadHistoryPage() {
  const hist = JSON.parse(localStorage.getItem('history') || '[]');
  const container = document.getElementById('history-list');
  container.innerHTML = '';

  // Parcours des enregistrements dans l’ordre inverse (du plus récent au plus ancien)
  hist.slice().reverse().forEach((rec, reverseIdx) => {
    // Calculer l’index réel dans le tableau initial
    const origIdx = hist.length - 1 - reverseIdx;

    const dateStr = new Date(rec.date).toLocaleDateString('fr-FR', {
      day: '2-digit', month: '2-digit', year: '2-digit'
    });

    // Création de la carte historique
    const card = document.createElement('div');
    card.className = 'history-card';

    // En-tête avec titre + boutons
    const header = document.createElement('div');
    header.className = 'history-header';

    const title = document.createElement('div');
    title.className = 'history-title';
    title.textContent = `Partie du ${dateStr}`;

    // Boutons Éditer / Supprimer
    const buttonsDiv = document.createElement('div');
    buttonsDiv.className = 'history-buttons';

    // Bouton Éditer
    const editBtn = document.createElement('button');
    editBtn.className = 'modify-btn';
    editBtn.setAttribute('aria-label', 'Éditer');
    editBtn.innerHTML = '<img src="https://img.icons8.com/?size=100&id=edit&format=png&color=404040" alt="Éditer">';
    editBtn.dataset.index = origIdx;
    editBtn.addEventListener('click', () => {
      // Quand on édite, on stocke dans localStorage l’entrée à modifier
      localStorage.setItem('historyEditMode', 'true');
      localStorage.setItem('editHistoryIndex', origIdx);

      // Réinjection des données de la partie dans currentGame / scores / currentTurn
      localStorage.setItem(
        'currentGame',
        JSON.stringify({ players: rec.players })
      );
      localStorage.setItem('scores', JSON.stringify(rec.scores));
      localStorage.setItem('currentTurn', '0');

      // Redirection vers la saisie en mode édition
      window.location.href = 'saisie_scores.html';
    });

    // Bouton Supprimer
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.setAttribute('aria-label', 'Supprimer');
    deleteBtn.innerHTML = '<img src="https://img.icons8.com/?size=100&id=trash&format=png&color=404040" alt="Supprimer">';
    deleteBtn.dataset.index = origIdx;
    deleteBtn.addEventListener('click', () => {
      hist.splice(origIdx, 1);
      localStorage.setItem('history', JSON.stringify(hist));
      loadHistoryPage(); // Rafraîchissement de la liste
    });

    buttonsDiv.appendChild(editBtn);
    buttonsDiv.appendChild(deleteBtn);
    header.appendChild(title);
    header.appendChild(buttonsDiv);

    // Corps de la carte : liste des joueurs + total
    const inner = document.createElement('div');
    inner.className = 'history-inner';

    rec.players.forEach((p, i) => {
      // Calcul du total du joueur i
      const total = rec.scores.reduce((acc, tour) => acc + (tour[i] || 0), 0);

      const playerDiv = document.createElement('div');
      playerDiv.className = 'history-player';

      const numSpan = document.createElement('span');
      numSpan.className = 'number';
      numSpan.textContent = i + 1;

      const nameSpan = document.createElement('span');
      nameSpan.className = 'player-name';
      nameSpan.textContent = p;

      const scoreSpan = document.createElement('span');
      scoreSpan.className = 'player-score';
      scoreSpan.textContent = total;

      playerDiv.appendChild(numSpan);
      playerDiv.appendChild(nameSpan);
      playerDiv.appendChild(scoreSpan);
      inner.appendChild(playerDiv);
    });

    card.appendChild(header);
    card.appendChild(inner);
    container.appendChild(card);
  });
}

window.addEventListener('DOMContentLoaded', () => {
  loadHistoryPage();
});
