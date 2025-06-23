// Script spécifique à la page tableau_scores

// tableau_scores.js (nettoyé)

const scores = JSON.parse(localStorage.getItem('scores')) || [];
const numPlayers = scores[0]?.length || 0;

window.addEventListener('DOMContentLoaded', () => {
  const headerRow = document.getElementById("headerRow");
  const tableBody = document.getElementById("tableBody");
  const totalRow  = document.getElementById("totalRow");

  for (let i = 0; i < numPlayers; i++) {
    const th = document.createElement("th");
    th.textContent = `${name} ${i+1}`;
    headerRow.appendChild(th);

    const td = document.createElement("td");
    td.id = `total-${i}`;
    totalRow.appendChild(td);
  }

  const totals = Array(numPlayers).fill(0);
  scores.forEach((tour, idx) => {
    const tr = document.createElement("tr");
    const tdTour = document.createElement("td");
    tdTour.textContent = `Tour ${idx+1}`;
    tr.appendChild(tdTour);

    tour.forEach((s, i) => {
      const td = document.createElement("td");
      td.textContent = s;
      totals[i] += s;
      tr.appendChild(td);
    });

    tableBody.appendChild(tr);
  });

  totals.forEach((sum, i) => {
    document.getElementById(`total-${i}`).textContent = sum;
  });
});
