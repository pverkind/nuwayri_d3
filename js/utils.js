function sortColumn (index, direction="asc") {
  //https://htmldom.dev/sort-a-table-by-clicking-its-headers/
  let tableBody = event.target.parentNode.parentNode.nextElementSibling;
  console.log(tableBody);
  let rows = tableBody.querySelectorAll('tr');
  console.log("index: "+index);

  // Clone the rows
  const newRows = Array.from(rows);

  const multiplier = (direction === 'asc') ? 1 : -1;
  let transform = (x) => parseInt(x)
  if (isNaN(newRows[0].querySelectorAll('td')[index].innerHTML)){
    transform = (x) => x;
  }

  // Sort rows by the content of cells
  newRows.sort(function (rowA, rowB) {
      // Get the content of cells
      const cellA = transform(rowA.querySelectorAll('td')[index].innerHTML);
      const cellB = transform(rowB.querySelectorAll('td')[index].innerHTML);
      switch (true) {
          case cellA > cellB:
              return 1 * multiplier;
          case cellA < cellB:
              return -1 * multiplier;
          case cellA === cellB:
              return 0;
      }
  });
  if (newRows[0] == Array.from(rows)[0]){
    return sortColumn (index, direction="desc")
  }

  // Remove old rows
  [].forEach.call(rows, function (row) {
      tableBody.removeChild(row);
  });

  // Append new row
  newRows.forEach(function (newRow) {
      tableBody.appendChild(newRow);
  });
};
