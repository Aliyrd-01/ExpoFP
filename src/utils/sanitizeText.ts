/**
 * Sanitizes the input string by trimming whitespace and removing non-alphanumeric characters.
 *
 * @param {string} str - The input string to sanitize.
 * @returns {string} - The sanitized string containing only alphanumeric characters.
 */
export const sanitizeStr = (str) => str.trim().replace(/[^a-z0-9]/gi, "");

export function sanitizeSearch(input: string, patterns = []): string {
    if (!input) {
        return "";
    }
    const arr = ["utm_", "ref=", "fbclid="].concat(patterns || []);
    const regex = new RegExp(`(^|\\?|&)(${arr.join("|")})[^&]*`, "g");
    return input
        .replace(regex, "")
        .replace(/(^|[?&])([^=&#]+)=(?=&|$)/g, (_match, sep, key) => `${sep}${key}`);
}
