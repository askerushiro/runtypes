"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.String = void 0;
var runtype_1 = require("../runtype");
var util_1 = require("../util");
var self = { tag: 'string' };
/**
 * Validates that a value is a string.
 */
exports.String = runtype_1.create(function (value) { return (typeof value === 'string' ? util_1.SUCCESS(value) : util_1.FAILURE.TYPE_INCORRECT(self, value)); }, self);