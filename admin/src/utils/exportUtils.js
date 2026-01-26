/**
 * Utility to export data to CSV and trigger download in browser
 * @param {Array} data - Array of objects containing row data
 * @param {Array} headers - Array of strings for CSV header row
 * @param {string} filename - Desired filename for the export
 */
export const exportToCSV = (data, headers, filename) => {
    // Escape special characters and wrap in quotes for CSV safety
    const formatValue = (val) => {
        if (val === null || val === undefined) return '';
        const stringVal = String(val);
        if (stringVal.includes(',') || stringVal.includes('"') || stringVal.includes('\n')) {
            return `"${stringVal.replace(/"/g, '""')}"`;
        }
        return stringVal;
    };

    // Create CSV content
    const csvRows = [
        headers.join(','), // Header row
        ...data.map(row => 
            headers.map(header => formatValue(row[header] || '')).join(',')
        )
    ];
    
    const csvString = csvRows.join('\n');
    
    // Create blob and download link
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
};
