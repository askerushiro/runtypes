"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checked = exports.check = void 0;
var errors_1 = require("./errors");
var util_1 = require("./util");
var prototypes = new WeakMap();
/**
 * A parameter decorator. Explicitly mark the parameter as checked on every method call in combination with `@checked` method decorator. The number of `@check` params must be the same as the number of provided runtypes into `@checked`.\
 * Usage:
 * ```ts
 * @checked(Runtype1, Runtype3)
 * method(@check p1: Static1, p2: number, @check p3: Static3) { ... }
 * ```
 */
function check(target, propertyKey, parameterIndex) {
    var prototype = prototypes.get(target) || new Map();
    prototypes.set(target, prototype);
    var validParameterIndices = prototype.get(propertyKey) || [];
    prototype.set(propertyKey, validParameterIndices);
    validParameterIndices.push(parameterIndex);
}
exports.check = check;
function getValidParameterIndices(target, propertyKey, runtypeCount) {
    var prototype = prototypes.get(target);
    var validParameterIndices = prototype && prototype.get(propertyKey);
    if (validParameterIndices) {
        // used with `@check` parameter decorator
        return validParameterIndices;
    }
    var indices = [];
    for (var i = 0; i < runtypeCount; i++) {
        indices.push(i);
    }
    return indices;
}
/**
 * A method decorator. Takes runtypes as arguments which correspond to the ones of the actual method.
 *
 * Usually, the number of provided runtypes must be _**the same as**_ or _**less than**_ the actual parameters.
 *
 * If you explicitly mark which parameter shall be checked using `@check` parameter decorator, the number of `@check` parameters must be _**the same as**_ the runtypes provided into `@checked`.
 *
 * Usage:
 * ```ts
 * @checked(Runtype1, Runtype2)
 * method1(param1: Static1, param2: Static2, param3: any) {
 *   ...
 * }
 *
 * @checked(Runtype1, Runtype3)
 * method2(@check param1: Static1, param2: any, @check param3: Static3) {
 *   ...
 * }
 * ```
 */
function checked() {
    var runtypes = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        runtypes[_i] = arguments[_i];
    }
    if (runtypes.length === 0) {
        throw new Error('No runtype provided to `@checked`. Please remove the decorator.');
    }
    return function (target, propertyKey, descriptor) {
        var method = descriptor.value;
        var methodId = (target.name || target.constructor.name + '.prototype') +
            (typeof propertyKey === 'string' ? "[\"" + propertyKey + "\"]" : "[" + String(propertyKey) + "]");
        var validParameterIndices = getValidParameterIndices(target, propertyKey, runtypes.length);
        if (validParameterIndices.length !== runtypes.length) {
            throw new Error('Number of `@checked` runtypes and @check parameters not matched.');
        }
        if (validParameterIndices.length > method.length) {
            throw new Error('Number of `@checked` runtypes exceeds actual parameter length.');
        }
        descriptor.value = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            runtypes.forEach(function (type, typeIndex) {
                var parameterIndex = validParameterIndices[typeIndex];
                var result = type.validate(args[parameterIndex]);
                if (!result.success) {
                    var message = methodId + ", argument #" + parameterIndex + ": " + result.message;
                    var failure = util_1.FAILURE.ARGUMENT_INCORRECT(message);
                    throw new errors_1.ValidationError(failure);
                }
            });
            return method.apply(this, args);
        };
    };
}
exports.checked = checked;