import React, { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import Layout from '../components/Layout';
import { fetchBillById } from '../features/billSlice';
import { convertToWords } from '../utils/numberToWords';

function PrintInvoice() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const invoiceRef = useRef(null);
  const { currentBill, loading, error } = useSelector(state => state.bills);

  // Add print-specific styles
  useEffect(() => {
    // Add print styles to head
    const style = document.createElement('style');
    style.id = 'print-styles';
    style.innerHTML = `
      @media print {
        body * {
          visibility: hidden;
        }
        #invoice-container, #invoice-container * {
          visibility: visible;
        }
        #invoice-container {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
          padding: 20px;
        }
        .print-button {
          display: none !important;
        }
      }
    `;
    document.head.appendChild(style);

    // Cleanup on unmount
    return () => {
      const printStyle = document.getElementById('print-styles');
      if (printStyle) {
        document.head.removeChild(printStyle);
      }
    };
  }, []);

  const handlePrint = () => {
    if (invoiceRef.current) {
      window.print();
    }
  };

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const id = searchParams.get('id');
    
    console.log('Received invoice ID:', id);
    
    if (!id || id === 'undefined') {
      console.error('Invalid or missing invoice ID');
      // Optionally redirect back to bills page
      navigate('/all-bills');
      return;
    }

    dispatch(fetchBillById(id));
  }, [location, dispatch, navigate]);

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-full">
          <p className="text-gray-600">Loading invoice...</p>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="text-red-600 p-6">
          <p>Error loading invoice: {error}</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div id="invoice-container" ref={invoiceRef} className="bg-white shadow rounded-lg p-6">
        {currentBill ? (
          <div className="invoice-container">
            {/* Header Image */}
            <div className="invoice-header mb-6">
              <img 
                src="/header.jpg" 
                alt="Invoice Header" 
                className="w-full h-auto object-cover"
              />
            </div>

            {/* Invoice Details */}
            <div className="invoice-details">

              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p><strong>S.No.</strong> {currentBill.serialNumber || 'N/A'}</p>
                  <p><strong>Patient Name:</strong> {currentBill.patientName}</p>
                  {currentBill.guardianName && (
                    <p><strong>Father/Husband Name:</strong> {currentBill.guardianName}</p>
                  )}
                  {currentBill.address && (
                    <p><strong>Address:</strong> {currentBill.address}</p>
                  )}
                </div>
                <div className="text-right">
                  <p><strong>Bill Date:</strong> {new Date(currentBill.billDate).toLocaleDateString()}</p>
                </div>
              </div>

              {/* Invoice Line Items Table */}
              <div className="mb-6">
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 p-2 text-left">Description</th>
                      <th className="border border-gray-300 p-2 text-center">HSN Code</th>
                      <th className="border border-gray-300 p-2 text-right">Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-300 p-2">{currentBill.chargeType || 'Medical Services'}</td>
                      <td className="border border-gray-300 p-2 text-center">9993</td>
                      <td className="border border-gray-300 p-2 text-right">₹{currentBill.amount.toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 p-2 font-semibold">Total</td>
                      <td className="border border-gray-300 p-2 text-center">-</td>
                      <td className="border border-gray-300 p-2 text-right font-bold">₹{currentBill.amount.toFixed(2)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

                  {/* Paid Stamp */}
                  <div className="relative">
                    <img 
                      src="/paidstamp.png" 
                      alt="Paid Stamp" 
                      className="absolute -top-10 right-0 w-32 h-auto opacity-70 transform rotate-[-15deg]"
                    />
                  </div>

                  {/* Amount in Words */}
                  <div className="mt-4 p-3 bg-gray-100 rounded">
                    <p className="text-sm font-semibold">
                      <strong>Amount in Words:</strong> {convertToWords(currentBill.amount)}
                    </p>
                  </div>

              <div className="text-center mt-6">
                <button 
                  onClick={handlePrint} 
                  className="print-button bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition"
                >
                  Print Invoice
                </button>
              </div>
            </div>
          </div>
        ) : (
          <p>No invoice details found</p>
        )}
      </div>
    </Layout>
  );
}

export default PrintInvoice;
