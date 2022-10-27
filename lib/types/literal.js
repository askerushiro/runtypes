"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Nullish = exports.Null = exports.Undefined = exports.Literal = exports.literal = void 0;
var runtype_1 = require("../runtype");
var util_1 = require("../util");
var union_1 = require("./union");
/**
 * Be aware of an Array of Symbols `[Symbol()]` which would throw "TypeError: Cannot convert a Symbol value to a string"
 */
function literal(value) {
    return Array.isArray(value)
        ? String(value.map(String))
        : typeof value === 'bigint'
            ? String(value) + 'n'
            : String(value);
}
exports.literal = literal;
/**
 * Construct a runtype for a type literal.
 */
function Literal(valueBase) {
    var self = { tag: 'literal', value: valueBase };
    return runtype_1.create(function (value) {
        return value === valueBase
            ? util_1.SUCCESS(value)
            : util_1.FAILURE.VALUE_INCORRECT('literal', "`" + literal(valueBase) + "`", "`" + literal(value) + "`");
    }, self);
}
exports.Literal = Literal;
/**
 * An alias for Literal(undefined).
 */
exports.Undefined = Literal(undefined);
/**
 * An alias for Literal(null).
 */
exports.Null = Literal(null);
/**
 * An alias for `Union(Null, Undefined)`.
 */
exports.Nullish = union_1.Union(exports.Null, exports.Undefined);