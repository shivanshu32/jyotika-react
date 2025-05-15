import fs from 'fs';
import path from 'path';

const BILLS_FILE_PATH = path.join(process.cwd(), 'bills.json');

/**
 * Read bills from local file
 * @returns {Array} List of bills
 */
export const readBills = () => {
  try {
    if (!fs.existsSync(BILLS_FILE_PATH)) {
      fs.writeFileSync(BILLS_FILE_PATH, JSON.stringify([]));
      return [];
    }
    const data = fs.readFileSync(BILLS_FILE_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading bills:', error);
    return [];
  }
};

/**
 * Write bills to local file
 * @param {Array} bills - List of bills to save
 */
export const writeBills = (bills) => {
  try {
    fs.writeFileSync(BILLS_FILE_PATH, JSON.stringify(bills, null, 2));
  } catch (error) {
    console.error('Error writing bills:', error);
  }
};

/**
 * Add a new bill
 * @param {Object} bill - Bill to add
 * @returns {Object} Added bill
 */
export const addBill = (bill) => {
  const bills = readBills();
  bills.push(bill);
  writeBills(bills);
  return bill;
};

/**
 * Get a bill by ID
 * @param {string} id - Bill ID
 * @returns {Object|null} Found bill or null
 */
export const getBillById = (id) => {
  const bills = readBills();
  return bills.find(bill => bill.id === id) || null;
};

/**
 * Update an existing bill
 * @param {string} id - Bill ID
 * @param {Object} updatedBill - Updated bill data
 * @returns {Object|null} Updated bill or null
 */
export const updateBill = (id, updatedBill) => {
  const bills = readBills();
  const index = bills.findIndex(bill => bill.id === id);
  
  if (index !== -1) {
    bills[index] = { ...bills[index], ...updatedBill };
    writeBills(bills);
    return bills[index];
  }
  
  return null;
};

/**
 * Delete a bill
 * @param {string} id - Bill ID to delete
 * @returns {boolean} Deletion success
 */
export const deleteBill = (id) => {
  const bills = readBills();
  const filteredBills = bills.filter(bill => bill.id !== id);
  
  if (filteredBills.length < bills.length) {
    writeBills(filteredBills);
    return true;
  }
  
  return false;
};
