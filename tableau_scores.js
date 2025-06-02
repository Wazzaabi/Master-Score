// tableau_scores.js

// Affiche le back-link si on vient de l’historique
function toggleHeaderLink() {
  if (localStorage.getItem('historyEditMode') === 'true') {
    document.querySelector('.back-link').style.display = 'block';
    document.querySelector('.home-link').style.display = 'none';
  }
}

// Récupère la partie en cours pour connaître le nombre de joueurs et leurs noms
const currentGame = JSON.parse(localStorage.getItem('currentGame')) || { players: [] };
const players     = currentGame.players;
const numPlayers  = players.length;

// Récupère la grille des scores (tableau tour × joueur). Pour une nouvelle partie, scores = []
const scores = JSON.parse(localStorage.getItem('scores')) || [];

window.addEventListener('DOMContentLoaded', () => {
  toggleHeaderLink();

  const headerRow = document.getElementById("headerRow");
  const tableBody = document.getElementById("tableBody");
  const totalRow  = document.getElementById("totalRow");

  // 1. Construction de l’en-tête : colonne "Tour", puis une colonne par joueur (nom)
  players.forEach((name, i) => {
    const th = document.createElement("th");
    th.textContent = name; // Affiche le nom du joueur
    headerRow.appendChild(th);

    // Crée aussi une cellule vide dans le <tfoot> pour le total
    const tdTotal = document.createElement("td");
    tdTotal.id = `total-${i}`;
    tdTotal.textContent = `0`; // Nouvelle partie → total initial = 0
    totalRow.appendChild(tdTotal);
  });

  // 2. Si des scores existent (reprise ou édition), afficher les lignes de tours
  //    Sinon (nouvelle partie), tableBody reste vide
  if (scores.length > 0) {
    const totals = Array(numPlayers).fill(0);
    scores.forEach((tour, idx) => {
      const tr = document.createElement("tr");
      // Première colonne : numéro du tour
      const tdTour = document.createElement("td");
      tdTour.textContent = `Tour ${idx + 1}`;
      tr.appendChild(tdTour);

      // Colonnes suivantes : score de chaque joueur pour ce tour
      tour.forEach((s, j) => {
        const td = document.createElement("td");
        td.textContent = s;
        totals[j] += s;
        tr.appendChild(td);
      });

      tableBody.appendChild(tr);
    });

    // 3. Mise à jour des totaux finaux (en bas du tableau)
    totals.forEach((sum, i) => {
      const cell = document.getElementById(`total-${i}`);
      if (cell) cell.textContent = sum;
    });
  }
});
