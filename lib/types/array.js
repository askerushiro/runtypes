"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Array = void 0;
var runtype_1 = require("../runtype");
var util_1 = require("../util");
/**
 * Construct an array runtype from a runtype for its elements.
 */
function InternalArr(element, isReadonly) {
    var self = { tag: 'array', isReadonly: isReadonly, element: element };
    return withExtraModifierFuncs(runtype_1.create(function (xs, visited) {
        if (!Array.isArray(xs))
            return util_1.FAILURE.TYPE_INCORRECT(self, xs);
        var keys = util_1.enumerableKeysOf(xs);
        var results = keys.map(function (key) {
            return runtype_1.innerValidate(element, xs[key], visited);
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
    }, self));
}
function Arr(element) {
    return InternalArr(element, false);
}
exports.Array = Arr;
function withExtraModifierFuncs(A) {
    A.asReadonly = asReadonly;
    return A;
    function asReadonly() {
        return InternalArr(A.element, true);
    }
}