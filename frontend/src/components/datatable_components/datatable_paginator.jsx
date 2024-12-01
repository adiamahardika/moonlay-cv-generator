import React from 'react';
import { Dropdown } from 'primereact/dropdown';

export const createPaginatorTemplate = ({ rowsPerPage, setRowsPerPage, setFirst, totalRecords, setRefreshTrigger }) => ({
  layout: 'PrevPageLink PageLinks NextPageLink RowsPerPageDropdown',

  PrevPageLink: (options) => (
    <button
      type="button"
      className={`${options.className} paginator-control`}
      style={{ color: options.disabled ? 'gray' : 'inherit' }}
      onClick={options.onClick}
      disabled={options.disabled}
    >
      Prev
    </button>
  ),

  NextPageLink: (options) => (
    <button
      type="button"
      className={`${options.className} paginator-control`}
      style={{ color: options.disabled ? 'gray' : 'inherit' }}
      onClick={options.onClick}
      disabled={options.disabled}
    >
      Next
    </button>
  ),

  RowsPerPageDropdown: (options) => (
    <div className="rowsperpage">
      <span>
        Show
        <Dropdown
          className={`${options.className} dropdown-control`}
          style={{ marginLeft: '10px', marginRight: '10px', fontSize: '12px' }}
          value={rowsPerPage}
          options={options.options}
          onChange={(event) => {
            setRowsPerPage(event.value); // Update rows per page
            setFirst(0); // Reset to the first page
            setRefreshTrigger((prev) => prev + 1); // Trigger refresh
          }}
          placeholder="Select Rows"
          valueTemplate={(option) => option.label}
        />
        from <b>{totalRecords}</b> results
      </span>
    </div>
  )
});
