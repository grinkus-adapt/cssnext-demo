'use strict';

var utils = require('stylelint').utils;
var ruleName = 'block-as-partial';
var path = require('path');

var messages = utils.ruleMessages(ruleName, {
  rejectedName: 'Expected filename to match selector',
  rejectedMultipleDeclarations: 'Expected single root declaration per file'
});

module.exports = function lint(expectationKeyword, options) {
  var options = options || {};

  return function lintRules(root, result) {
    var previousFile;

    utils.validateOptions(
      result,
      ruleName,
      {
        actual: expectationKeyword,
        possible: ['always']
      }
    );

    utils.validateOptions(
      result,
      ruleName,
      {
        actual: options,
        possible: {
          skip: [function validateOptionSkip(x) {
            function isString(input) {
              if (typeof input === 'string') {
                return true;
              }
              return false;
            }

            if (!x) {
              return true;
            }

            if (Array.isArray(x)) {
              x.forEach(function checkIfString(member) {
                return isString(member);
              });
              return true;
            }

            return isString(x);
          }]
        }
      }
    );

    root.walkRules(function lintRule(rule) {
      var inputFile = rule.source.input.file;
      var filename = path.basename(inputFile);
      var name = filename.split('.')[0];
      var selectorRegex = new RegExp('^[#\.%]' + name + '$');
      var skip;

      function checkIfSkipped(filepath) {
        if (inputFile === path.resolve(process.cwd(), filepath)) {
          return true;
        }
        return false;
      }

      if (options.skip) {
        if (Array.isArray(options.skip)) {
          skip = options.skip.some(checkIfSkipped);
        } else {
          skip = checkIfSkipped(options.skip);
        }
      }

      if (skip) {
        return;
      }

      if (rule.parent.type !== 'root') {
        return;
      }

      if (!rule.selector) {
        return;
      }

      if (!rule.selector.match(selectorRegex)) {
        utils.report({
          message: messages.rejectedName,
          node: rule,
          result: result,
          ruleName: ruleName
        });
      }

      if (previousFile && previousFile === rule.source.input.file) {
        utils.report({
          message: messages.rejectedMultipleDeclarations,
          node: rule,
          result: result,
          ruleName: ruleName
        });
      }

      previousFile = rule.source.input.file;
    });
  };
};

module.exports.ruleName = ruleName;
