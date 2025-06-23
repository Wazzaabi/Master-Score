function savePartie(data) {
  localStorage.setItem("partie_en_cours", JSON.stringify(data));
}

function loadPartie() {
  return JSON.parse(localStorage.getItem("partie_en_cours") || "null");
}

function clearPartie() {
  localStorage.removeItem("partie_en_cours");
}