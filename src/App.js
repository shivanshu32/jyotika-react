import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import AddBillPatient from './pages/AddBillPatient';
import AllBills from './pages/AllBills';
import PrintInvoice from './pages/PrintInvoice';
import BulkPrintInvoice from './pages/BulkPrintInvoice';
import Login from './pages/Login';
import PrivateRoute from './components/PrivateRoute';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        {/* Protected Routes */}
        <Route element={<PrivateRoute />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/add-bill-patient" element={<AddBillPatient />} />
          <Route path="/print-invoice" element={<PrintInvoice />} />
          <Route path="/print-multiple-invoice" element={<BulkPrintInvoice />} />
          <Route path="/all-bills" element={<AllBills />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
