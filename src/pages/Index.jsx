import React from "react";

const Index = () => {
  // ... existing Index component code, ensure to include collapseDataTable function within

  function collapseDataTable(data) {
    const newDataTable = [];
    const groupedData = {};

    data.forEach((row) => {
      const key = `${row["CartKey"]}_${row["Location"]}_${row["Qty"]}`;
      if (!groupedData[key]) {
        groupedData[key] = { ...row, combinedRows: 1 };
      } else {
        if (groupedData[key]["Qty"] === row["Qty"]) {
          groupedData[key].combinedRows += 1;
        } else {
          if (groupedData[key].combinedRows > 1) {
            newDataTable.push({ ...groupedData[key], combinedRows: undefined });
          }
          groupedData[key] = { ...row, combinedRows: 1 };
        }
      }
    });

    Object.values(groupedData).forEach((group) => {
      if (group.combinedRows > 1 || newDataTable.findIndex((x) => x["CartKey"] === group["CartKey"] && x["Location"] === group["Location"] && x["Qty"] === group["Qty"]) === -1) {
        newDataTable.push({ ...group, combinedRows: undefined });
      }
    });

    newDataTable.sort((a, b) => {
      const cartKeyComparison = a["CartKey"].localeCompare(b["CartKey"]);
      if (cartKeyComparison !== 0) return cartKeyComparison;
      return a["Location"].localeCompare(b["Location"]);
    });

    return newDataTable;
  }

  return <div>{/* The rest of your component's rendering logic will go here */}</div>;
};

export default Index;
