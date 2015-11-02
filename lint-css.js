'use strict';

var stylelint = require('stylelint');
var log = require('npmlog');

function lint(callback) {
  log.info('css', 'Lint starting...');
  return stylelint
    .lint({
      files: 'src/**/*.css',
      formatter: 'string'
    })
    .then(function handleResults(data) {
      if (data.errored) {
        throw new Error(data.output);
      } else {
        if (data.output) {
          log.warn('css', data.output);
        }
        if (callback) {
          callback();
        }
      }
    })
    .catch(function handleErrors(err) {
      log.error('css', err.stack);
    });
}

if (require.main === module) {
  lint();
} else {
  module.exports = lint;
}
