const googleIt = require('google-it');

const get = async (query, limit) => {
    try {
        const result = await googleIt({ query, limit });
        return result;
    } catch (error) {
        throw new Error(`Error saat melakukan pencarian Google: ${error.message}`);
    }
}

module.exports = { get };