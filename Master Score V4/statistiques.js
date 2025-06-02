// statistiques.js

// Affiche le back-link si on vient de l’historique
function toggleHeaderLink() {
  if (localStorage.getItem('historyEditMode') === 'true') {
    document.querySelector('.back-link').style.display  = 'block';
    document.querySelector('.home-link').style.display  = 'none';
  }
}

// Récupère la partie en cours et ses joueurs
const currentGame = JSON.parse(localStorage.getItem('currentGame')) || { players: [] };
const players     = currentGame.players;
const numPlayers  = players.length;

// Récupère les scores (matrix tour × joueur)
const scores = JSON.parse(localStorage.getItem('scores')) || [];

// Couleurs et labels pour Chart.js
const colors = ['#e6194b','#3cb44b','#ffe119','#4363d8','#f58231','#911eb4'];
const labels = players.map((_, i) => `Joueur ${i + 1}`);

// Préparation des données cumulées
const cum = Array.from({ length: numPlayers }, () => []);

// Si des scores existent, on calcule le cumul tour après tour
if (scores.length > 0) {
  scores.forEach((tour, i) => {
    tour.forEach((s, j) => {
      const previous = cum[j][i - 1] || 0;
      cum[j][i] = previous + s;
    });
  });
}

// Fonctions pour trouver la “meilleure série” et la “pire série”
function findSeries(isPositive) {
  // Si pas de scores, on retourne un objet neutre
  if (scores.length === 0) {
    return { sum: 0, series: [], player: null };
  }

  let best = { sum: isPositive ? 0 : 0, series: [], player: null };

  // On parcourt chaque joueur
  players.forEach((_, playerIdx) => {
    let currentSeries = [], currentSum = 0;
    for (let t = 0; t < scores.length; t++) {
      const v = scores[t][playerIdx];
      if ((isPositive && v > 0) || (!isPositive && v < 0)) {
        currentSeries.push(v);
        currentSum += v;
        if ((isPositive && currentSum > best.sum) || (!isPositive && currentSum < best.sum)) {
          best = { sum: currentSum, series: currentSeries.slice(), player: playerIdx };
        }
      } else {
        currentSeries = [];
        currentSum = 0;
      }
    }
  });

  return best;
}

// Recherche du meilleur et du pire score isolé
let bestScore   = -Infinity;
let worstScore  =  Infinity;
let bestPlayers = [];
let worstPlayers = [];

if (scores.length > 0) {
  scores.forEach(tour => {
    tour.forEach((s, idx) => {
      if (s > bestScore) {
        bestScore   = s;
        bestPlayers = [idx];
      } else if (s === bestScore) {
        bestPlayers.push(idx);
      }
      if (s < worstScore) {
        worstScore   = s;
        worstPlayers = [idx];
      } else if (s === worstScore) {
        worstPlayers.push(idx);
      }
    });
  });
} else {
  // Pour nouvelle partie, on fixe à zéro pour ne pas avoir d’Infinity
  bestScore  = 0;
  worstScore = 0;
}

// Au chargement de la page
window.addEventListener('DOMContentLoaded', () => {
  toggleHeaderLink();

  // Si aucune donnée de scores, on quitte simplement : KPI, graphique et classement restent vides
  if (scores.length === 0) {
    return;
  }

  // 1. AFFICHAGE DES KPI
  const bestPos = findSeries(true);
  const bestNeg = findSeries(false);

  // Conteneur KPI : on injecte quatre boîtes
  document.getElementById('kpi-container').innerHTML = `
    <div class="kpi-box">
      Meilleure Série<br>
      <strong>+${bestPos.sum}</strong><br>
      <small>${bestPos.series.join(', ')} – ${labels[bestPos.player]}</small>
    </div>
    <div class="kpi-box">
      Pire Série<br>
      <strong>${bestNeg.sum}</strong><br>
      <small>${bestNeg.series.join(', ')} – ${labels[bestNeg.player]}</small>
    </div>
    <div class="kpi-box">
      Meilleur Score<br>
      <strong>+${bestScore}</strong><br>
      <small>${[...new Set(bestPlayers)].map(i => labels[i]).join(', ')}</small>
    </div>
    <div class="kpi-box">
      Pire Score<br>
      <strong>${worstScore}</strong><br>
      <small>${[...new Set(worstPlayers)].map(i => labels[i]).join(', ')}</small>
    </div>
  `;

  // 2. CRÉATION DU GRAPHIQUE CUMULÉ (Chart.js)
  const ctx = document.getElementById('scoreChart').getContext('2d');
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: scores.map((_, i) => `Tour ${i + 1}`),
      datasets: cum.map((data, idx) => ({
        label: labels[idx],
        data,
        fill: false,
        borderColor: colors[idx % colors.length],
        tension: 0.2
      }))
    },
    options: {
      responsive: true,
      plugins: { legend: { position: 'bottom' } },
      scales: { y: { beginAtZero: true } }
    }
  });

  // 3. CLASSEMENT FINAL
  const ranking = document.getElementById('ranking');
  ranking.innerHTML = '<h3>Classement final</h3>'; // Réinitialise le conteneur

  // On récupère le cumul du dernier tour pour chaque joueur
  players.forEach((_, idx) => {
    const totalPts = cum[idx][cum[idx].length - 1];
    const divLine = document.createElement('div');
    divLine.innerHTML = `
      <span class="player-color" style="background: ${colors[idx % colors.length]}"></span>
      ${labels[idx]} : ${totalPts} pts
    `;
    ranking.appendChild(divLine);
  });
});
