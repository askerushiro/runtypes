"use strict";
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Intersect = void 0;
var runtype_1 = require("../runtype");
var util_1 = require("../util");
/**
 * Construct an intersection runtype from runtypes for its alternatives.
 */
function Intersect() {
    var intersectees = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        intersectees[_i] = arguments[_i];
    }
    var self = { tag: 'intersect', intersectees: intersectees };
    return runtype_1.create(function (value, visited) {
        var e_1, _a;
        try {
            for (var intersectees_1 = __values(intersectees), intersectees_1_1 = intersectees_1.next(); !intersectees_1_1.done; intersectees_1_1 = intersectees_1.next()) {
                var targetType = intersectees_1_1.value;
                var result = runtype_1.innerValidate(targetType, value, visited);
                if (!result.success)
                    return result;
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (intersectees_1_1 && !intersectees_1_1.done && (_a = intersectees_1.return)) _a.call(intersectees_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return util_1.SUCCESS(value);
    }, self);
}
exports.Intersect = Intersect;