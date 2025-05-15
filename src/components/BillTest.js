import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { addBillAsync } from '../features/billSlice';

const BillTest = () => {
  const dispatch = useDispatch();
  const [billData, setBillData] = useState({
    invoiceNumber: `INV-${Date.now()}`,
    customerName: 'Test Customer',
    amount: 100.50,
    date: new Date().toISOString(),
    items: [
      { 
        description: 'Test Item', 
        quantity: 1, 
        unitPrice: 100.50 
      }
    ]
  });

  const handleAddBill = async () => {
    try {
      const result = await dispatch(addBillAsync(billData)).unwrap();
      console.log('Bill added successfully:', result);
      alert('Bill added successfully!');
    } catch (error) {
      console.error('Failed to add bill:', error);
      alert(`Failed to add bill: ${error.message}`);
    }
  };

  return (
    <div>
      <h2>Add Test Bill</h2>
      <button onClick={handleAddBill}>Add Test Bill</button>
    </div>
  );
};

export default BillTest;
