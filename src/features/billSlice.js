import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../utils/api';

// Define the base URL for bills
const BASE_URL = '/bills';

// Use our authenticated API utility
// This handles auth token, error handling, and logging

// Async Thunks for Bill Operations
export const fetchBills = createAsyncThunk(
  'bills/fetchBills',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get(BASE_URL);
      return response.data;
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.message || error.message || 'Failed to fetch bills',
        status: error.response?.status || 500
      });
    }
  }
);

export const fetchBillById = createAsyncThunk(
  'bills/fetchBillById',
  async (billId, { rejectWithValue }) => {
    try {
      const response = await api.get(`${BASE_URL}/${billId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

// Frontend validation utility function
const validateBillData = (billData) => {
  const errors = [];

  // Validate patient name
  if (!billData.patientName || billData.patientName.trim() === '') {
    errors.push('Patient name is required');
  }

  // Validate amount
  const amount = parseFloat(billData.amount);
  if (!billData.amount || isNaN(amount) || amount <= 0) {
    errors.push('Amount must be a positive number');
  }

  // Validate phone number (optional, but if provided must be 10 digits)
  if (billData.phone && !/^[0-9]{10}$/.test(billData.phone)) {
    errors.push('Phone number must be 10 digits');
  }

  // Validate charge type
  const validChargeTypes = ['Consultation', 'Delivery'];
  if (billData.chargeType && !validChargeTypes.includes(billData.chargeType)) {
    errors.push(`Invalid charge type. Must be one of: ${validChargeTypes.join(', ')}`);
  }

  // Validate status
  const validStatuses = ['Pending', 'Paid', 'Overdue'];
  if (billData.status && !validStatuses.includes(billData.status)) {
    errors.push(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
  }

  return errors;
};

export const addBillAsync = createAsyncThunk(
  'bills/addBill',
  async (billData, { rejectWithValue }) => {
    try {
      // Frontend validation
      const validationErrors = validateBillData(billData);
      if (validationErrors.length > 0) {
        return rejectWithValue({
          message: 'Validation failed',
          errors: validationErrors,
          status: 400
        });
      }

      // Prepare bill data with default values and type conversions
      const preparedBillData = {
        ...billData,
        amount: parseFloat(billData.amount),
        billDate: billData.billDate || new Date().toISOString(),
        chargeType: billData.chargeType || 'Other',
        status: billData.status || 'Pending'
      };

      const response = await api.post(BASE_URL, preparedBillData);
      return response.data;
    } catch (error) {
      console.error('Bill creation error:', error);
      
      // Detailed error handling
      if (error.response) {
        return rejectWithValue({
          message: error.response.data.message || 'Server error',
          errors: error.response.data.errors || [],
          status: error.response.status
        });
      } else if (error.request) {
        return rejectWithValue({
          message: 'No response from server. Check your network connection.',
          status: 0
        });
      } else {
        return rejectWithValue({
          message: error.message || 'An unexpected error occurred',
          status: -1
        });
      }
    }
  }
);

export const updateBillAsync = createAsyncThunk(
  'bills/updateBill',
  async ({ id, billData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`${BASE_URL}/${id}`, billData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteBill = createAsyncThunk(
  'bills/deleteBill',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`${BASE_URL}/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Bulk print action
export const fetchBulkPrintBills = createAsyncThunk(
  'bills/fetchBulkPrintBills',
  async (billIds, { rejectWithValue }) => {
    console.warn('Bulk Print Attempt', { billIds });

    const possibleEndpoints = [
      '/bulk-print',
      '/print/bulk',
      '/invoices/bulk-print'
    ];

    // Add full URLs for comprehensive logging
    const fullUrls = possibleEndpoints.map(endpoint => `${BASE_URL}${endpoint}`);
    console.warn('Attempting Bulk Print URLs:', fullUrls);

    for (const endpoint of possibleEndpoints) {
      try {
        console.log(`Attempting bulk print with endpoint: ${endpoint}`, {
          fullUrl: `${BASE_URL}${endpoint}`,
          billIds
        });

        const response = await api.post(`${BASE_URL}${endpoint}`, { billIds });
        
        console.log('Bulk Print Response:', response.data);

        // Ensure we always return an array
        if (Array.isArray(response.data)) {
          return response.data;
        } else if (response.data && response.data.bills) {
          return response.data.bills;
        } else if (response.data && Array.isArray(response.data.data)) {
          return response.data.data;
        } else {
          console.warn('Unexpected response format', response.data);
          continue; // Try next endpoint
        }
      } catch (error) {
        console.warn(`Endpoint ${endpoint} failed:`, {
          message: error.message,
          status: error.response?.status
        });
        
        // If it's a 404, continue to next endpoint
        if (error.response?.status === 404) {
          continue;
        }

        // For other errors, reject
        const errorDetails = {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data
        };

        return rejectWithValue(errorDetails);
      }
    }

    // If all endpoints fail
    throw new Error('No valid bulk print endpoint found');
  }
);

const initialState = {
  bills: [],
  selectedBills: [],
  bulkPrintBills: [],
  bulkPrintLoading: false,
  bulkPrintError: null,
  currentBill: null,
  loading: false,
  error: null,
};

const billSlice = createSlice({
  name: 'bills',
  initialState,
  reducers: {
    selectBill: (state, action) => {
      state.selectedBills.push(action.payload);
    },
    unselectBill: (state, action) => {
      state.selectedBills = state.selectedBills.filter(id => id !== action.payload);
    },
    clearSelectedBills: (state) => {
      state.selectedBills = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Delete bill reducers
      .addCase(deleteBill.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteBill.fulfilled, (state, action) => {
        state.loading = false;
        state.bills = state.bills.filter(bill => bill._id !== action.payload);
      })
      .addCase(deleteBill.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchBills.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBills.fulfilled, (state, action) => {
        state.loading = false;
        state.bills = action.payload;
      })
      .addCase(fetchBills.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchBillById.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.currentBill = null;
      })
      .addCase(fetchBillById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentBill = action.payload;
      })
      .addCase(fetchBillById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(addBillAsync.fulfilled, (state, action) => {
        state.bills.push(action.payload);
      })
      .addCase(updateBillAsync.fulfilled, (state, action) => {
        const index = state.bills.findIndex(b => b._id === action.payload._id);
        if (index !== -1) {
          state.bills[index] = action.payload;
        }
      })

      .addCase(fetchBulkPrintBills.pending, (state) => {
        state.bulkPrintLoading = true;
        state.bulkPrintError = null;
        state.bulkPrintBills = [];
      })
      .addCase(fetchBulkPrintBills.fulfilled, (state, action) => {
        state.bulkPrintLoading = false;
        state.bulkPrintBills = action.payload;
      })
      .addCase(fetchBulkPrintBills.rejected, (state, action) => {
        state.bulkPrintLoading = false;
        state.bulkPrintError = action.payload;
      });
  },
});

export const {
  selectBill,
  unselectBill,
  clearSelectedBills,
} = billSlice.actions;

export default billSlice.reducer;
