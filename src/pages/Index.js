// The entire script content with updated functions

var itemsPerPageOptions = [55, 15, 30, 50, 200];
// Available globals
var domo = window.domo;
var datasets = window.datasets;
var myTable = document.getElementById('myTable'); // get "myTable" from the html tab

// var query = `/data/v1/${datasets[0]}?limit=1000`;
const myColumns = [
  "CartKey",
  "Location ID",
	"Order Key",
  "LocationGroup",
  "Scan Status",
  "ItemType",
  "Facility Name",
  "Location",
  "Item ID",
  "Item Description",
  "Item Location",
  "Set Lead Time",
  "Current Status",
  "UOM",
  "Qty",
  "Order Equals Par",
  "0",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "11",
  "12",
  "13",
  "14",
  "15",
  "16",
  "17",
  "18",
  "19",
  "20",
  "21",
  "22",
  "23",
  "24",
  "25",
  "26",
  "27",
  "28",
  "29",
  "30"
];
//const query = `/data/v1/${datasets[0]}?fields=${myColumns.join()}&orderby='Current Status',Location&limit=5000`;
// column needed for the hover and get added to myColumns
const detailColumns = myColumns.concat(["Item Description", "Facility Name", "Location", "LocationGroup", "Current Status", "Order Key", "Scan Status", "UOM", "ItemType"]);
//const query = `/data/v1/${datasets[0]}?limit=100`;
const query = `/data/v1/${datasets[0]}?fields=${detailColumns.toString()}&orderby='Current Status',CartKey,'Order Key'`;

domo
  .get(query)
  .then((result) => {
    const containerWidth = $('.table-container').width();
    const columnHeaders = getColumnHeaders(result);
    const colNames = columnHeaders.filter(column => column.title !== false);

    const filteredData = result.map(row => {
      const newRow = {};
      colNames.forEach(column => {
        newRow[column.data] = row[column.data];
      });
      return newRow;
    });

    const table = $('#myTable').DataTable({
      data: collapseDataTable(getDistinctValues(createTooltip(filteredData))),
      lengthMenu: itemsPerPageOptions,
      columns: colNames,
      searching: true,
      size: "small",
      ordering: false,
      fixedHeader: false,
      scrollY: true,
      scrollX: false,
      textwrap: true,
      scrollCollapse: true,
      columnDefs: [
        {targets: [0, 1, 2, 3, 4, 5], visible: false, searchable: true},
        {targets: [0,1,2,3,4, 5, 6, 7, 8, 9], responsive: true, width:"2.6%"},
        {targets: [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31,32], responsive: true, width: "2.35%"} 
      ],
      rowCallback: function (row, data) {
        Object.values(data).forEach((value, index) => {
          if (value && typeof value === "string" && !isNaN(value)) {
            data[index] = `<span class="disappear">${value}</span>`;
          }
        });
      }
    });

    // Function to adjust column widths
    function adjustColumnWidths() {
      const containerWidth = $('.table-container').width();
      const numColumns = table.columns().count();
      const newWidth = Math.floor(containerWidth / numColumns);

      table.columns().every(function (index) {
        $(table.column(index).header()).css('width', newWidth + 'px');
      });

      // Redraw the table to apply new widths
      table.columns.adjust().draw();
    }

    // Adjust column widths and fixed header on window resize
    $(window).resize(function () {
      adjustColumnWidths();
    });


    // Function to add a class to the first visible column and its header
    function updateFirstVisibleColumnAndHeader() {
      var firstVisibleColumnAdded = false;
      var firstVisibleColumnHeaderAdded = false;

      table.columns().every(function (index) {
        if (this.visible() && !firstVisibleColumnAdded) {
          $(table.column(index).nodes()).addClass('first-visible-column');
          firstVisibleColumnAdded = true;
        }

        if (this.visible() && !firstVisibleColumnHeaderAdded) {
          $(table.column(index).header()).addClass('first-visible-column-header');
          firstVisibleColumnHeaderAdded = true;
        }
      });
    }


    function getColumnHeaders(list) {
        var columns = [];
        for (var i = 0; i < list.length; i++) {
          var row = list[i];
          for (var k in row) {
            if ($.inArray(k, columns) == -1) {
              columns.push(k);
            } //closes if
          } //closes for loop
        } //closes first for loop

        var colArray = [];
        for (var j = 0; j < myColumns.length; j++) {
          for (var i = 0; i < columns.length; i++) {
            if (myColumns[j] === columns[i]) {
              var columnTitle = columns[i];
              if (!isNaN(columns[i])) {
                columnTitle = getColumnName(columns[i]);
              }
              colArray.push({
                data: columns[i],
                title: columnTitle,
              });
              break;
            }
          }
        }
        return colArray;
      }


    function collapseDataTable(data) {
        let newDataTable = [];
        let distinctKeyTable = {};

        for (const row of data) {
          const key = `${row['Order Key']}${row['CartKey']}`;

          if (!(key in distinctKeyTable)) {
            distinctKeyTable[key] = [row];
          } else {
            distinctKeyTable[key].push(row);
          }
        }

        for (const key in distinctKeyTable) {
          newDataTable.push(...distinctKeyTable[key]);
        }

        return newDataTable;
      }

      function getValueIndex(row) {
        for (const [key, value] of Object.entries(row)) {
          if (!isNaN(key) && value) return key;
        }	 // closes for loop
        return 0;
      }

      // Function to get distinct values
     function getDistinctValues(rows, dayColumn) {
      // Include the dynamic column name
      const dynamicColumnName = getColumnName(dayColumn);
      const distinctDataColumns = [
        'Item ID',
        'Item Location',
        'CartKey',
        'Location',
        'Qty',
      ];

      const groupedRows = rows.reduce((acc, row) => {
        const key = `${row['Item ID']}_${row['Item Location']}_${row['CartKey']}_${row['Location']}`;
        const group = acc[key] || { key, rows: [] };
        group.rows.push(row);
        acc[key] = group;
        return acc;
      }, {});

      return Object.values(groupedRows).flatMap(({ key, rows }) => {
        const collapsedRow = { ...rows[0] };

        for (let i = 1; i < rows.length; i++) {
          const row = rows[i];
          for (const columnIndex of distinctDataColumns) {
            if (row[columnIndex] !== rows[0][columnIndex]) {
              if (columnIndex === dynamicColumnName) {
                collapsedRow[`${columnIndex}_${getColumnName(dayColumn)}`] = `<div class="disappear">${row[columnIndex]}</div>`;
              } else {
                collapsedRow[`${columnIndex}_${i}`] = `<div class="disappear">${row[columnIndex]}</div>`;
              }
            }
          }
        }

        return collapsedRow;
      });
    }

      function createTooltip(rows) {
        const dayColumns = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30"];

        for (let i = 0; i < rows.length; i++) {
          for (let dayColumn of dayColumns) {
            let cellContent = rows[i][dayColumn];
            let cellClass = '';
            let tooltipContent = '';

            if (cellContent === null or cellContent === '') {
              cellClass = 'no-scan';
              tooltipContent = `<span class="tooltiptext">No Scan</br></br></br>Item Type: ${rows[i]['ItemType']}</span>`;
            } else {
              cellClass = 'hot-scan';
              switch (rows[i]['Scan Status']) {
                case 'Stock Out':
                  cellClass = 'stock-out';
                  break;
                case 'Hot Scan':
                  cellClass = 'hot-scan';
                  break;
                case 'Healthy Scan':
                  cellClass = 'healthy';
                  break;
                default:
                  cellClass = 'no-scan';
                  break;
              }

              if (cellClass !== 'no-scan') {
                tooltipContent = `<span class="tooltiptext">
                                ${rows[i]['Scan Status']}</br>
                                </br>
                                OrderDate: ${getColumnName(dayColumn)}</br>
                                Order: ${cellContent} ${rows[i]['UOM']}</br>
                                Req/Line#: ${rows[i]['Order Key']}</br>
                                Item Type: ${rows[i]['ItemType']}</br>
                              </span>`;
              }
            }

            let newCSS = `<div class="tooltip ${cellClass}">${cellContent || ''}${tooltipContent}</div>`;
            rows[i][dayColumn] = newCSS;
          }
        }
        return rows;
      }

      // rename columns 0-30 based days back from the current date
      function getColumnName(columnName) {
        let col_name = false; // Set default to false
        // let maxDate = new Date();
        // maxDate.setDate(maxDate.getDate());

        if (!isNaN(columnName)) {
          const value = new Date().setDate(new Date().getDate() - +columnName);
          const dateValue = new Date(value);

          if (dateValue) {
            const day = dateValue.getDate();
            const month = dateValue.getMonth() + 1;
            col_name = month + '/' + day;
          }
        } else {
          col_name = columnName;
        }
        return col_name;
     }
})
$(window).resize(adjustColumnWidths);
