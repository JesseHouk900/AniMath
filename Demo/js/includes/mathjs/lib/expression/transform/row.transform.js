'use strict';

var errorTransform = require('./error.transform').transform;
/**
 * Attach a transform function to matrix.row
 * Adds a property transform containing the transform function.
 *
 * This transform changed the last `index` parameter of function row
 * from zero-based to one-based
 */


function factory(type, config, load, typed) {
  var row = load(require('../../function/matrix/row')); // @see: comment of row itself

  return typed('row', {
    '...any': function any(args) {
      // change last argument from zero-based to one-based
      var lastIndex = args.length - 1;
      var last = args[lastIndex];

      if (type.isNumber(last)) {
        args[lastIndex] = last - 1;
      }

      try {
        return row.apply(null, args);
      } catch (err) {
        throw errorTransform(err);
      }
    }
  });
}

exports.name = 'row';
exports.path = 'expression.transform';
exports.factory = factory;