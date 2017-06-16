const path = require('path');
const fs = require('fs')
const dsvFormat = require('d3-dsv').dsvFormat;

module.exports = {
  process(src, filename, config, options) {
    console.log('csv loader')

    const text = fs.readFileSync(filename, {encoding: 'utf8'})
    const delimiter = ',';
    const dsv = dsvFormat(delimiter);
    const rows = undefined;
    const res = rows ? dsv.parseRows(text) : dsv.parse(text);

    return 'var res = ' + JSON.stringify(res) + ';' +
      'res.columns = ' + JSON.stringify(res.columns) + ';' +
      'module.exports = res;';
  },
};