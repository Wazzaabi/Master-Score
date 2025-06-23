// Script spécifique à la page statistiques

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
const labels = players;

// Prépare le cumul des scores
const cum = Array.from({ length: numPlayers }, () => []);
if (scores.length > 0) {
  scores.forEach((tour, i) => {
    tour.forEach((s, j) => {
      const prev = cum[j][i - 1] || 0;
      cum[j][i] = prev + s;
    });
  });
}

// Recherche de la meilleure/pire série
function findSeries(isPositive) {
  if (scores.length === 0) return { sum: 0, series: [], player: null };
  let best = { sum: isPositive ? 0 : 0, series: [], player: null };
  players.forEach((_, idx) => {
    let currentSeries = [], currentSum = 0;
    for (let t = 0; t < scores.length; t++) {
      const v = scores[t][idx];
      if ((isPositive && v > 0) || (!isPositive && v < 0)) {
        currentSeries.push(v);
        currentSum += v;
        if ((isPositive && currentSum > best.sum) || (!isPositive && currentSum < best.sum)) {
          best = { sum: currentSum, series: currentSeries.slice(), player: idx };
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
let bestScore    = -Infinity;
let worstScore   =  Infinity;
let bestPlayers  = [];
let worstPlayers = [];

if (scores.length > 0) {
  scores.forEach(tour => {
    tour.forEach((s, idx) => {
      if (s > bestScore) {
        bestScore    = s;
        bestPlayers  = [idx];
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
  bestScore  = 0;
  worstScore = 0;
}

window.addEventListener('DOMContentLoaded', () => {
  toggleHeaderLink();

  if (scores.length === 0) {
    return;
  }

  // 1. AFFICHAGE DES KPI
  const bestPos = findSeries(true);
  const bestNeg = findSeries(false);
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

  // 2. INITIALISATION DU GRAPHIQUE AVEC TRI DE LA LÉGENDE
  const ctx = document.getElementById('scoreChart').getContext('2d');

  // Préparation des datasets avec total pour tri
  const datasetsWithTotals = labels.map((label, idx) => ({
    label,
    data: cum[idx],                           // valeurs cumulées
    borderColor: colors[idx % colors.length], // couleur de la courbe
    total: cum[idx][cum[idx].length - 1]      // total final
  }));

  // Tri par total croissant
  datasetsWithTotals.sort((a, b) => b.total - a.total);

  // Options par défaut (clair)
  const lightOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'right',       // place la légende à droite
        labels: {
          color: '#333'
        }
      }
    },
    scales: {
      x: {
        ticks: { color: '#333' },
        grid: { color: 'rgba(0,0,0,0.1)' }
      },
      y: {
        beginAtZero: true,
        ticks: { color: '#333' },
        grid: { color: 'rgba(0,0,0,0.1)' }
      }
    }
  };

  // Options pour mode sombre
  const darkOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'right',
        labels: { color: '#fff' }
      }
    },
    scales: {
      x: {
        ticks: { color: '#fff' },
        grid: { color: 'rgba(255,255,255,0.2)' }
      },
      y: {
        beginAtZero: true,
        ticks: { color: '#fff' },
        grid: { color: 'rgba(255,255,255,0.2)' }
      }
    }
  };

  // Création initiale du chart (clair) avec datasets triés
  const myChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: scores.map((_, i) => `Tour ${i + 1}`),
      datasets: datasetsWithTotals.map(d => ({
        label: d.label,
        data: d.data,
        fill: false,
        borderColor: d.borderColor,
        tension: 0.2
      }))
    },
    options: lightOptions
  });

  // Récupération des éléments pour le plein écran et le toggle
  const wrapper   = document.querySelector('.chart-wrapper');
  const closeBtn  = document.getElementById('closeChart');
  const toggleBtn = document.getElementById('toggleTheme');
  let isDarkMode  = false;

  // Fonction pour verrouiller l’écran en paysage si possible
  function lockLandscape() {
    if (screen.orientation && screen.orientation.lock) {
      screen.orientation.lock('landscape').catch(() => {
        // Si échec (non supporté), on ignore.
      });
    }
  }
  // Fonction pour débloquer l’orientation
  function unlockOrientation() {
    if (screen.orientation && screen.orientation.unlock) {
      screen.orientation.unlock();
    }
  }

  // 2.a) Clic sur le wrapper pour passer en plein écran
  wrapper.addEventListener('click', () => {
    if (!wrapper.classList.contains('fullscreen')) {
      wrapper.classList.add('fullscreen');
      closeBtn.style.display  = 'flex';
      toggleBtn.style.display = 'flex';
      // Forcer la bascule en paysage
      lockLandscape();
      setTimeout(() => myChart.resize(), 50);
    }
  });

  // 2.b) Clic sur la croix pour quitter le plein écran
  closeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    wrapper.classList.remove('fullscreen');
    wrapper.classList.remove('light');
    isDarkMode = false;
    closeBtn.style.display  = 'none';
    toggleBtn.style.display = 'none';
    unlockOrientation();
    myChart.options = lightOptions;
    document.querySelector('.chart-wrapper').style.background = '';
    setTimeout(() => myChart.resize(), 50);
  });

  // 2.c) Clic sur toggle pour passer de sombre ↔ clair
  toggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    isDarkMode = !isDarkMode;
    if (isDarkMode) {
      wrapper.classList.remove('light');
      wrapper.style.background = 'var(--gris)';
      myChart.options = darkOptions;
      toggleBtn.textContent = '🌙';
    } else {
      wrapper.classList.add('light');
      wrapper.style.background = 'var(--beige)';
      myChart.options = lightOptions;
      toggleBtn.textContent = '☀️';
    }
    myChart.update();
  });

  // 3. CLASSEMENT FINAL TRIÉ PAR SCORE DÉCROISSANT
  const ranking = document.getElementById('ranking');
  ranking.innerHTML = '<h3>Classement final</h3>';
  const playersData = labels.map((name, idx) => ({
    name,
    total: cum[idx][cum[idx].length - 1],
    color: colors[idx % colors.length]
  }));
  playersData.sort((a, b) => b.total - a.total);
  playersData.forEach(player => {
    const line = document.createElement('div');
    line.innerHTML = `
      <span class="player-color" style="background:${player.color}"></span>
      ${player.name} : ${player.total} pts
    `;
    ranking.appendChild(line);
  });
});
