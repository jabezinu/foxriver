/**
 * Formats a number with commas separator.
 * @param {number|string} number - The number to format.
 * @returns {string} The formatted number string (e.g., "100,000").
 */
export const formatNumber = (number) => {
    if (number === undefined || number === null) return "0";
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};
