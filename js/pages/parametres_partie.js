// Script spécifique à la page parametres_partie

document.addEventListener('DOMContentLoaded', () => {
  const minPlayers = 1, maxPlayers = 10;
  let nbr = minPlayers;
  const nbrDisplay = document.getElementById('nbr-players');
  const namesContainer = document.getElementById('players-names');

  function updateNameFields() {
    const old = {};
    namesContainer.querySelectorAll('input').forEach(i => old[i.id] = i.value);
    namesContainer.innerHTML = '';
    for (let i = 1; i <= nbr; i++) {
      const div = document.createElement('div');
      div.className = 'info-player';
      div.innerHTML = `
        <label for="player-${i}">Joueur ${i} :</label>
        <input type="text" id="player-${i}" placeholder="Nom du joueur ${i}" required>
      `;
      const inp = div.querySelector('input');
      if (old[inp.id]) inp.value = old[inp.id];
      namesContainer.appendChild(div);
    }
  }

  document.getElementById('incr-player').addEventListener('click', () => {
    if (nbr < maxPlayers) {
      nbr++;
      nbrDisplay.textContent = nbr;
      updateNameFields();
    }
  });

  document.getElementById('decr-player').addEventListener('click', () => {
    if (nbr > minPlayers) {
      nbr--;
      nbrDisplay.textContent = nbr;
      updateNameFields();
    }
  });

  document.getElementById('start-game').addEventListener('click', () => {
    const names = Array.from(namesContainer.querySelectorAll('input')).map(i => i.value.trim());
    if (names.some(n => !n)) {
      alertManager.show({
        message: "Veuillez renseigner le nom de tous les Players.",
        confirmText: "OK"
      });
      return;
    }

    localStorage.setItem('currentGame', JSON.stringify({ players: names }));
    window.location.href = 'saisie_scores.html';
  });

  nbrDisplay.textContent = nbr;
  updateNameFields();
});
