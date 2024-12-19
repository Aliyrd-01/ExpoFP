/**
 * Sanitizes the input string by trimming whitespace and removing non-alphanumeric characters.
 *
 * @param {string} str - The input string to sanitize.
 * @returns {string} - The sanitized string containing only alphanumeric characters.
 */
export const sanitizeStr = (str) => str.trim().replace(/[^a-z0-9]/gi, "");
