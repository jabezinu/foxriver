/**
 * Formats a number with commas separator and limits to 2 decimal places.
 * @param {number|string} number - The number to format.
 * @returns {string} The formatted number string (e.g., "100,000.00").
 */
export const formatNumber = (number) => {
    if (number === undefined || number === null) return "0";
    const num = parseFloat(number);
    if (isNaN(num)) return "0";
    return num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};
