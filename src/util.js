/**
 * @param {number} ms Amount of milliseconds to sleep.
 * @returns {Promise<void>} A promise that resolves after the specified amount of time.
 */
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Joins a list of paragraphs into a single string.
 * @param {string[]} content 
 * @returns {string}
 */
const joinChapterContent = (content) => content.join("\n\n");

module.exports = {sleep, joinChapterContent}