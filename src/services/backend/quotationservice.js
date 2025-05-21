import axios from 'axios';

const apiBase = import.meta.env.VITE_API_BASE;

// Helper to clean and parse numeric values
const parseNumber = (value) => {
  if (typeof value === 'string') {
    const cleanedValue = value.replace(/[.,]/g, ''); // Remove periods and commas
    return parseFloat(cleanedValue);
  }
  return value;
};

// Fetch quotation data from the API and process it
export const fetchQuotationData = async (quotationNo) => {
  try {
    const response = await axios.get(`${apiBase}/get-quotation/${quotationNo}`);

    // Log the response to verify structure
    console.log('API Response:', response.data);

    const { quotation = [], expenses = [], tos = [] } = response.data;

    if (quotation.length === 0) {
      throw new Error('Quotation data is missing or malformed.');
    }

    // Parse quotation data
    const quotationData = {
      quotation_type: quotation[1] || 'VMS',
      quotation_solution: quotation[2] || '',
      quotation_code: quotation[3] || '',
      quotation_pic: quotation[4] || '',
      quotation_pt: quotation[5] || '',
      quotation_customer: quotation[6] || '',
      quotation_customeraddress: quotation[7] || '',
      quotation_subtotal: parseNumber(quotation[8]) || '',
      quotation_managementfee: parseNumber(quotation[9]) || '0',
      quotation_ppn: parseNumber(quotation[10]) || '',
      quotation_grandtotal: parseNumber(quotation[11]) || '',
      quotation_createdate: quotation[12] || '',
      quotation_validdate: quotation[13] || '',
      quotation_email: quotation[15] || ''
    };

    // Parse expense data
    const expenseList = expenses.map((exp) => ({
      expense_description: exp[2] || '',
      expense_total: parseNumber(exp[3]) || '',
      expense_discount: parseNumber(exp[4]) || '0',
      expense_linecount: exp[5] || ''
    }));

    // Parse terms of service data
    const tosList = tos.map((tosItem) => ({
      tos_description: tosItem[2] || ''
    }));

    return { quotationData, expenseList, tosList };
  } catch (error) {
    console.error('Error fetching quotation data:', error);
    throw error; // Rethrow to let the caller handle it
  }
};

// API call to create a new quotation
export const createQuotation = async (data) => {
  try {
    const response = await axios.post(`${apiBase}/create_quotation`, data);
    return response.data; // Return only the response data
  } catch (error) {
    console.error('Error creating quotation:', error);
    throw error; // Let the caller handle errors
  }
};

export const deleteQuotations = async (idToDelete) => {
  try {
    const response = await axios.post(`${apiBase}/delete-quotations`, {
      quotationno: idToDelete,
      visibility: false
    });
    return response.data; // Return data if needed
  } catch (error) {
    console.error('Error deleting records:', error);
    throw error; // Rethrow to let the caller handle errors
  }
};

export const updateQuotation = async (url, data) => {
  try {
    const response = await axios.post(url, data);
    return response.data;
  } catch (error) {
    console.error('Error updating quotation:', error);
    throw error; // Propagate the error to the calling function
  }
};
