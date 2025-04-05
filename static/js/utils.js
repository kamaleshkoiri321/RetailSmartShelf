/**
 * Calculate the number of days between two dates
 * @param {Date} startDate - The start date
 * @param {Date} endDate - The end date
 * @returns {number} - The number of days between the dates
 */
function getDaysDifference(startDate, endDate) {
    // Convert both dates to milliseconds since epoch
    const startMs = startDate.getTime();
    const endMs = endDate.getTime();
    
    // Calculate difference in milliseconds
    const differenceMs = endMs - startMs;
    
    // Convert to days and round to nearest integer
    return Math.floor(differenceMs / (1000 * 60 * 60 * 24));
}

/**
 * Format a date string in YYYY-MM-DD format to a more readable format
 * @param {string} dateString - Date string in YYYY-MM-DD format
 * @returns {string} - Formatted date string
 */
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

/**
 * Generate a random string of specified length
 * @param {number} length - The length of the string to generate
 * @returns {string} - Random string
 */
function generateRandomString(length = 8) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        result += characters.charAt(randomIndex);
    }
    
    return result;
}
