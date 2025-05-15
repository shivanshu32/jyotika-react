import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Layout from '../components/Layout';
import { fetchBills } from '../features/billSlice';
import { convertToWords } from '../utils/numberToWords';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Add print-specific styles
const printStyles = `
  @media screen {
    .print-only {
      display: none;
    }
  }
  
  @media print {
    body * {
      visibility: hidden;
    }
    .print-only, .print-only * {
      visibility: visible;
    }
    .print-only {
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      padding: 20px;
    }
    
    /* Ensure full width */
    .invoice-container {
      width: 100% !important;
      max-width: 100% !important;
      box-sizing: border-box !important;
    }
    .no-print {
      display: none !important;
    }
    .invoice-container {
      margin-bottom: 0;
      padding-bottom: 0;
      /* Set fixed height for each invoice to fit exactly 2 per page */
      height: 49.5vh !important;
      max-height: 49.5vh !important;
      overflow: hidden !important;
      page-break-inside: avoid;
      font-size: 0.9em !important;
    }
    /* Force page break after every second invoice */
    .invoice-container:nth-child(2n) {
      page-break-after: always;
    }
    /* Add more compact styling */
    .invoice-header {
      margin-bottom: 5px !important;
    }
    .invoice-details {
      margin-bottom: 5px !important;
    }
    table {
      margin-bottom: 5px !important;
    }
    th, td {
      padding: 2px !important;
      font-size: 0.9em !important;
    }
    img[alt="Invoice Header"] { 
      display: block !important;
      width: 100% !important; 
      max-width: 100% !important;
      height: auto !important;
      max-height: 120px !important;
      margin: 0 auto !important;
      padding: 0 !important;
    }
  }
`;

function BulkPrintInvoice() {
  const dispatch = useDispatch();
  const { bills } = useSelector(state => state.bills);
  const [selectedBillIds, setSelectedBillIds] = useState([]);
  const [selectedBills, setSelectedBills] = useState([]);
  const [startSerialNumber, setStartSerialNumber] = useState('');
  const [endSerialNumber, setEndSerialNumber] = useState('');
  const [filteredBills, setFilteredBills] = useState([]);
  const invoiceRef = useRef(null);

  useEffect(() => {
    dispatch(fetchBills());
  }, [dispatch]);

  useEffect(() => {
    setFilteredBills(bills);
  }, [bills]);

  const handleBillSelect = (billId) => {
    setSelectedBillIds(prev => 
      prev.includes(billId) 
        ? prev.filter(id => id !== billId) 
        : [...prev, billId]
    );
  };

  const handleSerialNumberFilter = () => {
    if (!startSerialNumber && !endSerialNumber) {
      setFilteredBills(bills);
      // Clear selections when no filter is applied
      setSelectedBillIds([]);
      setSelectedBills([]);
      return;
    }

    const start = parseInt(startSerialNumber) || 0;
    const end = parseInt(endSerialNumber) || Number.MAX_SAFE_INTEGER;

    if (start > end) {
      toast.error('Start serial number must be less than or equal to end serial number');
      return;
    }

    const filtered = bills.filter(bill => {
      const serialNumber = bill.serialNumber || 0;
      return serialNumber >= start && serialNumber <= end;
    });

    setFilteredBills(filtered);
    
    // Auto-select all bills in the filtered range
    const filteredIds = filtered.map(bill => bill._id);
    setSelectedBillIds(filteredIds);
    setSelectedBills(filtered);
    
    toast.success(`Auto-selected ${filtered.length} bills in the specified range`);
    
    // If no bills found in range
    if (filtered.length === 0) {
      toast.info('No bills found in the specified range');
    }
  };

  const handleBulkPrint = () => {
    if (selectedBillIds.length > 0) {
      const selectedBillsData = filteredBills.filter(bill => selectedBillIds.includes(bill._id));
      setSelectedBills(selectedBillsData);
      
      // Scroll to the print button
      setTimeout(() => {
        document.getElementById('print-button').scrollIntoView({ behavior: 'smooth' });
        toast.success('Invoices are ready for printing. Click the Print button below.');
      }, 100);
    } else {
      toast.error('Please select at least one invoice to print');
    }
  };

  const handlePrint = () => {
    if (invoiceRef.current) {
      const printContents = invoiceRef.current.innerHTML;
      const originalContents = document.body.innerHTML;
      
      // Use the same approach as single invoice printing
      document.body.innerHTML = `
        <style>
          @media print {
            body { margin: 0; padding: 0; }
            .invoice-container { 
              width: 100%; 
              box-sizing: border-box; 
              padding: 0 !important; 
              height: 49.5vh !important;
              max-height: 49.5vh !important;
              overflow: hidden !important;
              font-size: 0.9em !important;
            }
            /* Force page break after every second invoice */
            .invoice-container:nth-child(2n) {
              page-break-after: always;
            }
            img[alt="Invoice Header"] { 
              display: block !important;
              width: 100% !important; 
              max-width: 100% !important;
              height: auto !important;
              max-height: 120px !important;
              margin: 0 auto !important;
              padding: 0 !important;
            }
          }
        </style>
        ${printContents}
      `;
      window.print();
      
      // Restore the original page content
      document.body.innerHTML = originalContents;
      // Reload the page to restore functionality
      window.location.reload();
    }
  };

  return (
    <Layout>
      <style>{printStyles}</style>
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Bulk Print Invoices</h1>

        {/* Serial Number Range Filter */}
        <div className="bg-white shadow rounded-lg p-4 mb-6">
          <h2 className="text-lg font-semibold mb-3">Filter by Serial Number Range</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
              <label htmlFor="startSerialNumber" className="block text-sm font-medium text-gray-700 mb-1">
                Start Serial Number
              </label>
              <input
                type="number"
                id="startSerialNumber"
                value={startSerialNumber}
                onChange={(e) => setStartSerialNumber(e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                min="1"
              />
            </div>
            <div>
              <label htmlFor="endSerialNumber" className="block text-sm font-medium text-gray-700 mb-1">
                End Serial Number
              </label>
              <input
                type="number"
                id="endSerialNumber"
                value={endSerialNumber}
                onChange={(e) => setEndSerialNumber(e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                min="1"
              />
            </div>
            <div>
              <button
                onClick={handleSerialNumberFilter}
                className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Apply Filter
              </button>
            </div>
          </div>
        </div>

        {/* Bill Selection Table */}
        <div className="mb-4">
          <table className="w-full border-collapse border">
            <thead>
              <tr className="bg-gray-200">
                <th className="border p-2">Select</th>
                <th className="border p-2">S.No.</th>
                <th className="border p-2">Patient Name</th>
                <th className="border p-2">Bill Date</th>
                <th className="border p-2">Amount</th>
              </tr>
            </thead>
            <tbody>
              {filteredBills.map((bill, index) => (
                <tr key={`${bill._id}-${index}`} className="hover:bg-gray-100">
                  <td className="border p-2 text-center">
                    <input 
                      type="checkbox" 
                      checked={selectedBillIds.includes(bill._id)}
                      onChange={() => handleBillSelect(bill._id)}
                    />
                  </td>
                  <td className="border p-2">{bill.serialNumber || 'N/A'}</td>
                  <td className="border p-2">{bill.patientName}</td>
                  <td className="border p-2">{new Date(bill.billDate).toLocaleDateString()}</td>
                  <td className="border p-2">₹{bill.amount.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Bulk Print Button */}
        <div className="mb-4">
          <button 
            onClick={handleBulkPrint}
            disabled={selectedBillIds.length === 0}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
          >
            Prepare Selected Invoices for Printing
          </button>
        </div>

        {/* Print Preview and Print Button */}
        {selectedBills.length > 0 && (
          <div className="bg-white shadow rounded-lg p-4 mb-6">
            <h2 className="text-lg font-semibold mb-3">Ready to Print</h2>
            <p className="mb-4">Your {selectedBills.length} selected invoice(s) are ready for printing.</p>
            <button 
              id="print-button"
              onClick={handlePrint}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Print Invoices
            </button>
          </div>
        )}

        {/* Hidden Print Content */}
        {selectedBills.length > 0 && (
          <div>
            <div ref={invoiceRef} className="print-only">
              {selectedBills.map((bill, index) => (
                <div key={`${bill._id}-${index}`} className="invoice-container bg-white shadow rounded-lg p-0 mb-2" style={{ width: '100%' }}>
                  {/* Header Image */}
                  <div style={{ width: '100%', padding: 0, margin: 0, marginBottom: '5px' }}>
                    <img 
                      src="/header.jpg" 
                      alt="Invoice Header" 
                      style={{ 
                        display: 'block',
                        width: '100%', 
                        maxWidth: '100%',
                        height: 'auto',
                        maxHeight: '120px',
                        margin: '0 auto',
                        padding: 0
                      }}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2 mb-2" style={{ padding: '0 10px' }}>
                    <div>
                      <p><strong>S.No.</strong> {bill.serialNumber || 'N/A'}</p>
                      <p><strong>Patient Name:</strong> {bill.patientName}</p>
                      {bill.guardianName && (
                        <p><strong>Father/Husband Name:</strong> {bill.guardianName}</p>
                      )}
                      {bill.address && (
                        <p><strong>Address:</strong> {bill.address}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p><strong>Bill Date:</strong> {new Date(bill.billDate).toLocaleDateString()}</p>
                    </div>
                  </div>

                  {/* Charge Details Table */}
                  <div style={{ padding: '0 10px' }}>
                    <table className="w-full border-collapse border mb-2">
                      <thead>
                        <tr className="bg-gray-200">
                          <th className="border p-1">Description</th>
                          <th className="border p-1">HSN Code</th>
                          <th className="border p-1">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="border p-1">{bill.chargeType || 'Medical Services'}</td>
                          <td className="border p-1">9993</td>
                          <td className="border p-1">₹{bill.amount.toFixed(2)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Amount in Words */}
                  <div className="mb-2" style={{ padding: '0 10px' }}>
                    <p><strong>Amount in Words:</strong> {convertToWords(bill.amount)}</p>
                  </div>

                  {/* Paid Stamp */}
                  <div className="text-right" style={{ padding: '0 10px 10px' }}>
                    <div className="inline-block border-2 border-green-600 text-green-600 font-bold px-4 py-2 rounded-lg transform rotate-[-15deg]">
                      PAID
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button 
              onClick={handlePrint}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 mt-4"
            >
              Print Selected Invoices
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default BulkPrintInvoice;
