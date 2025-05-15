import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import Table from '../components/Table';
import { fetchBills, deleteBill } from '../features/billSlice';

function AllBills() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { bills, loading, error } = useSelector(state => state.bills);
  const [filteredBills, setFilteredBills] = useState([]);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    minAmount: '',
    maxAmount: ''
  });

  useEffect(() => {
    dispatch(fetchBills());
  }, [dispatch]);

  useEffect(() => {
    let result = bills;

    // Filter by date range
    if (filters.startDate) {
      result = result.filter(bill => new Date(bill.billDate) >= new Date(filters.startDate));
    }
    if (filters.endDate) {
      result = result.filter(bill => new Date(bill.billDate) <= new Date(filters.endDate));
    }

    // Filter by amount range
    if (filters.minAmount) {
      result = result.filter(bill => bill.amount >= parseFloat(filters.minAmount));
    }
    if (filters.maxAmount) {
      result = result.filter(bill => bill.amount <= parseFloat(filters.maxAmount));
    }

    setFilteredBills(result);
  }, [bills, filters]);

  const columns = [
    { field: 'serialNumber', header: 'S.No.' },
    { field: 'patientName', header: 'Patient Name' },
    { field: 'phone', header: 'Mobile', render: (row) => row.phone || 'N/A' },
    { field: 'guardianName', header: 'Guardian', render: (row) => row.guardianName || 'N/A' },
    { field: 'address', header: 'Address', render: (row) => row.address || 'N/A' },
    { field: 'billDate', header: 'Bill Date', render: (row) => new Date(row.billDate).toLocaleDateString() },
    { field: 'amount', header: 'Amount', render: (row) => `₹${row.amount.toFixed(2)}` },
    {
      field: 'actions',
      header: 'Actions',
      render: (row) => (
        <div className="flex space-x-4">
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/print-invoice?id=${row._id}`);
            }}
            className="text-blue-600 hover:text-blue-800"
          >
            Print
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (window.confirm('Are you sure you want to delete this bill?')) {
                dispatch(deleteBill(row._id))
                  .unwrap()
                  .then(() => {
                    alert('Bill deleted successfully');
                  })
                  .catch((error) => {
                    alert(`Failed to delete bill: ${error.message || 'Unknown error'}`);
                  });
              }
            }}
            className="text-red-600 hover:text-red-800"
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  const handleRowClick = (row) => {
    navigate(`/print-invoice?id=${row.id}`);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Loading and error states
  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-full">
          <p className="text-gray-600">Loading bills...</p>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error.message || 'Failed to load bills'}</span>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">All Bills</h2>
            <button
              onClick={() => navigate('/add-bill-patient')}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Add Bill
            </button>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">Start Date</label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                value={filters.startDate}
                onChange={handleFilterChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              />
            </div>
            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">End Date</label>
              <input
                type="date"
                id="endDate"
                name="endDate"
                value={filters.endDate}
                onChange={handleFilterChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              />
            </div>
            <div>
              <label htmlFor="minAmount" className="block text-sm font-medium text-gray-700">Min Amount</label>
              <input
                type="number"
                id="minAmount"
                name="minAmount"
                value={filters.minAmount}
                onChange={handleFilterChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              />
            </div>
            <div>
              <label htmlFor="maxAmount" className="block text-sm font-medium text-gray-700">Max Amount</label>
              <input
                type="number"
                id="maxAmount"
                name="maxAmount"
                value={filters.maxAmount}
                onChange={handleFilterChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              />
            </div>
          </div>

          <Table
            columns={columns}
            data={filteredBills}
            onRowClick={handleRowClick}
          />
        </div>
      </div>
    </Layout>
  );
}

export default AllBills;
