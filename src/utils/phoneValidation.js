/**
 * Validates phone number to ensure it has a maximum of 10 digits
 * @param {string} phoneNumber - The phone number to validate
 * @returns {boolean} - True if valid, false otherwise
 */
export const validatePhoneNumber = (phoneNumber) => {
  // Remove any non-digit characters
  const digitsOnly = phoneNumber.replace(/\D/g, '');
  
  // Check if the number of digits is exactly 10
  return digitsOnly.length === 10;
}

/**
 * Formats phone number to standard format
 * @param {string} phoneNumber - The phone number to format
 * @returns {string} - Formatted phone number or original input if invalid
 */
export const formatPhoneNumber = (phoneNumber) => {
  // Remove any non-digit characters
  const digitsOnly = phoneNumber.replace(/\D/g, '');
  
  // If not exactly 10 digits, return original input
  if (digitsOnly.length !== 10) {
    return phoneNumber;
  }
  
  // Format as (XXX) XXX-XXXX
  return `(${digitsOnly.slice(0,3)}) ${digitsOnly.slice(3,6)}-${digitsOnly.slice(6)}`;
}
