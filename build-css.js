'use strict';

var fs = require('fs');
var argv = require('minimist')(process.argv.slice(2), {
  alias: {
    'w': 'watch'
  }
});
var log = require('npmlog');
var postcss = require('postcss');
var cssnext = require('postcss-cssnext');
var atImport = require('postcss-import');
var watch = require('watch');

function generateCss(inFile, outFile) {
  var startTime = new Date();
  var css = fs.readFileSync('src/style.css');
  var endTime;

  postcss()
    .use(atImport())
    .use(cssnext)
    .process(css, { from: inFile, to: outFile })
    .then(function handleResult(result) {
      fs.writeFileSync(outFile, result.css);
      if (result.map) {
        fs.writeFileSync(outFile + '.map', result.map);
      }
      endTime = new Date();
      log.info('css', 'File %s parsed and %s generated in %sms', inFile, outFile, endTime - startTime);
    });
}

generateCss('src/style.css', 'style.css');

if (argv.w) {
  watch.watchTree(
    'src',
    {
      'ignoreDotFiles': true
    },
    function handleChanges(f) {
      if (typeof f === 'string') {
        generateCss(f, f.replace('src/', ''));
      }
    }
  );
}
