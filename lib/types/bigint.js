"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BigInt = void 0;
var runtype_1 = require("../runtype");
var util_1 = require("../util");
var self = { tag: 'bigint' };
/**
 * Validates that a value is a bigint.
 */
exports.BigInt = runtype_1.create(function (value) { return (typeof value === 'bigint' ? util_1.SUCCESS(value) : util_1.FAILURE.TYPE_INCORRECT(self, value)); }, self);