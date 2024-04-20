const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

/**
 * @param {string[]} content 
 * @returns {string}
 */
const joinChapterContent = (content) => content.join("\n\n");