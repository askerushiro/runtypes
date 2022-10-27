"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Optional = void 0;
var runtype_1 = require("../runtype");
var util_1 = require("../util");
/**
 * Validates optional value.
 */
function Optional(runtype) {
    var self = { tag: 'optional', underlying: runtype };
    return runtype_1.create(function (value) { return (value === undefined ? util_1.SUCCESS(value) : runtype.validate(value)); }, self);
}
exports.Optional = Optional;