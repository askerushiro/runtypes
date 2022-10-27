"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Number = void 0;
var runtype_1 = require("../runtype");
var util_1 = require("../util");
var self = { tag: 'number' };
/**
 * Validates that a value is a number.
 */
exports.Number = runtype_1.create(function (value) { return (typeof value === 'number' ? util_1.SUCCESS(value) : util_1.FAILURE.TYPE_INCORRECT(self, value)); }, self);