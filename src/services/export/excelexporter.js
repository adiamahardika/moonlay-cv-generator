import { saveAs } from 'file-saver';

export const saveAsExcelFile = (buffer, fileName) => {
  const data = new Blob([buffer], { type: 'application/octet-stream' });
  saveAs(data, fileName);
};

export const exportToExcel = async (rows, columns, fileName) => {
  if (!rows || rows.length === 0) {
    alert('Please select rows to export.'); // Notify the user if no rows are selected
    return;
  }

  try {
    // Dynamically import xlsx
    const xlsx = await import('xlsx');

    // Reorder rows to match the column order defined in `columns`
    const reorderedData = rows.map((row) =>
      columns.reduce((acc, col) => {
        acc[col.header] = row[col.field]; // Use the column header as the key in the Excel file
        return acc;
      }, {})
    );

    // Create the worksheet
    const worksheet = xlsx.utils.json_to_sheet(reorderedData);

    // Set column widths
    const columnWidths = columns.map((col) => ({
      wch: Math.max(col.header.length, 15) // Minimum width of 15 or header length
    }));
    worksheet['!cols'] = columnWidths;

    // Create the workbook
    const workbook = { Sheets: { data: worksheet }, SheetNames: ['data'] };

    // Write the Excel file to a buffer
    const excelBuffer = xlsx.write(workbook, {
      bookType: 'xlsx',
      type: 'array'
    });

    // Save the Excel file
    saveAsExcelFile(excelBuffer, fileName);
  } catch (error) {
    console.error('Error exporting Excel:', error);
    alert('An error occurred while exporting to Excel. Please try again.');
  }
};
