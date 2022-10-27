"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Boolean = void 0;
var runtype_1 = require("../runtype");
var util_1 = require("../util");
var self = { tag: 'boolean' };
/**
 * Validates that a value is a boolean.
 */
exports.Boolean = runtype_1.create(function (value) { return (typeof value === 'boolean' ? util_1.SUCCESS(value) : util_1.FAILURE.TYPE_INCORRECT(self, value)); }, self);