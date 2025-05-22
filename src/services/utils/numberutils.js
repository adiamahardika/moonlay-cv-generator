// Format a number with thousands separator (for display)
export const formatNumber = (num) => {
  const parsedNum = parseFloat(num) || 0; // Ensure it's a valid number
  return new Intl.NumberFormat('de-DE').format(parsedNum);
};

// Calculate line total after discount
export const calculateLineTotal = (total, discount) => {
  const totalValue = parseFloat(total) || 0;
  const discountValue = Math.max(0, Math.min(parseFloat(discount) || 0, 100));
  return totalValue * (1 - discountValue / 100);
};

// Calculate various totals: subtotal, VAT, management fee, grand total
export const calculateTotals = (expenseList) => {
  const newSubtotal = expenseList.reduce((acc, expense) => acc + calculateLineTotal(expense.expense_total, expense.expense_discount), 0);

  if (!isNaN(newSubtotal)) {
    const newVat = newSubtotal * 0.11;
    const newManagementFee = newSubtotal * 0.05;
    const newGrandTotal = newSubtotal + newVat + newManagementFee;

    // Return the calculated values
    return {
      newSubtotal,
      newVat,
      newManagementFee,
      newGrandTotal
    };
  }
  return {
    newSubtotal: 0,
    newVat: 0,
    newManagementFee: 0,
    newGrandTotal: 0
  };
};

// Format the expense list with formatted numbers and calculated line totals
export const formatExpenseList = (expenseList, formatNumber, calculateLineTotal) =>
  expenseList.map((expense) => ({
    ...expense,
    expense_total: formatNumber(expense.expense_total).toString(),
    expense_linecount: formatNumber(calculateLineTotal(expense.expense_total, expense.expense_discount)).toString()
  }));

// Construct paths for various resources
export const constructPaths = (baseUrl, pdfUrl, xlsxUrl) => ({
  pdfPath: `${baseUrl}/download/pdf/${pdfUrl}`,
  xlsxPath: `${baseUrl}/download/xlsx/${xlsxUrl}`,
  embedPdfPath: `${baseUrl}/embed/pdf/${pdfUrl}`
});
