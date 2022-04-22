function buildStatsTable(incomingData) {
  let statsTableBody = document.getElementById("stats-table-body");
  // empty the current table:
  statsTableBody.replaceChildren();
  // add new data:
  for (let i=0; i < incomingData.length; i++) {
    let row = document.createElement("tr");
    for (let k of ["id", "book", "alignments","ch_match"]) {
      let cell = document.createElement("td");
      if (k === "ch_match") {
        cell.innerText = incomingData[i][k];
      } else {
        cell.innerText = incomingData[i][k];
      }
      row.appendChild(cell);
    }
    statsTableBody.appendChild(row);
  }

  return statsTableBody;
}
