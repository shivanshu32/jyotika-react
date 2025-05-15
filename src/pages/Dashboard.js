import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import Table from '../components/Table';
import { fetchBills } from '../features/billSlice';

function Dashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { bills, loading, error } = useSelector(state => state.bills);

  useEffect(() => {
    dispatch(fetchBills());
  }, [dispatch]);

  const columns = [
    { field: 'patientName', header: 'Patient Name' },
    { field: 'phone', header: 'Mobile', render: (row) => row.phone || 'N/A' },
    { field: 'guardianName', header: 'Guardian', render: (row) => row.guardianName || 'N/A' },
    { field: 'address', header: 'Address', render: (row) => row.address || 'N/A' },
    { field: 'amount', header: 'Amount', render: (row) => `₹${row.amount}` },
    {
      field: 'actions',
      header: 'Actions',
      render: (row) => {
        console.log('Row for print button:', row);
        return (
          <div className="flex space-x-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                // Use _id or another unique identifier if id is not present
                const billId = row._id || row.id || row.billId;
                console.log('Navigating with billId:', billId);
                if (billId) {
                  navigate(`/print-invoice?id=${billId}`);
                } else {
                  console.error('No valid bill ID found', row);
                }
              }}
              className="text-blue-600 hover:text-blue-800"
            >
              Print
            </button>
          </div>
        );
      },
    },
  ];

  const handleRowClick = (row) => {
    console.log('Row clicked:', row);
    const billId = row._id || row.id || row.billId;
    if (billId) {
      navigate(`/print-invoice?id=${billId}`);
    } else {
      console.error('No valid bill ID found', row);
    }
  };

  // Calculate total revenue
  const totalRevenue = bills.reduce((sum, bill) => sum + (bill.amount || 0), 0);

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-blue-100 p-6 rounded-lg">
            <h2 className="text-lg font-semibold text-blue-800 mb-2">Total Bills</h2>
            <p className="text-3xl font-bold text-blue-600">{bills.length}</p>
          </div>
          <div className="bg-green-100 p-6 rounded-lg">
            <h2 className="text-lg font-semibold text-green-800 mb-2">Paid Bills</h2>
            <p className="text-3xl font-bold text-green-600">
              {bills.filter(bill => bill.status === 'Paid').length}
            </p>
          </div>
          <div className="bg-purple-100 p-6 rounded-lg">
            <h2 className="text-lg font-semibold text-purple-800 mb-2">Total Revenue</h2>
            <p className="text-3xl font-bold text-purple-600">₹{totalRevenue.toFixed(2)}</p>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Recent Bills</h2>
            <button
              onClick={() => navigate('/add-bill-patient')}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Add Bill
            </button>
          </div>
          <Table
            columns={columns}
            data={bills}
            onRowClick={handleRowClick}
          />
        </div>
      </div>
    </Layout>
  );
}

export default Dashboard;
