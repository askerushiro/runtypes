"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InstanceOf = void 0;
var runtype_1 = require("../runtype");
var util_1 = require("../util");
function InstanceOf(ctor) {
    var self = { tag: 'instanceof', ctor: ctor };
    return runtype_1.create(function (value) { return (value instanceof ctor ? util_1.SUCCESS(value) : util_1.FAILURE.TYPE_INCORRECT(self, value)); }, self);
}
exports.InstanceOf = InstanceOf;