"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Tuple = void 0;
var runtype_1 = require("../runtype");
var util_1 = require("../util");
/**
 * Construct a tuple runtype from runtypes for each of its elements.
 */
function Tuple() {
    var components = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        components[_i] = arguments[_i];
    }
    var self = { tag: 'tuple', components: components };
    return runtype_1.create(function (xs, visited) {
        if (!Array.isArray(xs))
            return util_1.FAILURE.TYPE_INCORRECT(self, xs);
        if (xs.length !== components.length)
            return util_1.FAILURE.CONSTRAINT_FAILED(self, "Expected length " + components.length + ", but was " + xs.length);
        var keys = util_1.enumerableKeysOf(xs);
        var results = keys.map(function (key) {
            return runtype_1.innerValidate(components[key], xs[key], visited);
        });
        var details = keys.reduce(function (details, key) {
            var result = results[key];
            if (!result.success)
                details[key] = result.details || result.message;
            return details;
        }, []);
        if (util_1.enumerableKeysOf(details).length !== 0)
            return util_1.FAILURE.CONTENT_INCORRECT(self, details);
        else
            return util_1.SUCCESS(xs);
    }, self);
}
exports.Tuple = Tuple;