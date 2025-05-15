// Utility function to convert numbers to Indian Rupees in words
export const convertToWords = (number) => {
  const units = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
    'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'
  ];
  const tens = [
    '', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'
  ];

  // Handle negative numbers
  if (number < 0) return `Minus ${convertToWords(Math.abs(number))}`;

  // Handle zero
  if (number === 0) return 'Zero';

  // Split into integer and decimal parts
  const [integerPart, decimalPart] = number.toFixed(2).split('.');
  const num = parseInt(integerPart, 10);
  const decimal = parseInt(decimalPart, 10);

  const convertLessThanThousand = (n) => {
    if (n === 0) return '';
    
    if (n < 20) return units[n];
    
    if (n < 100) {
      return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + units[n % 10] : '');
    }
    
    return units[Math.floor(n / 100)] + ' Hundred' + 
           (n % 100 !== 0 ? ' and ' + convertLessThanThousand(n % 100) : '');
  };

  const convertCrores = (n) => {
    if (n === 0) return '';
    return convertLessThanThousand(Math.floor(n / 10000000)) + 
           (Math.floor(n / 10000000) > 0 ? ' Crore ' : '') +
           convertLakhs(n % 10000000);
  };

  const convertLakhs = (n) => {
    if (n === 0) return '';
    return convertLessThanThousand(Math.floor(n / 100000)) + 
           (Math.floor(n / 100000) > 0 ? ' Lakh ' : '') +
           convertThousands(n % 100000);
  };

  const convertThousands = (n) => {
    if (n === 0) return '';
    return convertLessThanThousand(Math.floor(n / 1000)) + 
           (Math.floor(n / 1000) > 0 ? ' Thousand ' : '') +
           convertLessThanThousand(n % 1000);
  };

  const words = convertCrores(num).trim();
  const decimalWords = decimal > 0 ? ` and ${convertLessThanThousand(decimal)} Paise` : '';

  return `${words}${decimalWords} Rupees Only`;
};
