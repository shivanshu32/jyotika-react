import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { addBillAsync } from '../features/billSlice';

const AddBillPatient = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const bills = useSelector(state => state.bills.bills);

  const [formData, setFormData] = useState({
    serialNo: '',
    name: '',
    guardianName: '',
    phone: '',
    address: 'Mainpuri',
    date: new Date().toISOString().split('T')[0],
    chargeType: 'Consultation',
    amount: '300'
  });

  const [formErrors, setFormErrors] = useState([]);

  useEffect(() => {
    const nextSerialNo = bills.length + 1;
    setFormData(prev => ({
      ...prev,
      serialNo: nextSerialNo.toString().padStart(3, '0')
    }));
  }, [bills.length]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setFormErrors([]);

    const billData = {
      id: Date.now().toString(),
      ...formData,
      billDate: formData.date,
      patientName: formData.name,
      status: 'Pending',
      amount: parseFloat(formData.amount)
    };

    try {
      const result = await dispatch(addBillAsync(billData));

      if (addBillAsync.rejected.match(result)) {
        const errors = result.payload?.errors || [];
        setFormErrors(errors);
        
        window.scrollTo(0, 0);
        return;
      }

      navigate('/');
    } catch (error) {
      console.error('Failed to add bill:', error);
      
      setFormErrors([error.message || 'An unexpected error occurred']);
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-lg px-8 py-6 sm:px-10">
          <div className="border-b border-gray-200 pb-4 mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Add New Bill</h2>
            <p className="mt-1 text-sm text-gray-600">Enter the patient and billing details below</p>
          </div>
          
          {formErrors.length > 0 && (
            <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
              <strong className="font-bold block mb-2">Validation Errors:</strong>
              <ul className="list-disc list-inside">
                {formErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Serial Number */}
              <div>
                <label htmlFor="serialNo" className="block text-sm font-semibold text-gray-700 mb-1">
                  S.No.
                </label>
                <input
                  type="text"
                  id="serialNo"
                  name="serialNo"
                  value={formData.serialNo}
                  readOnly
                  className="mt-1 block w-full rounded-md border-2 border-gray-300 bg-gray-50 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>
              {/* Date */}
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  required
                  value={formData.date}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm transition duration-150 ease-in-out hover:border-gray-400"
                />
              </div>
              {/* Charge Type */}
              <div>
                <label htmlFor="chargeType" className="block text-sm font-medium text-gray-700 mb-1">
                  Charge Type
                </label>
                <select
                  id="chargeType"
                  name="chargeType"
                  value={formData.chargeType}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm transition duration-150 ease-in-out hover:border-gray-400"
                >
                  <option value="Consultation">Consultation</option>
                  <option value="Delivery">Delivery</option>
                </select>
              </div>

              {/* Amount */}
              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                  Amount
                </label>
                <input
                  type="number"
                  id="amount"
                  name="amount"
                  required
                  min="0"
                  step="0.01"
                  value={formData.amount}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm transition duration-150 ease-in-out hover:border-gray-400"
                />
              </div>

              {/* Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  minLength={2}
                  maxLength={50}
                  value={formData.name}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm transition duration-150 ease-in-out hover:border-gray-400"
                  placeholder="Patient Name"
                />
              </div>

              {/* Guardian Name */}
              <div>
                <label htmlFor="guardianName" className="block text-sm font-medium text-gray-700 mb-1">
                  Husband/Father Name
                </label>
                <input
                  type="text"
                  id="guardianName"
                  name="guardianName"
                  value={formData.guardianName}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm transition duration-150 ease-in-out hover:border-gray-400"
                  placeholder="Husband/Father Name"
                />
              </div>

              {/* Phone */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  pattern="[0-9]{10}"
                  minLength={10}
                  maxLength={10}
                  className="mt-1 block w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm transition duration-150 ease-in-out hover:border-gray-400"
                  placeholder="10-digit Phone Number"
                />
              </div>

              {/* Address */}
              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <textarea
                  id="address"
                  name="address"
                  required
                  rows="3"
                  value={formData.address}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm transition duration-150 ease-in-out hover:border-gray-400"
                  placeholder="Patient Address"
                />
              </div>
            </div>

            <div className="mt-6">
              <button 
                type="submit" 
                className="w-full px-4 py-2 tracking-wide text-white transition-colors duration-200 transform bg-blue-600 rounded-md hover:bg-blue-500 focus:outline-none focus:bg-blue-500"
              >
                Create Bill
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default AddBillPatient;
