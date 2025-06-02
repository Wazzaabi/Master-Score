// Désactive “Reprendre” si pas de partie en cours
document.addEventListener('DOMContentLoaded', () => {
  const cont = document.getElementById('reprendre-container');
  if (!localStorage.getItem('currentGame')) {
    cont.classList.add('disabled');
  } else {
    cont.classList.remove('disabled');
  }
});
