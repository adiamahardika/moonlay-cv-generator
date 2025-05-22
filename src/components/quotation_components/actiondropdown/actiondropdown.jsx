import React, { useState } from 'react';
import { Button } from 'primereact/button';

const apiBase = import.meta.env.VITE_API_BASE;

const ActionDropdown = ({ rowData, onEditQuotation }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Toggle dropdown visibility
  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  // Function to download PDF
  const handleDownloadPdf = async (quotationCode) => {
    try {
      // Replace "/" with "_" in the quotation_code
      const fileName = quotationCode.replace(/\//g, '_') + '.pdf';

      // Fetch PDF from the server
      const response = await fetch(`${apiBase}/download/pdf/${fileName}`, {
        method: 'GET'
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);

        // Create a link and trigger a click to download the file
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        link.click();

        // Clean up the URL object
        URL.revokeObjectURL(url);
      } else {
        console.error('Failed to download PDF');
      }
    } catch (error) {
      console.error('Error downloading the PDF:', error);
    }
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
          marginRight: 'auto'
        }}
      />
      {/* Dropdown menu */}
      {isDropdownOpen && (
        <div
          className="dropdown-menu"
          style={{
            paddingTop: '10px',
            marginLeft: '-120px',
            marginTop: '15px',
            position: 'absolute',
            top: '100%',
            left: 0,
            zIndex: 1,
            backgroundColor: 'white',
            border: '1px solid lightgray',
            padding: '10px',
            borderRadius: '4px',
            textAlign: 'start',
            width: '200px',
            opacity: isDropdownOpen ? 1 : 0,
            height: isDropdownOpen ? 'auto' : '0',
            transform: isDropdownOpen ? 'scaleY(1)' : 'scaleY(0)',
            transformOrigin: 'top',
            transition: 'opacity 0.3s ease, height 0.3s ease, transform 0.3s ease',
            fontSize: '15px'
          }}
        >
          <Button
            label="Edit Quotation"
            className="p-button-text"
            style={{ marginBottom: '10px', width: '100%', textAlign: 'start' }}
            onClick={() => onEditQuotation(rowData.quotation_no)}
          />
          <Button
            label="Download PDF"
            className="p-button-text"
            style={{ marginBottom: '10px', width: '100%', textAlign: 'start' }}
            onClick={() => handleDownloadPdf(rowData.quotation_code)}
          />
        </div>
      )}
    </div>
  );
};

export default ActionDropdown;
