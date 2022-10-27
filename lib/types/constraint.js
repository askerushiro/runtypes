"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Guard = exports.Constraint = void 0;
var runtype_1 = require("../runtype");
var util_1 = require("../util");
var unknown_1 = require("./unknown");
function Constraint(underlying, constraint, options) {
    var name = options && options.name;
    var args = options && options.args;
    var self = {
        tag: 'constraint',
        underlying: underlying,
        constraint: constraint,
        name: name,
        args: args,
    };
    return runtype_1.create(function (value) {
        var result = underlying.validate(value);
        if (!result.success)
            return result;
        var message = constraint(result.value);
        if (typeof message === 'string')
            return util_1.FAILURE.CONSTRAINT_FAILED(self, message);
        else if (!message)
            return util_1.FAILURE.CONSTRAINT_FAILED(self);
        return util_1.SUCCESS(result.value);
    }, self);
}
exports.Constraint = Constraint;
var Guard = function (guard, options) { return unknown_1.Unknown.withGuard(guard, options); };
exports.Guard = Guard;