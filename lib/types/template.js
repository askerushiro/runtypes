"use strict";
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
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
exports.Template = void 0;
var runtype_1 = require("../runtype");
var show_1 = require("../show");
var util_1 = require("../util");
var literal_1 = require("./literal");
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions#escaping
var escapeRegExp = function (string) { return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); };
var parseArgs = function (args) {
    // If the first element is an `Array`, maybe it's called by the tagged style
    if (0 < args.length && Array.isArray(args[0])) {
        var _a = __read(args), strings = _a[0], runtypes = _a.slice(1);
        // For further manipulation, recreate an `Array` because `TemplateStringsArray` is readonly
        return [Array.from(strings), runtypes];
    }
    else {
        var convenient = args;
        var strings = convenient.reduce(function (strings, arg) {
            // Concatenate every consecutive literals as strings
            if (!runtype_1.isRuntype(arg))
                strings.push(strings.pop() + String(arg));
            // Skip runtypes
            else
                strings.push('');
            return strings;
        }, ['']);
        var runtypes = convenient.filter(runtype_1.isRuntype);
        return [strings, runtypes];
    }
};
/**
 * Flatten inner runtypes of a `Template` if possible, with in-place strategy
 */
var flattenInnerRuntypes = function (strings, runtypes) {
    for (var i = 0; i < runtypes.length;) {
        switch (runtypes[i].reflect.tag) {
            case 'literal': {
                var literal_2 = runtypes[i];
                runtypes.splice(i, 1);
                var string = String(literal_2.value);
                strings.splice(i, 2, strings[i] + string + strings[i + 1]);
                break;
            }
            case 'template': {
                var template = runtypes[i];
                runtypes.splice.apply(runtypes, __spreadArray([i, 1], __read(template.runtypes)));
                var innerStrings = template.strings;
                if (innerStrings.length === 1) {
                    strings.splice(i, 2, strings[i] + innerStrings[0] + strings[i + 1]);
                }
                else {
                    var first = innerStrings[0];
                    var rest = innerStrings.slice(1, -1);
                    var last = innerStrings[innerStrings.length - 1];
                    strings.splice.apply(strings, __spreadArray(__spreadArray([i, 2, strings[i] + first], __read(rest)), [last + strings[i + 1]]));
                }
                break;
            }
            case 'union': {
                var union = runtypes[i];
                if (union.alternatives.length === 1) {
                    try {
                        var literal_3 = getInnerLiteral(union);
                        runtypes.splice(i, 1);
                        var string = String(literal_3.value);
                        strings.splice(i, 2, strings[i] + string + strings[i + 1]);
                        break;
                    }
                    catch (_) {
                        i++;
                        break;
                    }
                }
                else {
                    i++;
                    break;
                }
            }
            case 'intersect': {
                var intersect = runtypes[i];
                if (intersect.intersectees.length === 1) {
                    try {
                        var literal_4 = getInnerLiteral(intersect);
                        runtypes.splice(i, 1);
                        var string = String(literal_4.value);
                        strings.splice(i, 2, strings[i] + string + strings[i + 1]);
                        break;
                    }
                    catch (_) {
                        i++;
                        break;
                    }
                }
                else {
                    i++;
                    break;
                }
            }
            default:
                i++;
                break;
        }
    }
};
var normalizeArgs = function (args) {
    var _a = __read(parseArgs(args), 2), strings = _a[0], runtypes = _a[1];
    flattenInnerRuntypes(strings, runtypes);
    return [strings, runtypes];
};
var getInnerLiteral = function (runtype) {
    switch (runtype.reflect.tag) {
        case 'literal':
            return runtype;
        case 'brand':
            return getInnerLiteral(runtype.reflect.entity);
        case 'union':
            if (runtype.reflect.alternatives.length === 1)
                return getInnerLiteral(runtype.reflect.alternatives[0]);
            break;
        case 'intersect':
            if (runtype.reflect.intersectees.length === 1)
                return getInnerLiteral(runtype.reflect.intersectees[0]);
            break;
        default:
            break;
    }
    throw undefined;
};
var identity = function (s) { return s; };
var revivers = {
    string: [function (s) { return globalThis.String(s); }, '.*'],
    number: [
        function (s) { return globalThis.Number(s); },
        '[+-]?(?:\\d*\\.\\d+|\\d+\\.\\d*|\\d+)(?:[Ee][+-]?\\d+)?',
        '0[Bb][01]+',
        '0[Oo][07]+',
        '0[Xx][0-9A-Fa-f]+',
        // Note: `"NaN"` isn't here, as TS doesn't allow `"NaN"` to be a `` `${number}` ``
    ],
    bigint: [function (s) { return globalThis.BigInt(s); }, '-?[1-9]d*'],
    boolean: [function (s) { return (s === 'false' ? false : true); }, 'true', 'false'],
    null: [function () { return null; }, 'null'],
    undefined: [function () { return undefined; }, 'undefined'],
};
var getReviversFor = function (reflect) {
    switch (reflect.tag) {
        case 'literal': {
            var _a = __read(revivers[util_1.typeOf(reflect.value)] || [identity], 1), reviver_1 = _a[0];
            return reviver_1;
        }
        case 'brand':
            return getReviversFor(reflect.entity);
        case 'constraint':
            return getReviversFor(reflect.underlying);
        case 'union':
            return reflect.alternatives.map(getReviversFor);
        case 'intersect':
            return reflect.intersectees.map(getReviversFor);
        default:
            var _b = __read(revivers[reflect.tag] || [identity], 1), reviver = _b[0];
            return reviver;
    }
};
/** Recursively map corresponding reviver and  */
var reviveValidate = function (reflect, visited) { return function (value) {
    var e_1, _a, e_2, _b;
    var revivers = getReviversFor(reflect);
    if (Array.isArray(revivers)) {
        switch (reflect.tag) {
            case 'union':
                try {
                    for (var _c = __values(reflect.alternatives), _d = _c.next(); !_d.done; _d = _c.next()) {
                        var alternative = _d.value;
                        var validated = reviveValidate(alternative.reflect, visited)(value);
                        if (validated.success)
                            return validated;
                    }
                }
                catch (e_1_1) { e_1 = { error: e_1_1 }; }
                finally {
                    try {
                        if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
                    }
                    finally { if (e_1) throw e_1.error; }
                }
                return util_1.FAILURE.TYPE_INCORRECT(reflect, value);
            case 'intersect':
                try {
                    for (var _e = __values(reflect.intersectees), _f = _e.next(); !_f.done; _f = _e.next()) {
                        var intersectee = _f.value;
                        var validated = reviveValidate(intersectee.reflect, visited)(value);
                        if (!validated.success)
                            return validated;
                    }
                }
                catch (e_2_1) { e_2 = { error: e_2_1 }; }
                finally {
                    try {
                        if (_f && !_f.done && (_b = _e.return)) _b.call(_e);
                    }
                    finally { if (e_2) throw e_2.error; }
                }
                return util_1.SUCCESS(value);
            default:
                /* istanbul ignore next */
                throw Error('impossible');
        }
    }
    else {
        var reviver = revivers;
        var validated = runtype_1.innerValidate(reflect, reviver(value), visited);
        if (!validated.success && validated.code === 'VALUE_INCORRECT' && reflect.tag === 'literal')
            // TODO: Temporary fix to show unrevived value in message; needs refactor
            return util_1.FAILURE.VALUE_INCORRECT('literal', "\"" + literal_1.literal(reflect.value) + "\"", "\"" + value + "\"");
        return validated;
    }
}; };
var getRegExpPatternFor = function (reflect) {
    switch (reflect.tag) {
        case 'literal':
            return escapeRegExp(String(reflect.value));
        case 'brand':
            return getRegExpPatternFor(reflect.entity);
        case 'constraint':
            return getRegExpPatternFor(reflect.underlying);
        case 'union':
            return reflect.alternatives.map(getRegExpPatternFor).join('|');
        case 'template': {
            return reflect.strings.map(escapeRegExp).reduce(function (pattern, string, i) {
                var prefix = pattern + string;
                var runtype = reflect.runtypes[i];
                if (runtype)
                    return prefix + ("(?:" + getRegExpPatternFor(runtype.reflect) + ")");
                else
                    return prefix;
            }, '');
        }
        default:
            var _a = __read(revivers[reflect.tag] || [undefined, '.*']), patterns = _a.slice(1);
            return patterns.join('|');
    }
};
var createRegExpForTemplate = function (reflect) {
    var pattern = reflect.strings.map(escapeRegExp).reduce(function (pattern, string, i) {
        var prefix = pattern + string;
        var runtype = reflect.runtypes[i];
        if (runtype)
            return prefix + ("(" + getRegExpPatternFor(runtype.reflect) + ")");
        else
            return prefix;
    }, '');
    return new RegExp("^" + pattern + "$", 'su');
};
function Template() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    var _a = __read(normalizeArgs(args), 2), strings = _a[0], runtypes = _a[1];
    var self = { tag: 'template', strings: strings, runtypes: runtypes };
    var regexp = createRegExpForTemplate(self);
    var test = function (value, visited) {
        var matches = value.match(regexp);
        if (matches) {
            var values = matches.slice(1);
            for (var i = 0; i < runtypes.length; i++) {
                var runtype = runtypes[i];
                var value_1 = values[i];
                var validated = reviveValidate(runtype.reflect, visited)(value_1);
                if (!validated.success)
                    return validated;
            }
            return util_1.SUCCESS(value);
        }
        else {
            return util_1.FAILURE.VALUE_INCORRECT('string', "" + show_1.default(self), "\"" + literal_1.literal(value) + "\"");
        }
    };
    return runtype_1.create(function (value, visited) {
        if (typeof value !== 'string')
            return util_1.FAILURE.TYPE_INCORRECT(self, value);
        else {
            var validated = test(value, visited);
            if (!validated.success) {
                var result = util_1.FAILURE.VALUE_INCORRECT('string', "" + show_1.default(self), "\"" + value + "\"");
                if (result.message !== validated.message)
                    // TODO: Should use `details` here, but it needs unionizing `string` anew to the definition of `Details`, which is a breaking change
                    result.message += " (inner: " + validated.message + ")";
                return result;
            }
            else
                return util_1.SUCCESS(value);
        }
    }, self);
}
exports.Template = Template;