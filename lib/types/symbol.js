"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Symbol = void 0;
var runtype_1 = require("../runtype");
var util_1 = require("../util");
var f = function (key) {
    var self = { tag: 'symbol', key: key };
    return runtype_1.create(function (value) {
        if (typeof value !== 'symbol')
            return util_1.FAILURE.TYPE_INCORRECT(self, value);
        else {
            var keyForValue = globalThis.Symbol.keyFor(value);
            if (keyForValue !== key)
                return util_1.FAILURE.VALUE_INCORRECT('symbol key', quoteIfPresent(key), quoteIfPresent(keyForValue));
            else
                return util_1.SUCCESS(value);
        }
    }, self);
};
var self = { tag: 'symbol' };
/**
 * Validates that a value is a symbol, regardless of whether it is keyed or not.
 */
exports.Symbol = runtype_1.create(function (value) { return (typeof value === 'symbol' ? util_1.SUCCESS(value) : util_1.FAILURE.TYPE_INCORRECT(self, value)); }, Object.assign(f, self));
var quoteIfPresent = function (key) { return (key === undefined ? 'undefined' : "\"" + key + "\""); };