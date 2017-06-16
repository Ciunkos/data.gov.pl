const path = require('path');
const fs = require('fs')

module.exports = {
  process(src, filename, config, options) {
    console.log('raw loader')
    return 'module.exports = ' + JSON.stringify(fs.readFileSync(filename, {encoding: 'utf8'})) + ';';
  },
};