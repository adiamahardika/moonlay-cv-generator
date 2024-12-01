import React, { useEffect, useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { IconField } from 'primereact/iconfield';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { Dialog } from 'primereact/dialog';
import { Calendar } from 'primereact/calendar';
import 'primereact/resources/themes/lara-light-cyan/theme.css';
import '../css/quotation_dashboard.css';
import axios from 'axios';
import { ProgressSpinner } from 'primereact/progressspinner';
import { format } from 'date-fns';
import CurrencyInput from 'react-currency-input-field';
import ActionDropdown from 'components/quotation_components/actiondropdown/actiondropdown';
import QuotationTypeFilter from 'components/quotation_components/quotationfilter/quotationtypefilter';
import { exportToExcel } from 'services/export/excelexporter';
import { fetchQuotationData, createQuotation, deleteQuotations, updateQuotation } from 'services/backend/quotationservice';
import { constructPaths } from 'services/utils/numberutils';
import { createPaginatorTemplate } from 'components/datatable_components/datatable_paginator';



export default function MoonlayQuotation() {
  // sorry

  // State for Quotation and Dialog Data
  const [data, setData] = useState([]);
  const [quotationData, setQuotationData] = useState({
    quotation_type: 'VMS',
    quotation_solution: '',
    quotation_code: '',
    quotation_pic: '',
    quotation_pt: '',
    quotation_customer: '',
    quotation_customeraddress: '',
    quotation_subtotal: '',
    quotation_managementfee: '0',
    quotation_ppn: '',
    quotation_grandtotal: '',
    quotation_createdate: '',
    quotation_validdate: '',
    quotation_email: ''
  });
  const [expenseList, setExpenseList] = useState([
    { expense_description: '', expense_total: '', expense_discount: '0', expense_linecount: '' }
  ]);
  const [tosList, setTosList] = useState([{ tos_description: '' }]);
  const [quotationNo, setQuotationNo] = useState(0);

  const [currencyType, setCurrencyType] = useState('IDR'); // Default value is SGD
  // State for Totals Calculation
  const [subtotal, setSubtotal] = useState('');
  const [vat, setVat] = useState('');
  const [grandtotal, setGrandtotal] = useState('');
  const [managementFee, setManagementFee] = useState('');

  // State for UI Controls
  const [expandedRows, setExpandedRows] = useState(null);
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [totalRecords, setTotalRecords] = useState(0);
  const [globalFilter, setGlobalFilter] = useState('');
  const [selectedRows, setSelectedRows] = useState([]); // Change from 'any' to an empty array
  const [rowsPerPage, setRowsPerPage] = useState(10); // Default
  const [first, setFirst] = useState(0); // Position of the paginator
  const [isDialogVisible, setIsDialogVisible] = useState(false);
  const [isEditDialogVisible, setIsEditDialogVisible] = useState(false);
  const [dialogStatus, setDialogStatus] = useState('default');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [showDialogDelete, setShowDialogDelete] = useState(false);
  const [deletionSuccessful, setDeletionSuccessful] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null); // Updated to null for JS
  const [xlsxUrl, setXlsxUrl] = useState(null); // Updated to null for JS
  const [embedPdfUrl, setEmbedPdfUrl] = useState(null); // Updated to null for JS
  const [vatPercentage, setVatPercentage] = useState(11); // Default to 11%

  const rowClass = () => 'custom-row'; // Define a class for row height

  const apiBase = import.meta.env.VITE_API_BASE;

  const quotationTypeOptions = [
    { label: 'BR', value: 'BR' },
    { label: 'VMS', value: 'VMS' },
    { label: 'PR', value: 'PR' }
  ];

   const currencyOptions = [
     { label: 'Singapore Dollar (SGD)', value: 'SGD' },
     { label: 'Indonesian Rupiah (IDR)', value: 'IDR' },
     { label: 'US Dollar (USD)', value: 'USD' }
   ];

  const cols = [
    {
      field: 'quotation_no',
      header: 'No'
    },
    {
      field: 'quotation_type',
      header: 'Solution'
    },
    {
      field: 'quotation_code',
      header: 'Quote Number'
    },
    { field: 'quotation_pt', header: 'PT' },
    {
      field: 'quotation_customer',
      header: 'Customer Name'
    },
    { field: 'quotation_customeraddress', header: 'Customer Address' },
    {
      field: 'quotation_solution',
      header: 'Quotation Description'
    },
    {
      field: 'quotation_subtotal',
      header: 'Subtotal'
    },
    {
      field: 'quotation_managementfee',
      header: 'Management Fee'
    },
    {
      field: 'quotation_ppn',
      header: 'PPN'
    },
    {
      field: 'quotation_grandtotal',
      header: 'Grandtotal'
    }
  ];

  // === Event Handlers for Dialog Control and Form Reset ===

  /* #region  */
  const handleDialogOpen = () => setIsDialogVisible(true);

  const handleDialogClose = () => {
    resetForm();
    setIsDialogVisible(false);
    setIsEditDialogVisible(false);
    setDialogStatus('default');
  };

  const resetForm = () => {
    setQuotationData({
      quotation_type: 'VMS',
      quotation_code: '',
      quotation_createdate: '',
      quotation_validdate: '',
      quotation_customer: '',
      quotation_customeraddress: '',
      quotation_solution: '',
      quotation_pic: '',
      quotation_pt: '',
      quotation_subtotal: '',
      quotation_managementfee: '0',
      quotation_ppn: '',
      quotation_grandtotal: '',
      quotation_email: ''
    });
    setExpenseList([{ expense_description: '', expense_total: '', expense_discount: '0', expense_linecount: '' }]);
    setTosList([{ tos_description: '' }]);
  };

  const handleDeleteClick = () => {
    if (Array.isArray(selectedRows) && selectedRows.length > 0) {
      setShowDialogDelete(true);
    } else {
      alert('Please select rows to delete.');
    }
  };
  /* #endregion */

  // === Utility Functions ===

  /* #region  */

  const formatNumber = (num) => {
    const parsedNum = parseFloat(num) || 0; // Ensure it's a valid number
    return new Intl.NumberFormat('de-DE').format(num);
  };

  const calculateLineTotal = (total, discount) => {
    const totalValue = parseFloat(total) || 0;
    const discountValue = Math.max(0, Math.min(parseFloat(discount) || 0, 100));
    return totalValue * (1 - discountValue / 100);
  };

  // === Calculate Totals Function ===
  const calculateTotals = () => {
    const vatRate = vatPercentage / 100 || 0; // Safely parse VAT rate, default to 0 if invalid

    const newSubtotal = expenseList.reduce((acc, expense) => acc + calculateLineTotal(expense.expense_total, expense.expense_discount), 0);

    if (!isNaN(newSubtotal) && !isNaN(vatRate)) {
      const newVat = newSubtotal * vatRate;
      const newManagementFee = newSubtotal * 0.05;
      const newGrandTotal = newSubtotal + newVat + newManagementFee;

      setSubtotal(formatNumber(newSubtotal));
      setVat(formatNumber(newVat));
      setManagementFee(formatNumber(newManagementFee));
      setGrandtotal(formatNumber(newGrandTotal));
    }
  };

  // === UseEffect Hook ===
  useEffect(() => {
    calculateTotals();
  }, [expenseList, vatPercentage]); // Trigger recalculations whenever dependencies change

  // === Handle Expense Change ===
  const handleExpenseChange = (index, field, e) => {
    const updatedExpenseList = [...expenseList];
    updatedExpenseList[index][field] = e.target.value;
    setExpenseList(updatedExpenseList);
  };
  /* #endregion */

  // === Form Input Handlers ===

  /* #region  */

const handleCurrencyChange = (e) => {
      setCurrencyType(e.value);
};


  const handleTOSChange = (index, e) => {
    const updatedTosList = [...tosList];
    updatedTosList[index].tos_description = e.target.value;
    setTosList(updatedTosList);
  };

  const formatDate = (date) => format(date, 'yyyy-MM-dd');

  const handleCreatedDateChange = (e) => {
    // Format the date if necessary
    const formattedDate = formatDate(e.value);
    setQuotationData((prevData) => ({
      ...prevData,
      quotation_createdate: formattedDate // Store as formatted date string
    }));
  };

  const handleValidDateChange = (e) => {
    const formattedDate = formatDate(e.value);
    setQuotationData((prevData) => ({
      ...prevData,
      quotation_validdate: formattedDate // Store as formatted date string
    }));
  };

  const confirmDelete = async () => {
    const idToDelete = selectedRows.map((row) => row.quotation_no);
    setLoading(true); // Start loading

    try {
      await deleteQuotations(idToDelete); // Call the service to delete quotations

      setDeletionSuccessful(true); // Set deletion success state

      //@ts-ignore
      setData((prevData) => prevData.filter((row) => !idToDelete.includes(row.quotation_no))); // Update the data to exclude deleted rows

      setSelectedRows(null); // Clear selected rows
    } catch (error) {
      alert('Error deleting records. Please try again.');
    } finally {
      setLoading(false); // End loading
    }
  };

  /* #endregion */
  // Fetching Data from API

  // === Backend Functions ===

  /* #region  */

  useEffect(() => {
    console.log('Sending GET request to fetch quotations...');
    axios
      .get(`${apiBase}/quotations`)
      .then((response) => {
        console.log('Received data:', response.data); // Log the data received from the backend
        setData(response.data.quotations); // Set the updated quotations data
        setTotalRecords(response.data.quotations.length); // Update the total records count
      })
      .catch((error) => console.error('Error fetching quotations:', error));
  }, [refreshTrigger]); // Depend on refreshTrigger to refetch the data when it changes

  const handleSubmit = async () => {
    setDialogStatus('loading');

    // Format the expense list for submission
    const formattedExpenseList = expenseList.map((expense) => ({
      ...expense,
      expense_total: formatNumber(expense.expense_total).toString(),
      expense_linecount: formatNumber(calculateLineTotal(expense.expense_total, expense.expense_discount)).toString()
    }));

    const requestData = {
      ...quotationData,
      quotation_subtotal: subtotal.toString(),
      quotation_managementfee: managementFee.toString(),
      quotation_ppn: vat.toString(),
      quotation_grandtotal: grandtotal.toString(),
      vat_rate: vatPercentage, // Include VAT rate
      expenses: formattedExpenseList,
      terms_and_conditions: tosList,
      currency_type: currencyType
    };

    try {
      const response = await createQuotation(requestData);

      console.log('Response:', response);

      if (response.pdfUrl && response.xlsxUrl) {
        const pdfPath = `${apiBase}/download/pdf/${response.pdfUrl}`;
        const docxPath = `${apiBase}/download/xlsx/${response.xlsxUrl}`;
        const embedPdfPath = `${apiBase}/embed/pdf/${response.pdfUrl}`;

        setPdfUrl(pdfPath);
        setXlsxUrl(docxPath);
        setEmbedPdfUrl(embedPdfPath);
        setDialogStatus('success');
        setRefreshTrigger((prev) => prev + 1);
      } else {
        alert('Failed to generate PDF/Excel.');
        setDialogStatus('error');
      }
    } catch (error) {
      setDialogStatus('error');
    }
  };

  const handleUpdateQuotation = async () => {
    setDialogStatus('loading');

    const formattedExpenseList = expenseList.map((expense) => ({
      ...expense,
      expense_total: formatNumber(expense.expense_total).toString(),
      expense_linecount: formatNumber(calculateLineTotal(expense.expense_total, expense.expense_discount)).toString()
    }));

    const requestData = {
      ...quotationData,
      quotation_subtotal: subtotal.toString(),
      quotation_managementfee: managementFee.toString(),
      quotation_ppn: vat.toString(),
      quotation_grandtotal: grandtotal.toString(),
      vat_rate: vatPercentage, // Include VAT rate
      expenses: formattedExpenseList,
      terms_and_conditions: tosList,
      quotation_no: quotationNo,
      currency_type: currencyType
    };

    try {
      console.log(quotationNo);

      const responseData = await updateQuotation(`${apiBase}/update_quotation`, requestData);
      console.log('Response:', responseData);

      if (responseData.pdfUrl && responseData.xlsxUrl) {
        const paths = constructPaths(`${apiBase}`, responseData.pdfUrl, responseData.xlsxUrl);

        setPdfUrl(paths.pdfPath);
        setXlsxUrl(paths.xlsxPath);
        setEmbedPdfUrl(paths.embedPdfPath);

        setLoading(false);
      } else {
        alert('Failed to generate quotation.');
        setLoading(false);
      }

      setDialogStatus('success');
      setRefreshTrigger((prev) => prev + 1);
    } catch (error) {
      alert('An error occurred while updating the quotation.');
      setLoading(false);
      setDialogStatus('error');
    }
  };

  const handleEditQuotation = async (rowData) => {
    setDialogStatus('loading');
    setIsEditDialogVisible(true);
    setQuotationNo(rowData);

    try {
      const { quotationData, expenseList, tosList } = await fetchQuotationData(rowData);

      // Update state with fetched data
      setQuotationData(quotationData);
      setExpenseList(expenseList);
      setTosList(tosList);

      setDialogStatus('default');
    } catch (error) {
      setDialogStatus('error');
    }
  };

  const exportExcel = () => {
    const fileName = 'Quotation_Datasheet.xlsx';
    exportToExcel(selectedRows, cols, fileName);
  };

  /* #endregion */

  // === UI Components and Templates ===

  /* #region  */
  const actionBodyTemplate = (rowData) => {
    return <ActionDropdown rowData={rowData} onEditQuotation={(quotationNo) => handleEditQuotation(quotationNo)} />;
  };

  const handleViewDetails = (rowData) => {
    console.log('View Details:', rowData);
  };

  const quotationTypeFilterTemplate = (options) => {
    return <QuotationTypeFilter value={options.value} onFilterApply={(value) => options.filterApplyCallback(value)} />;
  };

  const rowExpansionTemplate = (data) => (
    <div className="p-3" style={{ background: '#f9f9f9', padding: '10px 20px', width: '100%' }}>
      <DataTable
        value={data.expenses}
        size="small"
        dataKey="quotation_no"
        rows={5}
        emptyMessage="No expenses available"
        scrollable
        scrollHeight="200px"
        style={{ width: '1100px', zIndex: '0' }}
      >
        <Column field="expense_description" header="Expense Description" style={{ width: '200px' }} frozen />
        <Column field="expense_total" header="Total" style={{ width: '120px' }} frozen />
        <Column field="expense_discount" header="Discount" style={{ width: '120px' }} frozen />
        <Column field="expense_linecount" header="Line Count" style={{ width: '120px' }} frozen />
      </DataTable>
    </div>
  );

  const header = (
    <div className="flex justify-content-between align-items-start">
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
          <h2 style={{ margin: 0 }}>Quotation Datasheet Table</h2>
          <span style={{ fontSize: '12px' }}>
            Show {data.length} of {data.length} Results
          </span>
        </div>

        <IconField iconPosition="left">
          <InputText
            placeholder="Keyword Search"
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)} // Update the global filter state
            className={isSmallScreen ? 'hide' : ''}
          />
        </IconField>
        <button className="default-btn delete-btn" onClick={handleDeleteClick}>
          Delete
          <i className="fa-solid fa-trash"></i>
        </button>
        <button className="default-btn export-btn" onClick={exportExcel}>
          Export
          <i className="fa-solid fa-download"></i>
        </button>

        <button className="default-btn add-btn" onClick={handleDialogOpen}>
          Add
          <i className="fa-solid fa-download"></i>
        </button>
      </div>
    </div>
  );

  const paginatorTemplate = createPaginatorTemplate({
    rowsPerPage,
    setRowsPerPage,
    setFirst,
    totalRecords,
    setRefreshTrigger
  });

  /* #endregion */

  return (
    <div className="card" style={{ overflowX: 'hidden', width: '80vw', margin: 'auto', minHeight: '80vh' }}>
      <DataTable
        value={data}
        paginator
        rows={rowsPerPage}
        rowsPerPageOptions={[5, 10, 25, 50]}
        first={first}
        scrollable
        size="normal"
        scrollHeight="650px"
        header={header}
        emptyMessage="Loading Records."
        onPage={(e) => {
          setFirst(e.first);
          setRowsPerPage(e.rows);
        }}
        paginatorClassName="custom-paginator"
        selection={selectedRows}
        selectionMode="checkbox"
        onSelectionChange={(e) => setSelectedRows(e.value)}
        dataKey="quotation_no" // Adjusted dataKey
        removableSort
        globalFilter={globalFilter}
        globalFilterFields={[
          'quotation_no',
          'quotation_solution',
          'quotation_pic',
          'quotation_company',
          'quotation_customeraddress',
          'quotation_customername',
          'quotation_description'
        ]}
        filterDisplay="row"
        filterClearIcon
        paginatorTemplate={paginatorTemplate}
        //@ts-ignore
        expandedRows={expandedRows} // Pass expandedRows state
        //@ts-ignore
        onRowToggle={(e) => setExpandedRows(e.data)}
        rowClassName={rowClass}
        rowExpansionTemplate={rowExpansionTemplate}
        style={{ height: '100%', paddingBottom: '5px', overflow: 'hidden' }}
      >
        <Column expander style={{ width: '50px', textAlign: 'center' }} />
        <Column selectionMode="multiple" headerStyle={{ textAlign: 'center', width: '60px' }} bodyStyle={{ textAlign: 'center' }} />
        <Column field="quotation_no" header="No" sortable style={{ minWidth: '200px' }} />
        <Column
          field="quotation_type"
          header="Solution"
          style={{ minWidth: '200px' }}
          filter
          filterElement={quotationTypeFilterTemplate}
          showFilterMenu={false} // Disable default filter menu
          filterMatchMode="equals"
        />
        <Column field="quotation_pic" header="PIC" sortable style={{ minWidth: '200px' }} />
        <Column field="quotation_code" header="Quote Number" sortable style={{ minWidth: '200px' }} frozen />
        <Column field="quotation_pt" header="PT Customer" sortable style={{ minWidth: '200px' }} />
        <Column field="quotation_customer" header="Customer Name" sortable style={{ minWidth: '200px' }} />
        <Column field="quotation_customeraddress" header="Customer Address" sortable style={{ minWidth: '200px' }} />
        <Column field="quotation_solution" header="Quotation Description" sortable style={{ minWidth: '400px' }} />
        <Column field="quotation_subtotal" header="Subtotal" sortable style={{ minWidth: '200px' }} />
        <Column field="quotation_managementfee" header="Management Fee" sortable style={{ minWidth: '200px' }} />
        <Column field="quotation_ppn" header="PPN" sortable style={{ minWidth: '200px' }} />
        <Column field="quotation_grandtotal" header="Grand Total" sortable style={{ minWidth: '200px' }} />
        <Column header="Actions" body={actionBodyTemplate} style={{ minWidth: '100px', textAlign: 'center' }} />
      </DataTable>
      {/* Dialog for Adding Quotation */}

      <Dialog
        header={
          dialogStatus === 'loading' || dialogStatus === 'success' || dialogStatus === 'error' ? null : (
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginRight: '40px',
                zIndex: '9999'
              }}
            >
              <h5>Add Quotation</h5>
              <Dropdown
                value={quotationData.quotation_type}
                options={quotationTypeOptions}
                onChange={(e) => setQuotationData({ ...quotationData, quotation_type: e.value })}
                style={{ width: '120px' }}
                placeholder="Select Type"
              />
              <Button label="Save Quotation" icon="pi pi-check" className="p-button-success" onClick={handleSubmit} />
            </div>
          )
        }
        visible={isDialogVisible}
        style={{ width: '90vw', height: '100vh' }}
        onHide={handleDialogClose}
      >
        {dialogStatus === 'loading' ? (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              width: '100%',
              height: '100%'
            }}
          >
            <ProgressSpinner />
          </div>
        ) : dialogStatus === 'success' ? (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              flexDirection: 'column',
              height: '100%'
            }}
          >
            {/* PDF Preview and Download Buttons */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                marginTop: '20px'
              }}
            >
              <p>Your Quotation has been generated. You can download it below:</p>
              {/* Display PDF preview */}
              <iframe
                src={`${embedPdfUrl}#toolbar=0`}
                style={{ width: '45vw', height: '60vh', border: 'none' }}
                title="PDF Preview"
              ></iframe>

              {/* Dropdown for Download Options and Close Button */}
              <div style={{ marginTop: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Dropdown
                  options={[
                    { label: 'Download PDF', value: pdfUrl },
                    { label: 'Download Excel', value: xlsxUrl }
                  ]}
                  onChange={(e) => window.open(e.value, '_blank')} // Open the selected file in a new tab
                  placeholder="Select File to Download"
                  style={{ width: '200px' }}
                />

                {/* Close Button */}
                <Button
                  label="Close"
                  icon="pi pi-times"
                  className="p-button-danger"
                  onClick={handleDialogClose}
                  style={{ marginLeft: '10px' }}
                />
              </div>
            </div>
          </div>
        ) : dialogStatus === 'error' ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              height: '100%',
              justifyContent: 'center'
            }}
          >
            <i className="pi pi-times-circle" style={{ fontSize: '2em', color: '#d9534f' }}></i>
            <h5>Error Saving Quotation</h5>
            <p>Something went wrong. Please try again later.</p>
            <Button
              label="Close"
              icon="pi pi-times"
              className="p-button-danger"
              onClick={handleDialogClose}
              style={{ marginTop: '10px' }}
            />
          </div>
        ) : (
          <div className="p-fluid formgrid grid" style={{ display: 'flex', gap: '20px', paddingBottom: '450px' }}>
            {/* Left Section */}
            <div
              className="left-section"
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                minHeight: '500px',
                maxHeight: '100vh'
              }}
            >
              {/* Time Details */}
              <div className="time-details form-components">
                <h5>Time Details</h5>
                <div className="field">
                  <label htmlFor="quotation_createdate">Create Date</label>
                  <Calendar
                    id="quotation_createdate"
                    value={quotationData.quotation_createdate ? new Date(quotationData.quotation_createdate) : null} // Ensure it's a Date object
                    onChange={handleCreatedDateChange}
                    dateFormat="yy-mm-dd"
                    showIcon
                    style={{ width: '80%' }}
                    required
                  />
                </div>
                <div className="field">
                  <label htmlFor="quotation_validdate">Valid Date</label>
                  <Calendar
                    id="quotation_validdate"
                    value={quotationData.quotation_validdate ? new Date(quotationData.quotation_validdate) : null} // Ensure it's a Date object
                    onChange={handleValidDateChange}
                    dateFormat="yy-mm-dd"
                    showIcon
                    style={{ width: '80%' }}
                    required
                  />
                </div>
              </div>

              {/* Customer Details */}
              <div className="customer-details form-components">
                <h5>Customer Details</h5>
                <div className="field">
                  <label htmlFor="quotation_customer">Customer Name</label>
                  <InputText
                    id="quotation_customer"
                    value={quotationData.quotation_customer}
                    onChange={(e) => setQuotationData({ ...quotationData, quotation_customer: e.target.value })}
                    style={{ width: '80%' }}
                    required
                  />
                </div>
                <div className="field">
                  <label htmlFor="quotation_pt">PT</label>
                  <InputText
                    id="quotation_pt"
                    value={quotationData.quotation_pt}
                    onChange={(e) => setQuotationData({ ...quotationData, quotation_pt: e.target.value })}
                    style={{ width: '80%' }}
                    required
                  />
                </div>
                <div className="field">
                  <label htmlFor="quotation_customeraddress">Customer Address</label>
                  <InputText
                    id="quotation_customeraddress"
                    value={quotationData.quotation_customeraddress}
                    onChange={(e) =>
                      setQuotationData({
                        ...quotationData,
                        quotation_customeraddress: e.target.value
                      })
                    }
                    style={{ width: '80%' }}
                    required
                  />
                </div>
                <div className="field">
                  <label htmlFor="quotation_email">Customer Email</label>
                  <InputText
                    id="quotation_email"
                    value={quotationData.quotation_email}
                    onChange={(e) => setQuotationData({ ...quotationData, quotation_email: e.target.value })}
                    style={{ width: '80%' }}
                    required
                  />
                </div>
              </div>

              {/* Product/Quote Description */}
              <div className="quote-description form-components">
                <h5>Product/Quote Description</h5>
                <div className="field">
                  <label htmlFor="quotation_solution">Description</label>
                  <InputText
                    id="quotation_solution"
                    value={quotationData.quotation_solution}
                    onChange={(e) => setQuotationData({ ...quotationData, quotation_solution: e.target.value })}
                    style={{ width: '80%' }}
                    required
                  />
                </div>
              </div>

              <div className="user-area form-components">
                <h5>User Area</h5>
                <div className="field">
                  <label htmlFor="quotation_pic">PIC Name</label>
                  <InputText
                    id="quotation_pic"
                    value={quotationData.quotation_pic}
                    onChange={(e) => setQuotationData({ ...quotationData, quotation_pic: e.target.value })}
                    style={{ width: '80%' }}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Right Section */}
            <div
              className="right-section"
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                minHeight: '500px',
                maxHeight: '100vh'
              }}
            >
              <div className="items-expenses form-components">
                <div
                  className="section-header"
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '20px'
                  }}
                >
                  <h5>Items / Expenses</h5>
                  <Button
                    icon="pi pi-plus"
                    className="p-button-sm"
                    onClick={() =>
                      setExpenseList([
                        ...expenseList,
                        {
                          expense_description: '',
                          expense_total: '',
                          expense_discount: '',
                          expense_linecount: ''
                        }
                      ])
                    }
                  />
                </div>
                <div className="scrollable-section" style={{ minHeight: '320px' }}>
                  {expenseList.map((expense, index) => (
                    <div
                      key={index}
                      style={{
                        border: '1px solid black',
                        borderRadius: '10px',
                        marginBottom: '20px',
                        minHeight: '200px'
                      }}
                    >
                      {/* New Item Header with Border and Caption */}
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: '20px',
                          paddingLeft: '20px',
                          paddingRight: '20px'
                        }}
                      >
                        <h4>Item {index + 1}</h4> {/* Display Item Number */}
                        <Button
                          icon="pi pi-minus"
                          className="p-button-danger p-button-md"
                          onClick={() => setExpenseList(expenseList.filter((_, i) => i !== index))}
                        />
                      </div>

                      {/* Expense Fields */}
                      <div
                        className="grid"
                        style={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: '20px',
                          paddingLeft: '20px',
                          paddingRight: '20px'
                        }}
                      >
                        {/* Left Section */}
                        <div className="field col-6">
                          <label htmlFor="expense_description">Expense Description</label>
                          <InputText
                            value={expense.expense_description}
                            onChange={(e) => handleExpenseChange(index, 'expense_description', e)}
                            placeholder="Expense Description"
                            style={{ width: '100%' }}
                            required
                          />
                        </div>

                        <div className="field col-6">
                          <label htmlFor="expense_total">Expense Total</label>
                          <CurrencyInput
                            intlConfig={{ locale: 'de-DE' }}
                            value={expense.expense_total} // Set the formatted value
                            onValueChange={(value) => {
                              // Handle value changes, 'value' will be the formatted string
                              if (value) {
                                // Remove non-numeric characters (e.g., commas, currency symbols) and parse as number
                                const numericValue = parseFloat(value.replace(/[^0-9.]/g, '')) || 0;

                                // Pass the formatted value to the handleExpenseChange function
                                handleExpenseChange(index, 'expense_total', {
                                  //@ts-ignore
                                  target: {
                                    value: numericValue.toString() // Pass as a string
                                  }
                                });
                              }
                            }}
                            placeholder="Total"
                            style={{ width: '100%' }}
                            className="p-inputtext p-component"
                            required
                          />
                        </div>

                        {/* Right Section */}
                        {quotationData.quotation_type === 'VMS' && (
                          <div className="field col-6">
                            <label htmlFor="expense_discount">Discount (%)</label>
                            <InputText
                              value={expense.expense_discount}
                              onChange={(e) => {
                                const value = Math.max(0, Math.min(100, parseFloat(e.target.value) || 0)); // Limit value between 0 and 100
                                handleExpenseChange(index, 'expense_discount', {
                                  //@ts-ignore
                                  target: { value }
                                });
                              }}
                              placeholder="Discount"
                              style={{ width: '100%' }}
                              required
                            />
                          </div>
                        )}

                        <div className="field col-6">
                          <label htmlFor="expense_linecount">Linecount Total</label>
                          <InputText
                            value={formatNumber(calculateLineTotal(expense.expense_total, expense.expense_discount))}
                            readOnly // Make it non-interactive
                            style={{ width: '100%', backgroundColor: '#f0f0f0' }} // Optional: gray background to show it's read-only
                          />
                        </div>
                      </div>

                      {/* Add some space after each item */}
                      <div style={{ marginBottom: '20px' }} />
                    </div>
                  ))}
                </div>
              </div>
              {/* Payments */}
              <div className="payments form-components">
                <h5>Payments</h5>
                {/* Subtotal Field */}
                <div className="field">
                  <label htmlFor="currencyType">Currency Type</label>
                  <Dropdown
                    id="currencyType"
                    value={currencyType}
                    options={currencyOptions}
                    onChange={handleCurrencyChange}
                    placeholder="Select Currency"
                    style={{ width: '100%' }}
                  />
                </div>

                <div className="field">
                  <label htmlFor="subtotal">Subtotal</label>
                  <InputText
                    id="subtotal"
                    value={subtotal} // Display with 2 decimal places
                    readOnly // Make it non-interactive
                    style={{ backgroundColor: '#f0f0f0' }} // Optional: gray background to show it's read-only
                  />
                </div>
                {/* VAT Percentage Field */}
                <div className="field">
                  <label htmlFor="vatPercentage">VAT (%)</label>
                  <InputText
                    id="vatPercentage"
                    value={vatPercentage.toString()} // Convert number to string
                    onChange={(e) => setVatPercentage(parseFloat(e.target.value) || 0)} // Convert string to number or default to 0
                    style={{ backgroundColor: 'white' }}
                  />
                </div>
                {/* VAT Field */}
                <div className="field">
                  <label htmlFor="vat">VAT Amount</label>
                  <InputText id="vat" value={vat} readOnly style={{ backgroundColor: '#f0f0f0' }} />
                </div>
                {/* Management Fee Field (conditional for VMS type) */}
                {quotationData.quotation_type === 'VMS' && (
                  <div className="field">
                    <label htmlFor="managementFee">Management Fee (5%)</label>
                    <InputText id="managementFee" value={managementFee} readOnly style={{ backgroundColor: '#f0f0f0' }} />
                  </div>
                )}
                {/* Grand Total Field */}
                <div className="field">
                  <label htmlFor="grandtotal">Grand Total</label>
                  <InputText id="grandtotal" value={grandtotal} readOnly style={{ backgroundColor: '#f0f0f0' }} />
                </div>
              </div>

              {/* Terms and Conditions */}
              <div className="terms-conditions form-components">
                <div
                  className="section-header"
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '20px'
                  }}
                >
                  <h5>Terms and Conditions</h5>
                  <Button icon="pi pi-plus" className="p-button-sm" onClick={() => setTosList([...tosList, { tos_description: '' }])} />
                </div>

                {/* TOS Items - Reduced Height and Added Padding */}
                <div className="scrollable-section" style={{ minHeight: '200px', paddingBottom: '20px' }}>
                  {tosList.map((tos, index) => (
                    <div
                      key={index}
                      style={{
                        border: '1px solid black',
                        borderRadius: '10px',
                        marginBottom: '10px', // Reduced margin for each TOS item
                        padding: '15px', // Added padding inside each TOS item
                        minHeight: '100px' // Reduced minimum height for each TOS item
                      }}
                    >
                      {/* Term Header with Border and Caption */}
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: '10px'
                        }}
                      >
                        <h4>Term {index + 1}</h4> {/* Display Term Number */}
                        <Button
                          icon="pi pi-minus"
                          className="p-button-danger p-button-md"
                          onClick={() => setTosList(tosList.filter((_, i) => i !== index))}
                        />
                      </div>

                      {/* Term Description Field */}
                      <div className="field">
                        <label htmlFor="tos_description">TOS Description</label>
                        <InputText
                          value={tos.tos_description}
                          onChange={(e) => handleTOSChange(index, e)}
                          placeholder="Enter term description"
                          style={{ width: '100%' }}
                          required
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Submit Button */}
          </div>
        )}
      </Dialog>

      {/* Dialog for Deleting Quotation */}

      <Dialog
        header={deletionSuccessful ? 'Deletion Successful' : 'Confirm Deletion'}
        visible={showDialogDelete}
        className="custom-dialog"
        appendTo="body"
        style={{ width: '35vw', zIndex: '9999' }}
        footer={
          <div
            style={{
              display: 'flex',
              justifyContent: deletionSuccessful ? 'center' : 'flex-end', // Change here
              width: '100%'
            }}
          >
            {' '}
            {loading ? (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  width: '100%'
                }}
              >
                <ProgressSpinner />
              </div>
            ) : (
              <>
                {deletionSuccessful ? (
                  <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                    <Button
                      className="dialog-btn"
                      label="Continue"
                      icon="pi pi-arrow-right"
                      iconPos="right"
                      severity="success"
                      onClick={() => {
                        setShowDialogDelete(false); // Immediately hide the dialog

                        setTimeout(() => {
                          setDeletionSuccessful(false); // Reset with a delay
                        }, 500); // Delay of 500 milliseconds (adjust as needed)
                      }}
                    />
                  </div>
                ) : (
                  <>
                    <Button
                      className="dialog-btn"
                      label="Cancel"
                      icon="pi pi-times"
                      iconPos="right"
                      outlined
                      severity="success"
                      onClick={() => {
                        setShowDialogDelete(false);
                        setDeletionSuccessful(false); // Reset on close
                      }}
                    />
                    <Button
                      className="dialog-btn"
                      label="Confirm"
                      icon="pi pi-trash"
                      iconPos="right"
                      onClick={confirmDelete}
                      severity="danger"
                    />
                  </>
                )}
              </>
            )}
          </div>
        }
        onHide={() => {
          setShowDialogDelete(false); // Immediately hide the dialog

          setTimeout(() => {
            setDeletionSuccessful(false); // Reset with a delay
          }, 500); // Delay of 500 milliseconds (adjust as needed)
        }}
      >
        {loading ? (
          <p>Please wait while we process your request...</p>
        ) : deletionSuccessful ? (
          <div style={{ textAlign: 'center' }}>
            <i
              className="pi pi-check"
              style={{
                fontSize: '3em',
                color: 'white',
                backgroundColor: 'green',
                padding: '25px',
                borderRadius: '50%'
              }}
            />
            <p
              style={{
                marginBottom: '-10px',
                fontWeight: 'bold',
                marginTop: '20px',
                fontSize: '25px'
              }}
            >
              Data Deleted Successfully
            </p>
            <p style={{ marginBottom: '-15px', fontSize: '15px' }}>Data Deleted Successfully</p>
          </div>
        ) : (
          <>
            <p>
              Are you sure you want to delete {selectedRows ? selectedRows.length : 0} records? <br />
              This action cannot be undone.
            </p>
          </>
        )}
      </Dialog>

      {/* Dialog for Editing Quotation */}

      <Dialog
        header={
          dialogStatus === 'loading' || dialogStatus === 'success' || dialogStatus === 'error' ? null : (
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginRight: '40px',
                zIndex: '9999'
              }}
            >
              <h5>Add Quotation</h5>
              <Dropdown
                value={quotationData.quotation_type}
                options={quotationTypeOptions}
                onChange={(e) => setQuotationData({ ...quotationData, quotation_type: e.value })}
                style={{ width: '120px' }}
                placeholder="Select Type"
              />
              <Button label="Save Quotation" icon="pi pi-check" className="p-button-success" onClick={handleUpdateQuotation} />
            </div>
          )
        }
        visible={isEditDialogVisible}
        style={{ width: '90vw', height: '100vh' }}
        onHide={handleDialogClose}
      >
        {dialogStatus === 'loading' ? (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              width: '100%',
              height: '100%'
            }}
          >
            <ProgressSpinner />
          </div>
        ) : dialogStatus === 'success' ? (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              flexDirection: 'column',
              height: '100%'
            }}
          >
            {/* PDF Preview and Download Buttons */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                marginTop: '20px'
              }}
            >
              <p>Your Quotation has been generated. You can download it below:</p>
              {/* Display PDF preview */}
              <iframe
                src={`${embedPdfUrl}#toolbar=0`}
                style={{ width: '45vw', height: '60vh', border: 'none' }}
                title="PDF Preview"
              ></iframe>

              {/* Dropdown for Download Options and Close Button */}
              <div style={{ marginTop: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Dropdown
                  options={[
                    { label: 'Download PDF', value: pdfUrl },
                    { label: 'Download Excel', value: xlsxUrl }
                  ]}
                  onChange={(e) => window.open(e.value, '_blank')} // Open the selected file in a new tab
                  placeholder="Select File to Download"
                  style={{ width: '200px' }}
                />

                {/* Close Button */}
                <Button
                  label="Close"
                  icon="pi pi-times"
                  className="p-button-danger"
                  onClick={handleDialogClose}
                  style={{ marginLeft: '10px' }}
                />
              </div>
            </div>
          </div>
        ) : dialogStatus === 'error' ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              height: '100%',
              justifyContent: 'center'
            }}
          >
            <i className="pi pi-times-circle" style={{ fontSize: '2em', color: '#d9534f' }}></i>
            <h5>Error Saving Quotation</h5>
            <p>Something went wrong. Please try again later.</p>
            <Button
              label="Close"
              icon="pi pi-times"
              className="p-button-danger"
              onClick={handleDialogClose}
              style={{ marginTop: '10px' }}
            />
          </div>
        ) : (
          <div className="p-fluid formgrid grid" style={{ display: 'flex', gap: '20px', paddingBottom: '450px' }}>
            {/* Left Section */}
            <div
              className="left-section"
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                minHeight: '500px',
                maxHeight: '100vh'
              }}
            >
              {/* Time Details */}
              {/* Time Details */}
              <div className="time-details form-components">
                <h5>Time Details</h5>
                <div className="field">
                  <label htmlFor="quotation_createdate">Create Date</label>
                  <Calendar
                    id="quotation_createdate"
                    value={quotationData.quotation_createdate ? new Date(quotationData.quotation_createdate) : null} // Ensure it's a Date object
                    //@ts-ignore
                    onChange={handleCreatedDateChange}
                    dateFormat="yy-mm-dd"
                    showIcon
                    style={{ width: '80%' }}
                    required
                  />
                </div>
                <div className="field">
                  <label htmlFor="quotation_validdate">Valid Date</label>
                  <Calendar
                    id="quotation_validdate"
                    value={quotationData.quotation_validdate ? new Date(quotationData.quotation_validdate) : null} // Ensure it's a Date object
                    //@ts-ignore
                    onChange={handleValidDateChange}
                    dateFormat="yy-mm-dd"
                    showIcon
                    style={{ width: '80%' }}
                    required
                  />
                </div>
              </div>

              {/* Customer Details */}
              <div className="customer-details form-components">
                <h5>Customer Details</h5>
                <div className="field">
                  <label htmlFor="quotation_customer">Customer Name</label>
                  <InputText
                    id="quotation_customer"
                    value={quotationData.quotation_customer}
                    onChange={(e) => setQuotationData({ ...quotationData, quotation_customer: e.target.value })}
                    style={{ width: '80%' }}
                    required
                  />
                </div>
                <div className="field">
                  <label htmlFor="quotation_pt">PT</label>
                  <InputText
                    id="quotation_pt"
                    value={quotationData.quotation_pt}
                    onChange={(e) => setQuotationData({ ...quotationData, quotation_pt: e.target.value })}
                    style={{ width: '80%' }}
                    required
                  />
                </div>
                <div className="field">
                  <label htmlFor="quotation_customeraddress">Customer Address</label>
                  <InputText
                    id="quotation_customeraddress"
                    value={quotationData.quotation_customeraddress}
                    onChange={(e) =>
                      setQuotationData({
                        ...quotationData,
                        quotation_customeraddress: e.target.value
                      })
                    }
                    style={{ width: '80%' }}
                    required
                  />
                </div>
                <div className="field">
                  <label htmlFor="quotation_email">Customer Email</label>
                  <InputText
                    id="quotation_email"
                    value={quotationData.quotation_email}
                    onChange={(e) => setQuotationData({ ...quotationData, quotation_email: e.target.value })}
                    style={{ width: '80%' }}
                    required
                  />
                </div>
              </div>

              {/* Product/Quote Description */}
              <div className="quote-description form-components">
                <h5>Product/Quote Description</h5>
                <div className="field">
                  <label htmlFor="quotation_solution">Description</label>
                  <InputText
                    id="quotation_solution"
                    value={quotationData.quotation_solution}
                    onChange={(e) => setQuotationData({ ...quotationData, quotation_solution: e.target.value })}
                    style={{ width: '80%' }}
                    required
                  />
                </div>
              </div>

              <div className="user-area form-components">
                <h5>User Area</h5>
                <div className="field">
                  <label htmlFor="quotation_pic">PIC Name</label>
                  <InputText
                    id="quotation_pic"
                    value={quotationData.quotation_pic}
                    onChange={(e) => setQuotationData({ ...quotationData, quotation_pic: e.target.value })}
                    style={{ width: '80%' }}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Right Section */}
            <div
              className="right-section"
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                minHeight: '500px',
                maxHeight: '100vh'
              }}
            >
              {/* Items/Expenses */}
              <div className="items-expenses form-components">
                <div
                  className="section-header"
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '20px'
                  }}
                >
                  <h5>Items / Expenses</h5>
                  <Button
                    icon="pi pi-plus"
                    className="p-button-sm"
                    onClick={() =>
                      setExpenseList([
                        ...expenseList,
                        {
                          expense_description: '',
                          expense_total: '',
                          expense_discount: '',
                          expense_linecount: ''
                        }
                      ])
                    }
                  />
                </div>
                <div className="scrollable-section" style={{ minHeight: '320px' }}>
                  {expenseList.map((expense, index) => (
                    <div
                      key={index}
                      style={{
                        border: '1px solid black',
                        borderRadius: '10px',
                        marginBottom: '20px',
                        minHeight: '200px'
                      }}
                    >
                      {/* New Item Header with Border and Caption */}
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: '20px',
                          paddingLeft: '20px',
                          paddingRight: '20px'
                        }}
                      >
                        <h4>Item {index + 1}</h4> {/* Display Item Number */}
                        <Button
                          icon="pi pi-minus"
                          className="p-button-danger p-button-md"
                          onClick={() => setExpenseList(expenseList.filter((_, i) => i !== index))}
                        />
                      </div>

                      {/* Expense Fields */}
                      <div
                        className="grid"
                        style={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: '20px',
                          paddingLeft: '20px',
                          paddingRight: '20px'
                        }}
                      >
                        {/* Left Section */}
                        <div className="field col-6">
                          <label htmlFor="expense_description">Expense Description</label>
                          <InputText
                            value={expense.expense_description}
                            onChange={(e) => handleExpenseChange(index, 'expense_description', e)}
                            placeholder="Expense Description"
                            style={{ width: '100%' }}
                            required
                          />
                        </div>

                        <div className="field col-6">
                          <label htmlFor="expense_total">Expense Total</label>
                          <CurrencyInput
                            intlConfig={{ locale: 'de-DE' }}
                            value={expense.expense_total} // Set the formatted value
                            onValueChange={(value) => {
                              // Handle value changes, 'value' will be the formatted string
                              if (value) {
                                // Remove non-numeric characters (e.g., commas, currency symbols) and parse as number
                                const numericValue = parseFloat(value.replace(/[^0-9.]/g, '')) || 0;

                                // Pass the formatted value to the handleExpenseChange function
                                handleExpenseChange(index, 'expense_total', {
                                  //@ts-ignore
                                  target: {
                                    value: numericValue.toString() // Pass as a string
                                  }
                                });
                              }
                            }}
                            placeholder="Total"
                            style={{ width: '100%' }}
                            className="p-inputtext p-component"
                            required
                          />
                        </div>

                        {/* Right Section */}
                        {quotationData.quotation_type === 'VMS' && (
                          <div className="field col-6">
                            <label htmlFor="expense_discount">Discount (%)</label>
                            <InputText
                              value={expense.expense_discount}
                              onChange={(e) => {
                                const value = Math.max(0, Math.min(100, parseFloat(e.target.value) || 0)); // Limit value between 0 and 100
                                handleExpenseChange(index, 'expense_discount', {
                                  //@ts-ignore
                                  target: { value }
                                });
                              }}
                              placeholder="Discount"
                              style={{ width: '100%' }}
                              required
                            />
                          </div>
                        )}

                        <div className="field col-6">
                          <label htmlFor="expense_linecount">Linecount Total</label>
                          <InputText
                            value={formatNumber(calculateLineTotal(expense.expense_total, expense.expense_discount))}
                            readOnly // Make it non-interactive
                            style={{ width: '100%', backgroundColor: '#f0f0f0' }} // Optional: gray background to show it's read-only
                          />
                        </div>
                      </div>

                      {/* Add some space after each item */}
                      <div style={{ marginBottom: '20px' }} />
                    </div>
                  ))}
                </div>
              </div>
              <div className="payments form-components">
                <h5>Payments</h5>
                {/* Subtotal Field */}
                <div className="field">
                  <label htmlFor="currencyType">Currency Type</label>
                  <Dropdown
                    id="currencyType"
                    value={currencyType}
                    options={currencyOptions}
                    onChange={handleCurrencyChange}
                    placeholder="Select Currency"
                    style={{ width: '100%' }}
                  />
                </div>
                <div className="field">
                  <label htmlFor="subtotal">Subtotal</label>
                  <InputText
                    id="subtotal"
                    value={subtotal} // Display with 2 decimal places
                    readOnly // Make it non-interactive
                    style={{ backgroundColor: '#f0f0f0' }} // Optional: gray background to show it's read-only
                  />
                </div>
                {/* VAT Percentage Field */}
                <div className="field">
                  <label htmlFor="vatPercentage">VAT (%)</label>
                  <InputText
                    id="vatPercentage"
                    value={vatPercentage.toString()} // Convert number to string
                    onChange={(e) => setVatPercentage(parseFloat(e.target.value) || 0)} // Convert string to number or default to 0
                    style={{ backgroundColor: 'white' }}
                  />
                </div>
                {/* VAT Field */}
                <div className="field">
                  <label htmlFor="vat">VAT Amount</label>
                  <InputText id="vat" value={vat} readOnly style={{ backgroundColor: '#f0f0f0' }} />
                </div>
                {/* Management Fee Field (conditional for VMS type) */}
                {quotationData.quotation_type === 'VMS' && (
                  <div className="field">
                    <label htmlFor="managementFee">Management Fee (5%)</label>
                    <InputText id="managementFee" value={managementFee} readOnly style={{ backgroundColor: '#f0f0f0' }} />
                  </div>
                )}
                {/* Grand Total Field */}
                <div className="field">
                  <label htmlFor="grandtotal">Grand Total</label>
                  <InputText id="grandtotal" value={grandtotal} readOnly style={{ backgroundColor: '#f0f0f0' }} />
                </div>
              </div>

              {/* Terms of Service */}
              <div className="terms-conditions form-components">
                <div
                  className="section-header"
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '20px'
                  }}
                >
                  <h5>Terms and Conditions</h5>
                  <Button icon="pi pi-plus" className="p-button-sm" onClick={() => setTosList([...tosList, { tos_description: '' }])} />
                </div>

                {/* TOS Items - Reduced Height and Added Padding */}
                <div className="scrollable-section" style={{ minHeight: '200px', paddingBottom: '20px' }}>
                  {tosList.map((tos, index) => (
                    <div
                      key={index}
                      style={{
                        border: '1px solid black',
                        borderRadius: '10px',
                        marginBottom: '10px', // Reduced margin for each TOS item
                        padding: '15px', // Added padding inside each TOS item
                        minHeight: '100px' // Reduced minimum height for each TOS item
                      }}
                    >
                      {/* Term Header with Border and Caption */}
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: '10px'
                        }}
                      >
                        <h4>Term {index + 1}</h4> {/* Display Term Number */}
                        <Button
                          icon="pi pi-minus"
                          className="p-button-danger p-button-md"
                          onClick={() => setTosList(tosList.filter((_, i) => i !== index))}
                        />
                      </div>

                      {/* Term Description Field */}
                      <div className="field">
                        <label htmlFor="tos_description">TOS Description</label>
                        <InputText
                          value={tos.tos_description}
                          onChange={(e) => handleTOSChange(index, e)}
                          placeholder="Enter term description"
                          style={{ width: '100%' }}
                          required
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
}
