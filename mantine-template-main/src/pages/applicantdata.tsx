import React, { useEffect, useState, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { IconField } from 'primereact/iconfield';
import { FilterMatchMode } from 'primereact/api';
import { SplitButton } from 'primereact/splitbutton';
import { InputSwitch } from 'primereact/inputswitch';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog'; // Import PrimeReact Dialog
import { Dropdown } from 'primereact/dropdown';
import { Menu } from 'primereact/menu';
import axios from 'axios';
import 'primereact/resources/themes/lara-light-cyan/theme.css';
import './css/applicantdata.css';
import * as XLSX from 'xlsx'; // Import xlsx for Excel/CSV export
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { saveAs } from 'file-saver';
import { ProgressSpinner } from 'primereact/progressspinner';


export default function Dashboard() {
  const [data, setData] = useState([]); // Data for the table
  const [selectedRows, setSelectedRows] = useState<any>(null); // Selected rows
  const [rowClick, setRowClick] = useState(true);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null); // Updated type
  const [docxUrl, setDocxUrl] = useState<string | null>(null); // Updated type
  const [showDialog, setShowDialog] = useState(false); // Updated state for PrimeReact Dialog
  const [embedPdfUrl, setembedPdfUrl] = useState<string | null>(null); // Updated type
  const [deletionSuccessful, setDeletionSuccessful] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState(null);
  const [showDialogExport, setShowDialogExport] = useState(false);
  const [showDialogDelete, setShowDialogDelete] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [globalFilter, setGlobalFilter] = useState('');
  const [exportSuccessful, setExportSuccessful] = useState(false);
  const menu = useRef(null); // Reference for the dropdown menu

  const [first, setFirst] = useState(0); // For tracking the first record index
  const [rows, setRows] = useState(10); // Number of rows per page

  // This will contain your data, replace with actual data source.
  const totalRecords = data.length; // Total number of records in the table
  const [rowsPerPage, setRowsPerPage] = useState(10); // Default rows per page

  const handleRowsPerPageChange = (event: any) => {
    setRowsPerPage(event.value); // Update rowsPerPage with the selected value
  };

  const handleResize = () => {
    setIsSmallScreen(window.innerWidth < 768); // Adjust the breakpoint as needed
  };

  useEffect(() => {
    handleResize(); // Check the screen size initially
    window.addEventListener('resize', handleResize); // Add resize event listener

    return () => {
      window.removeEventListener('resize', handleResize); // Cleanup the event listener
    };
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:5000/records.json');
        setData(response.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  // Delete Dialog Handling
  const handleDeleteClick = () => {
    if (selectedRows && selectedRows.length > 0) {
      setShowDialogDelete(true);
    } else {
      alert('Please select rows to delete.');
    }
  };

  // Delete Data from Datatables
  const confirmDelete = () => {
    const idToDelete = selectedRows.map((row: any) => row.applicant_id);
    setLoading(true); // Start loading

    axios
      .post('http://localhost:5000/delete-record', {
        applicantid: idToDelete,
        visibility: false,
      })
      .then(() => {
        setDeletionSuccessful(true); // Set deletion success state
        //@ts-ignore
        setData((prevData) => prevData.filter((row) => !idToDelete.includes(row.applicant_id)));
        setSelectedRows(null);
      })
      .catch((error) => {
        console.error('Error deleting records:', error);
        alert('Error deleting records. Please try again.');
      })
      .finally(() => {
        setLoading(false); // End loading
        // Note: We handle success in the `then` block
      });
  };

  const formatOptions = [
    { label: 'CSV', value: 'csv' },
    { label: 'Excel', value: 'excel' },
    { label: 'PDF', value: 'pdf' },
  ];

  const cols = [
    {
      field: 'applicant_dateofapplication',
      header: 'Date of Application',
    },
    {
      field: 'applicant_name',
      header: 'Applicant',
    },
    {
      field: 'applicant_contact',
      header: 'Contact No.',
    },
    { field: 'applicant_email', header: 'Email' },
    {
      field: 'applicant_education',
      header: 'Education',
    },
    { field: 'applicant_skill', header: 'Skill' },
    {
      field: 'applicant_experience',
      header: 'Experience',
    },
  ];

  const exportColumns = cols.map((col) => ({ title: col.header, dataKey: col.field }));

  // Dropdown for Export Dialog Logic
  const download = () => {
    if (!selectedRows || selectedRows.length === 0) {
      alert('Please select rows to export');
      return;
    }

    if (selectedFormat === 'excel') {
      exportExcel();
    } else if (selectedFormat === 'csv') {
      exportCSV();
    } else if (selectedFormat === 'pdf') {
      exportPdf();
    }
    setShowDialog(false); // Close the dialog after download
  };

  // Save excel as File
  //@ts-ignore
  const saveAsExcelFile = (buffer, fileName) => {
    const data = new Blob([buffer], { type: 'application/octet-stream' });
    saveAs(data, fileName);
  };

  const exportCSV = () => {
    if (!selectedRows || selectedRows.length === 0) return; // Ensure some rows are selected
    const csvContent = [
      cols.map((col) => col.header).join(','), // Header row
      ...selectedRows.map((row: any) => cols.map((col) => row[col.field]).join(',')), // Data rows
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'HR Records.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setExportSuccessful(true); // Set success state to true after export
  };

  const exportExcel = () => {
    if (!selectedRows || selectedRows.length === 0) return; // Ensure some rows are selected
    import('xlsx').then((xlsx) => {
      const worksheet = xlsx.utils.json_to_sheet(selectedRows); // Use selectedRows
      const workbook = { Sheets: { data: worksheet }, SheetNames: ['data'] };

      // Write the Excel file to a buffer
      const excelBuffer = xlsx.write(workbook, {
        bookType: 'xlsx',
        type: 'array',
      });

      // Call function to save Excel file
      saveAsExcelFile(excelBuffer, 'HR Records.xlsx');
      setExportSuccessful(true); // Set success state to true after export
    });
  };

  const exportPdf = () => {
    if (!selectedRows || selectedRows.length === 0) return; // Ensure some rows are selected

    import('jspdf').then((jsPDF) => {
      import('jspdf-autotable').then(() => {
        const doc = new jsPDF.default('landscape'); // Set landscape orientation

        // Add title
        doc.text('HR Datasheet', 14, 10); // Adjust text position

        // Map the selected rows to fit the exportColumns structure
        const data = selectedRows.map((row: any) => {
          return {
            applicant_dateofapplication: row.applicant_dateofapplication,
            applicant_name: row.applicant_name,
            applicant_contact: row.applicant_contact,
            applicant_email: row.applicant_email,
            applicant_education: row.applicant_education,
            applicant_skill: row.applicant_skill,
            applicant_experience: row.applicant_experience,
          };
        });
        //@ts-ignore
        // Generate the table
        doc.autoTable({
          columns: exportColumns, // Use exportColumns for headers and keys
          body: data, // Use mapped selectedRows for the table data
          styles: { fontSize: 10 }, // Smaller font size
          columnStyles: {
            0: { cellWidth: 'auto' }, // Automatically scale columns
            1: { cellWidth: 'auto' },
            2: { cellWidth: 'auto' },
            3: { cellWidth: 'auto' },
            4: { cellWidth: 'auto' },
            5: { cellWidth: 'auto' },
            6: { cellWidth: 'auto' },
          },
          theme: 'grid', // Grid lines for better table structure
          margin: { top: 20 }, // Margin from the top
          tableWidth: 'auto', // Automatically adjust table to fit page width
          pageBreak: 'auto', // Automatically handle page breaks
        });

        // Save the generated PDF
        doc.save('HR Records.pdf');

        setExportSuccessful(true); // Set success state to true after export
      });
    });
  };

  // Reset the success state when opening the dialog
  const openExportDialog = () => {
    setShowDialogExport(true);
    setExportSuccessful(false); // Reset success state
  };

  // 3 dot buttons for generation cv
  const actionBodyTemplate = (rowData: any) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const toggleDropdown = () => {
      setIsDropdownOpen(!isDropdownOpen);
    };

    const handleOriginCvClick = () => {
      if (rowData.applicant_resumelink) {
        window.open(rowData.applicant_resumelink, '_blank');
      } else {
        alert(`No resume link available for ${rowData.applicant_name}`);
      }
    };

    const handleDownloadCvClick = () => {
      handleGenerateCV(rowData.applicant_id, rowData.applicant_name);
    };

    return (
      <div className="action-buttons" style={{ position: 'relative', display: 'flex' }}>
        <Button
          icon="pi pi-ellipsis-v"
          onClick={toggleDropdown}
          style={{
            backgroundColor: 'transparent',
            border: 'none',
            height: '10px',
            color: 'black',
            marginLeft: 'auto',
            marginRight: 'auto',
          }}
        ></Button>
        <div
          className={`dropdown-menu ${isDropdownOpen ? 'open' : ''}`}
          style={{
            paddingTop: '20px',
            marginLeft: '-70px',
            marginTop: '5px',
            position: 'absolute',
            top: '100%',
            left: 0,
            zIndex: 1000,
            backgroundColor: 'white',
            border: '1px solid lightgray',
            padding: '10px',
            borderRadius: '4px',
            textAlign: 'start',
            width: '150px',
            opacity: isDropdownOpen ? 1 : 0,
            transform: isDropdownOpen ? 'scaleY(1)' : 'scaleY(0)',
            transformOrigin: 'top',
            transition: 'opacity 0.3s ease, transform 0.3s ease',
          }}
        >
          <Button
            label="Origin CV"
            className="p-button-text"
            onClick={handleOriginCvClick}
            style={{ marginBottom: '10px', width: '100%', textAlign: 'start' }}
          />
          <Button
            label="Download CV"
            className="p-button-text"
            onClick={handleDownloadCvClick}
            style={{ marginBottom: '10px', width: '100%', textAlign: 'start' }}
          />
        </div>
      </div>
    );
  };

  // CV generation
  //@ts-ignore
  const handleGenerateCV = (applicantid, applicantname) => {
    setembedPdfUrl(null);
    setShowDialog(true); // Open dialog immediately
    setLoading(true); // Show loading spinner

    axios
      .post('http://localhost:5000/generate-cv', {
        applicantid: applicantid,
        applicantname: applicantname,
      })
      .then((response) => {
        console.log('Response:', response); // Debugging line
        if (response.data.pdfUrl) {
          const pdfPath = `http://localhost:5000/download/pdf/${response.data.pdfUrl}`;
          const docxPath = `http://localhost:5000/download/word/${response.data.docxUrl}`;
          const embedPdfPath = `http://localhost:5000/embed/pdf/${response.data.pdfUrl}`;
          setPdfUrl(pdfPath);
          setDocxUrl(docxPath);
          setembedPdfUrl(embedPdfPath);
          setLoading(false); // Hide loading spinner when done
        } else {
          alert('Failed to generate CV.');
          setLoading(false); // Hide spinner on failure
        }
      });
  };

  const downloadItems = [
    {
      label: 'Download PDF',
      icon: 'pi pi-file-pdf',
      command: () => {
        if (pdfUrl) {
          window.open(pdfUrl, '_blank');
        } else {
          alert('PDF file not available');
        }
      },
    },
    {
      label: 'Download Word',
      icon: 'pi pi-file-word',
      command: () => {
        if (docxUrl) {
          window.open(docxUrl, '_blank');
        } else {
          alert('DOCX file not available');
        }
      },
    },
  ];

  // Primreact Table Header
  const header = (
    <div className="flex justify-content-between align-items-start">
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
          <h2 style={{ margin: 0 }}>HR Datasheet Table</h2>
          <span style={{ fontSize: '12px' }}>
            Show {Math.min(first + rowsPerPage, totalRecords)} of {totalRecords} Results
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
        <button className="default-btn export-btn" onClick={() => setShowDialogExport(true)}>
          Export
          <i className="fa-solid fa-download"></i>
        </button>
      </div>
    </div>
  );

  //@ts-ignore
  return (
    <div className="card" style={{ overflowX: 'hidden', width: '80vw', margin: 'auto' }}>
      <div
        className="flex justify-content-center align-items-center mb-4 gap-2"
        style={{ display: 'none' }}
      >
        <InputSwitch checked={rowClick} onChange={(e) => setRowClick(e.value)} />
        <label htmlFor="input-rowclick">Row Click</label>
      </div>
      {/* Datatable Primereact for data*/}

      <DataTable
        value={data}
        paginator
        rows={10}
        rowsPerPageOptions={[5, 10, 25, 50]}
        filterDisplay={'row'}
        showGridlines
        scrollable
        size="small"
        scrollHeight="800px"
        header={header}
        emptyMessage="Loading Records."
        paginatorClassName="custom-paginator"
        selectionMode={rowClick ? null : 'checkbox'}
        selection={selectedRows}
        onSelectionChange={(e: any) => setSelectedRows(e.value)}
        dataKey="applicant_id"
        removableSort
        globalFilter={globalFilter}
        globalFilterFields={[
          'applicant_dateofapplication',
          'applicant_name',
          'applicant_contact',
          'applicant_email',
          'applicant_education',
          'applicant_skill',
          'applicant_experience',
        ]}
        filterClearIcon
        paginatorTemplate={{
          layout: 'PrevPageLink PageLinks NextPageLink RowsPerPageDropdown',
          PrevPageLink: (options) => {
            return (
              <button
                type="button"
                className={`${options.className} paginator-control`}
                style={{ color: options.disabled ? 'gray' : 'inherit' }}
                onClick={options.onClick}
                disabled={options.disabled}
              >
                Prev
              </button>
            );
          },
          NextPageLink: (options) => {
            return (
              <button
                type="button"
                className={`${options.className} paginator-control`}
                style={{ color: options.disabled ? 'gray' : 'inherit' }}
                onClick={options.onClick}
                disabled={options.disabled}
              >
                Next
              </button>
            );
          },
          RowsPerPageDropdown: (options) => {
            return (
              <div className="rowsperpage">
                <span>
                  Show
                  <Dropdown
                    //@ts-ignore
                    className={`${options.className} dropdown-control`}
                    style={{ marginLeft: '10px', marginRight: '10px', fontSize: '12px' }}
                    value={rowsPerPage} // Set the current value of rowsPerPage
                    options={options.options} // The options array
                    onChange={(event) => {
                      handleRowsPerPageChange(event); // Update rowsPerPage state on change
                      //@ts-ignore
                      options.onChange({ value: event.value }); // Ensure the dropdown change event propagates
                    }}
                    placeholder="Select Rows"
                    valueTemplate={(option) => option.label} // Display the selected label
                  />
                  from <b>{totalRecords}</b> results
                </span>
              </div>
            );
          },
        }}
      >
        <Column
          headerClassName="custom-header"
          sortable
          selectionMode="multiple"
          headerStyle={{
            minWidth: '100px',
            alignItems: 'center',
            textAlign: 'center',
            padding: '10px',
          }}
          bodyStyle={{ textAlign: 'center' }}
        ></Column>
        <Column
          field="applicant_dateofapplication"
          header="Date of Application"
          filter
          sortable
          headerStyle={{ fontSize: '15px' }}
          style={{ minWidth: '200px', fontSize: '12px', padding: '10px' }}
        />
        <Column
          field="applicant_name"
          header="Applicant"
          filter
          frozen
          sortable
          headerStyle={{ fontSize: '15px' }}
          style={{ minWidth: '200px', fontSize: '12px', padding: '10px' }}
        />
        <Column
          field="applicant_contact"
          header="Contact No."
          filter
          sortable
          headerStyle={{ fontSize: '15px' }}
          style={{ minWidth: '200px', fontSize: '12px', padding: '10px' }}
        />
        <Column
          field="applicant_email"
          header="Email"
          filter
          sortable
          headerStyle={{ fontSize: '15px' }}
          style={{ minWidth: '200px', fontSize: '12px', padding: '10px' }}
        />
        <Column
          field="applicant_education"
          header="Education"
          filter
          sortable
          headerStyle={{ fontSize: '15px' }}
          style={{ minWidth: '200px', fontSize: '12px', padding: '10px' }}
          body={(rowData) => (
            <div dangerouslySetInnerHTML={{ __html: rowData.applicant_education }} />
          )} // Render HTML for education
        />
        <Column
          field="applicant_skill"
          header="Skill"
          filter
          sortable
          headerStyle={{ fontSize: '15px' }}
          style={{ minWidth: '200px', fontSize: '12px', padding: '10px' }}
          body={(rowData) => <div dangerouslySetInnerHTML={{ __html: rowData.applicant_skill }} />} // Render HTML for skills
        />
        <Column
          field="job_experiences"
          header="Job Experience"
          filter
          sortable
          headerStyle={{ fontSize: '15px' }}
          style={{ minWidth: '200px', fontSize: '12px', padding: '10px' }}
          body={(rowData) => <div dangerouslySetInnerHTML={{ __html: rowData.job_experiences }} />} // Render HTML for job experiences
        />

        <Column
          field="customer_experiences"
          header="Customer Experience"
          filter
          sortable
          headerStyle={{ fontSize: '15px' }}
          style={{ minWidth: '200px', fontSize: '12px', padding: '10px' }}
          body={(rowData) => (
            <div dangerouslySetInnerHTML={{ __html: rowData.customer_experiences }} />
          )} // Render HTML for customer experiences
        />
        <Column
          field="applicant_resumelink"
          headerClassName="custom-header"
          body={actionBodyTemplate}
          sortable
          header="Actions"
          headerStyle={{ fontSize: '15px' }}
          style={{ minWidth: '100px', fontSize: '12px' }}
          bodyStyle={{ textAlign: 'center' }}
        />
      </DataTable>

      {/* Download Button Dialog */}
      <Dialog
        visible={showDialog}
        onHide={() => setShowDialog(false)}
        header="Generated CV"
        style={{ width: '40vw' }}
        footer={null}
      >
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {loading ? (
            <div style={{ textAlign: 'center' }}>
              <ProgressSpinner />
              <p>Generating CV, please wait...</p>
            </div>
          ) : (
            <>
              <p>Your CV has been generated. You can download it below:</p>
              {/* Only render the iframe when embedPdfUrl is available */}
              {embedPdfUrl ? (
                <iframe
                  title="PDF Preview"
                  src={`${embedPdfUrl}#toolbar=0`}
                  width="100%"
                  height="400px"
                />
              ) : (
                <p>Loading PDF preview...</p>
              )}
              <div style={{ display: 'flex', justifyContent: 'right', marginTop: '30px' }}>
                <Button
                  label="Download"
                  icon="pi pi-download"
                  //@ts-ignore
                  onClick={(event) => menu.current.toggle(event)} // Toggle the dropdown on click anywhere on the button
                  className="p-button-success dialog-btn"
                  iconPos="right"
                />
                <Menu model={downloadItems} popup ref={menu} />
              </div>
            </>
          )}
        </div>
      </Dialog>

      {/* Export Button Dialog */}
      <Dialog
        visible={showDialogExport}
        style={{ width: '35vw' }}
        onHide={() => {
          setShowDialogExport(false); // Immediately hide the dialog

          setTimeout(() => {
            setExportSuccessful(false); // Reset with a delay
          }, 500); // Delay of 500 milliseconds (adjust as needed)
        }}
        header="Export Data"
        footer={
          <div
            style={{ display: 'flex', justifyContent: exportSuccessful ? 'center' : 'flex-end' }}
          >
            {loading ? (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  width: '100%',
                }}
              >
                <ProgressSpinner />
              </div>
            ) : exportSuccessful ? (
              <Button
                className="dialog-btn"
                label="Continue"
                icon="pi pi-arrow-right"
                iconPos="right"
                severity="success"
                onClick={() => {
                  setShowDialogExport(false); // Immediately hide the dialog

                  setTimeout(() => {
                    setExportSuccessful(false); // Reset with a delay
                  }, 500); // Delay of 500 milliseconds (adjust as needed)
                }}
              />
            ) : (
              <>
                <Button
                  className="dialog-btn"
                  label="Close"
                  icon="pi pi-times pi-logo"
                  iconPos="right"
                  onClick={() => setShowDialogExport(false)}
                  outlined
                  raised
                  severity="danger"
                  style={{ marginRight: '10px' }}
                />
                <Button
                  className="dialog-btn"
                  label="Export"
                  iconPos="right"
                  icon="pi pi-download pi-logo"
                  severity="success"
                  onClick={download} // Call the download function
                  disabled={!selectedFormat}
                  raised
                />
              </>
            )}
          </div>
        }
      >
        <div>
          {loading ? (
            <p>Please wait while we process your request...</p>
          ) : exportSuccessful ? (
            <div style={{ textAlign: 'center' }}>
              <i
                className="pi pi-check"
                style={{
                  fontSize: '3em',
                  color: 'white',
                  backgroundColor: 'green',
                  padding: '25px',
                  borderRadius: '50%',
                }}
              />
              <p
                style={{
                  marginBottom: '-10px',
                  fontWeight: 'bold',
                  marginTop: '20px',
                  fontSize: '25px',
                }}
              >
                Data Exported Successfully
              </p>
              <p style={{ marginBottom: '-15px', fontSize: '15px' }}>Data Exported Successfully</p>
            </div>
          ) : (
            <div>
              <p>Please select a format to export:</p>
              <Dropdown
                style={{ width: '100%' }}
                value={selectedFormat}
                options={formatOptions}
                onChange={(e) => setSelectedFormat(e.value)}
                placeholder="Select Format"
              />
            </div>
          )}
        </div>
      </Dialog>

      {/* Delete Button Dialog */}
      <Dialog
        header={deletionSuccessful ? 'Deletion Successful' : 'Confirm Deletion'}
        visible={showDialogDelete}
        style={{ width: '35vw' }}
        footer={
          <div
            style={{
              display: 'flex',
              justifyContent: deletionSuccessful ? 'center' : 'flex-end', // Change here
              width: '100%',
            }}
          >
            {' '}
            {loading ? (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  width: '100%',
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
                borderRadius: '50%',
              }}
            />
            <p
              style={{
                marginBottom: '-10px',
                fontWeight: 'bold',
                marginTop: '20px',
                fontSize: '25px',
              }}
            >
              Data Deleted Successfully
            </p>
            <p style={{ marginBottom: '-15px', fontSize: '15px' }}>Data Deleted Successfully</p>
          </div>
        ) : (
          <>
            <p>
              Are you sure you want to delete {selectedRows ? selectedRows.length : 0} records?{' '}
              <br />
              This action cannot be undone.
            </p>
          </>
        )}
      </Dialog>
    </div>
  );
}
