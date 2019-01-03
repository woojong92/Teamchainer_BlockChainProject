const JSDOM = require('jsdom').JSDOM;
const jsDom = new JSDOM('<html>...</html>');

const { window } = jsDom;
const $ = global.jQuery = require("jquery")(window);

module.exports = $;