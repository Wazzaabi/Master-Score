// saisie_scores.js



let currentTurn = parseInt(localStorage.getItem('currentTurn')) || 0;
let scores      = JSON.parse(localStorage.getItem('scores'))      || [];

// Indicateur : est-ce qu’une modification a été faite sur le score du tour en cours ?
let isModified = false;

function isGameStarted() {
  const scores = JSON.parse(localStorage.getItem('scores') || '[]');
  return scores.some(tour => tour.some(score => score !== 0 && !isNaN(score)));
}

/**
 * Met à jour l’affichage "Tour X / Y"
 * Appelle aussi updatePrevButton pour gérer l’état du bouton "Tour Précédent".
 */
function updateTurnDisplay(turn) {
  const turnElem  = document.getElementById('turn-number');
  const totalElem = document.getElementById('turn-total');
  const totalTurns = Math.max(scores.length, turn + 1);
  if (turnElem && totalElem) {
    turnElem.textContent  = turn + 1;
    totalElem.textContent = totalTurns;
  }
  updatePrevButton();
}

/**
 * Active ou désactive le bouton "Tour Précédent" :
 * - Si currentTurn === 0 (premier tour), on le désactive (grisé, pas de pointer-events).
 * - Sinon, on le réactive.
 */
function updatePrevButton() {
  const prevBtn = document.querySelectorAll('.tool-box-buttons')[0];
  if (currentTurn === 0) {
    prevBtn.style.pointerEvents = 'none';
    prevBtn.classList.add('disabled-btn');
  } else {
    prevBtn.style.pointerEvents = 'auto';
    prevBtn.classList.remove('disabled-btn');
  }
}

// Génère les champs de saisie pour chaque joueur
function generateScoreInputs() {
  const game      = JSON.parse(localStorage.getItem('currentGame')) || { players: [] };
  const container = document.querySelector('.saisie-des-scores-section');
  container.innerHTML = '';

  game.players.forEach(name => {
    const box = document.createElement('div');
    box.className = 'saisie-des-scores-box';

    box.innerHTML = `
      <div class="saisie-des-scores-box-header">${name}</div>
      <div class="saisie-des-scores-box-body">
        <div class="saisie-des-scores-box-left">
          <input type="text" class="sdsbl-input-score" placeholder="0" />
          <div class="sdsbl-total">
            <span>Total :</span>
            <span class="sdsbl-total-score">0</span>
          </div>
        </div>
        <div class="saisie-des-scores-box-right">
          <a class="sdsbr-previous-score">+10</a>
          <a class="sdsbr-previous-score">+5</a>
          <a class="sdsbr-previous-score">-10</a>
        </div>
      </div>
    `;
    container.appendChild(box);
  });
}

/**
 * Lie les boutons (+10, +5, -10) et ajoute un listener 'input'
 * sur chaque champ <input> pour mettre à jour le total instantanément,
 * sauvegarder immédiatement le tour dans localStorage.scores, et marquer isModified=true.
 */
function bindFields() {
  // Incrément / décrément via boutons
  document.querySelectorAll('.sdsbr-previous-score').forEach(btn => {
    btn.addEventListener('click', e => {
      const input = e.target
                      .closest('.saisie-des-scores-box-body')
                      .querySelector('.sdsbl-input-score');
      input.value = (parseInt(input.value) || 0) + parseInt(btn.textContent);
      isModified = true;
      updateTotals(); // Met à jour, sauvegarde, et recalcul total
    });
  });

  // Mise à jour instantanée du total quand l'utilisateur tape directement dans l'input
  document.querySelectorAll('.sdsbl-input-score').forEach(input => {
    input.addEventListener('input', () => {
      // On accepte chiffres et signes +/-, on retire tout le reste
      input.value = input.value.replace(/[^0-9\-+]/g, '');
      isModified = true;
      updateTotals(); // Met à jour, sauvegarde, et recalcul total
    });
  });
}

/**
 * Charge un tour spécifique (affiche les valeurs déjà saisies ou met à zéro),
 * puis appelle updateTotals() pour afficher et sauvegarder immédiatement,
 * sans considérer ça comme une "modification" (isModified reste false).
 */
function loadTurn(turn) {
  updateTurnDisplay(turn);
  const inputs = document.querySelectorAll('.sdsbl-input-score');
  if (!scores[turn]) {
    inputs.forEach(i => i.value = 0);
  } else {
    scores[turn].forEach((v, i) => {
      if (inputs[i]) inputs[i].value = v;
    });
  }
  // On ne marque pas isModified = true ici, car c’est juste un affichage existant
  isModified = false;
  updateTotals(); // Affiche (et sauvegarde si besoin), mais isModified = false reste
}

/**
 * Sauvegarde explicitement le tour en cours dans localStorage.scores et localStorage.currentTurn
 */
function saveTurn() {
  const inputs = document.querySelectorAll('.sdsbl-input-score');
  const tour   = Array.from(inputs).map(i => parseInt(i.value) || 0);
  scores[currentTurn] = tour;
  localStorage.setItem('scores', JSON.stringify(scores));
  localStorage.setItem('currentTurn', currentTurn);
}

/**
 * Calcule et affiche les totaux cumulés par joueur, en intégrant
 * la valeur actuellement affichée dans l’input du tour en cours,
 * puis sauvegarde immédiatement le tour dans localStorage.scores,
 * **et ne modifie pas le flag isModified** (le tour est déjà marqué modifié
 * au premier changement, donc pas besoin de le repositionner ici).
 */
function updateTotals() {
  const inputs     = Array.from(document.querySelectorAll('.sdsbl-input-score'));
  const numPlayers = inputs.length;
  const totals     = new Array(numPlayers).fill(0);

  // 1. On parcourt tous les tours déjà enregistrés dans scores[]
  for (let t = 0; t < scores.length; t++) {
    for (let i = 0; i < numPlayers; i++) {
      let v = 0;
      if (t === currentTurn) {
        // Pour le tour en cours, on prend la valeur dans l'input
        v = parseInt(inputs[i].value) || 0;
      } else {
        v = scores[t][i] || 0;
      }
      totals[i] += v;
    }
  }

  // 2. Si currentTurn est au-delà de scores.length (nouveau tour),
  //    on ajoute simplement la valeur de l'input du tour actuel
  if (currentTurn >= scores.length) {
    for (let i = 0; i < numPlayers; i++) {
      totals[i] += parseInt(inputs[i].value) || 0;
    }
  }

  // 3. Mise à jour de l'affichage du total pour chaque joueur
  totals.forEach((sum, i) => {
    document.querySelectorAll('.sdsbl-total-score')[i].textContent = sum;
  });

  // 4. Sauvegarde automatique du tour courant dans scores[] + localStorage
  const tourActuel = inputs.map(i => parseInt(i.value) || 0);
  scores[currentTurn] = tourActuel;
  localStorage.setItem('scores', JSON.stringify(scores));
  localStorage.setItem('currentTurn', currentTurn);
}

/**
 * Gère l’animation de transition entre tours.  
 * Ne se déclenche jamais si le bouton "Tour Précédent" est désactivé (pointer-events:none).
 */
function animateTransition(direction) {
  const container = document.querySelector('.saisie-des-scores-section');
  const [prevBtn, , nextBtn] = document.querySelectorAll('.tool-box-buttons');

  // Désactive brièvement les boutons pour éviter plusieurs clics rapides
  prevBtn.style.pointerEvents = nextBtn.style.pointerEvents = 'none';

  const outClass = direction === 'next' ? 'slide-out-left' : 'slide-out-right';
  const inClass  = direction === 'next' ? 'slide-in-right' : 'slide-in-left';

  container.classList.add(outClass);
  container.addEventListener('animationend', function once() {
    container.removeEventListener('animationend', once);
    container.classList.remove(outClass);

    loadTurn(currentTurn); // Appelle updatePrevButton() via updateTurnDisplay()

    container.classList.add(inClass);
    container.addEventListener('animationend', function twice() {
      container.removeEventListener('animationend', twice);
      container.classList.remove(inClass);
      prevBtn.style.pointerEvents = nextBtn.style.pointerEvents = 'auto';
    });
  });
}

/**
 * Lie les boutons “Tour Précédent”, “Fin de Partie” et “Tour Suivant”
 * et gère le cas ‘Retour’ en mode édition avec message d’avertissement.

*/
document.getElementById('finish-game').addEventListener('click', () => {
  if (!isGameStarted()) {
    showAlert({
      message: "La partie n’a pas encore commencé. Vous devez d’abord saisir au moins un score."
    });
    return;
  }

  showAlert({
    message: "Êtes-vous sûr de vouloir terminer cette partie ? Elle sera automatiquement sauvegardée.",
    onConfirm: () => {
      saveTurn();
      const history = JSON.parse(localStorage.getItem('history') || '[]');
      const game = JSON.parse(localStorage.getItem('currentGame'));
      const scores = JSON.parse(localStorage.getItem('scores'));
      history.push({ date: new Date().toISOString(), players: game.players, scores });
      localStorage.setItem('history', JSON.stringify(history));
      localStorage.removeItem('currentGame');
      localStorage.removeItem('scores');
      localStorage.removeItem('currentTurn');
      window.location.href = 'index.html';
    }
  });
});


function bindNavigation() {
  const [prevBtn, nextBtn, finishBtn] = document.querySelectorAll('.tool-box-buttons');

  prevBtn.addEventListener('click', () => {
    if (currentTurn === 0) return;
    saveTurn();
    currentTurn = Math.max(0, currentTurn - 1);
    animateTransition('prev');
  });

  finishBtn.addEventListener('click', () => {
    saveTurn();
    const hist    = JSON.parse(localStorage.getItem('history') || '[]');
    const editIdx = parseInt(localStorage.getItem('editHistoryIndex'), 10);

    if (!isNaN(editIdx)) {
      // Mode édition historique : remplacer l’entrée existante
      hist[editIdx] = {
        date: new Date().toISOString(),
        players: JSON.parse(localStorage.getItem('currentGame')).players,
        scores
      };
      localStorage.removeItem('editHistoryIndex');
      localStorage.removeItem('historyEditMode');
    } else {
      // Mode "nouvelle fin de partie" : ajout classique
      hist.push({
        date: new Date().toISOString(),
        players: JSON.parse(localStorage.getItem('currentGame')).players,
        scores
      });
    }

    localStorage.setItem('history', JSON.stringify(hist));
    localStorage.removeItem('currentGame');
    localStorage.removeItem('scores');
    localStorage.removeItem('currentTurn');
    window.location.href = 'index.html';
  });

  nextBtn.addEventListener('click', () => {
    saveTurn();
    currentTurn++;
    animateTransition('next');
  });
}

window.addEventListener('DOMContentLoaded', () => {
  // 1. Protection : si pas de partie en cours, on retourne à l’accueil
  if (!localStorage.getItem('currentGame')) {
    window.location.href = 'index.html';
    return;
  }

 

  // 3. Initialisation de la saisie
  generateScoreInputs();
  bindFields();
  bindNavigation();
  loadTurn(currentTurn); // Affiche le tour actuel sans marquer isModified
});


function isGameStarted() {
  const scores = JSON.parse(localStorage.getItem('scores') || '[]');
  return scores.some(tour => tour.some(score => score !== 0 && !isNaN(score)));
}


document.getElementById('finish-game').addEventListener('click', () => {
  if (!isGameStarted()) {
    showAlert({
      message: "La partie n’a pas encore commencé. Vous devez d’abord saisir au moins un score.",
      onlyOk: true
    });
    return;
  }

  showAlert({
    message: "Êtes-vous sûr de vouloir terminer cette partie ? Elle sera automatiquement sauvegardée.",
    onConfirm: () => {
      saveTurn();
      const history = JSON.parse(localStorage.getItem('history') || '[]');
      const game = JSON.parse(localStorage.getItem('currentGame'));
      const scores = JSON.parse(localStorage.getItem('scores'));
      history.push({ date: new Date().toISOString(), players: game.players, scores });
      localStorage.setItem('history', JSON.stringify(history));
      localStorage.removeItem('currentGame');
      localStorage.removeItem('scores');
      localStorage.removeItem('currentTurn');
      window.location.href = 'index.html';
    }
  });
});
