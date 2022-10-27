"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Unknown = void 0;
var runtype_1 = require("../runtype");
var util_1 = require("../util");
var self = { tag: 'unknown' };
/**
 * Validates anything, but provides no new type information about it.
 */
exports.Unknown = runtype_1.create(function (value) { return util_1.SUCCESS(value); }, self);