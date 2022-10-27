"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Dictionary = void 0;
var runtype_1 = require("../runtype");
var string_1 = require("./string");
var constraint_1 = require("./constraint");
var show_1 = require("../show");
var util_1 = require("../util");
var NumberKey = constraint_1.Constraint(string_1.String, function (s) { return !isNaN(+s); }, { name: 'number' });
function Dictionary(value, key) {
    var keyRuntype = key === undefined
        ? string_1.String
        : key === 'string'
            ? string_1.String
            : key === 'number'
                ? NumberKey
                : key;
    var keyString = show_1.default(keyRuntype);
    var self = { tag: 'dictionary', key: keyString, value: value };
    return runtype_1.create(function (x, visited) {
        if (x === null || x === undefined || typeof x !== 'object')
            return util_1.FAILURE.TYPE_INCORRECT(self, x);
        if (Object.getPrototypeOf(x) !== Object.prototype)
            if (!Array.isArray(x) || keyString === 'string')
                return util_1.FAILURE.TYPE_INCORRECT(self, x);
        var numberString = /^(?:NaN|-?\d+(?:\.\d+)?)$/;
        var keys = util_1.enumerableKeysOf(x);
        var results = keys.reduce(function (results, key) {
            // We should provide interoperability with `number` and `string` here,
            // as a user would expect JavaScript engines to convert numeric keys to
            // string keys automatically. So, if the key can be interpreted as a
            // decimal number, then test it against a `Number` OR `String` runtype.
            var isNumberLikeKey = typeof key === 'string' && numberString.test(key);
            var keyInterop = isNumberLikeKey ? globalThis.Number(key) : key;
            if (isNumberLikeKey
                ? !keyRuntype.guard(keyInterop) && !keyRuntype.guard(key)
                : !keyRuntype.guard(keyInterop)) {
                results[key] = util_1.FAILURE.KEY_INCORRECT(self, keyRuntype.reflect, keyInterop);
            }
            else
                results[key] = runtype_1.innerValidate(value, x[key], visited);
            return results;
        }, {});
        var details = keys.reduce(function (details, key) {
            var result = results[key];
            if (!result.success)
                details[key] = result.details || result.message;
            return details;
        }, {});
        if (util_1.enumerableKeysOf(details).length !== 0)
            return util_1.FAILURE.CONTENT_INCORRECT(self, details);
        else
            return util_1.SUCCESS(x);
    }, self);
}
exports.Dictionary = Dictionary;