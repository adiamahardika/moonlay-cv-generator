import React from 'react';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';

interface QuotationTypeFilterProps {
  value: string | null;
  onFilterApply: (value: string | null) => void;
}

const QuotationTypeFilter: React.FC<QuotationTypeFilterProps> = ({ value, onFilterApply }) => {
  const quotationTypes = [
    { label: 'VMS', value: 'VMS' },
    { label: 'BR', value: 'BR' },
    { label: 'PR', value: 'PR' },
  ];

  // Handle resetting the filter
  const handleReset = () => {
    onFilterApply(null); // Reset the filter to no selection
  };

  return (
    <div className="filter-menu">
      <Dropdown
        value={value}
        options={quotationTypes}
        onChange={(e) => onFilterApply(e.value)}
        placeholder="Select Type"
        className="p-column-filter"
        style={{ width: '60%' }}
      />
      {value && (
        <Button
          icon="pi pi-times"
          className="p-button-rounded p-button-secondary"
          onClick={handleReset}
          style={{
            width: '2.7rem', // Smaller size for the button
            height: '2.7rem', // Matches dropdown height
            marginLeft: '10px',
          }}
        />
      )}
    </div>
  );
};

export default QuotationTypeFilter;
