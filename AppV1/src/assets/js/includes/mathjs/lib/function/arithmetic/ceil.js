'use strict';

var deepMap = require('../../utils/collection/deepMap');

var nearlyEqual = require('../../utils/number').nearlyEqual;

var bigNearlyEqual = require('../../utils/bignumber/nearlyEqual');

function factory(type, config, load, typed) {
  var round = load(require('../../function/arithmetic/round'));
  /**
   * Round a value towards plus infinity
   * If `x` is complex, both real and imaginary part are rounded towards plus infinity.
   * For matrices, the function is evaluated element wise.
   *
   * Syntax:
   *
   *    math.ceil(x)
   *
   * Examples:
   *
   *    math.ceil(3.2)               // returns number 4
   *    math.ceil(3.8)               // returns number 4
   *    math.ceil(-4.2)              // returns number -4
   *    math.ceil(-4.7)              // returns number -4
   *
   *    const c = math.complex(3.2, -2.7)
   *    math.ceil(c)                 // returns Complex 4 - 2i
   *
   *    math.ceil([3.2, 3.8, -4.7])  // returns Array [4, 4, -4]
   *
   * See also:
   *
   *    floor, fix, round
   *
   * @param  {number | BigNumber | Fraction | Complex | Array | Matrix} x  Number to be rounded
   * @return {number | BigNumber | Fraction | Complex | Array | Matrix} Rounded value
   */

  var ceil = typed('ceil', {
    'number': function number(x) {
      if (nearlyEqual(x, round(x), config.epsilon)) {
        return round(x);
      } else {
        return Math.ceil(x);
      }
    },
    'Complex': function Complex(x) {
      return x.ceil();
    },
    'BigNumber': function BigNumber(x) {
      if (bigNearlyEqual(x, round(x), config.epsilon)) {
        return round(x);
      } else {
        return x.ceil();
      }
    },
    'Fraction': function Fraction(x) {
      return x.ceil();
    },
    'Array | Matrix': function ArrayMatrix(x) {
      // deep map collection, skip zeros since ceil(0) = 0
      return deepMap(x, ceil, true);
    }
  });
  ceil.toTex = {
    1: "\\left\\lceil${args[0]}\\right\\rceil"
  };
  return ceil;
}

exports.name = 'ceil';
exports.factory = factory;