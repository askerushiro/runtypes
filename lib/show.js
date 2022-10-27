"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Return the display string for the stringified version of a type, e.g.
 *
 * - `Number` -> `` `${number}` ``
 * - `String` -> `string`
 * - `Literal(42)` -> `"42"`
 * - `Union(Literal("foo"), Number)` -> `` "foo" | `${number}` ``
 */
var showStringified = function (circular) { return function (refl) {
    switch (refl.tag) {
        case 'literal':
            return "\"" + String(refl.value) + "\"";
        case 'string':
            return 'string';
        case 'brand':
            return refl.brand;
        case 'constraint':
            return refl.name || showStringified(circular)(refl.underlying);
        case 'union':
            return refl.alternatives.map(showStringified(circular)).join(' | ');
        case 'intersect':
            return refl.intersectees.map(showStringified(circular)).join(' & ');
        default:
            break;
    }
    return "`${" + show(false, circular)(refl) + "}`";
}; };
/**
 * Return the display string which is to be embedded into the display string of
 * the surrounding template literal type, e.g.
 *
 * - `Number` -> `${number}`
 * - `String` -> `${string}`
 * - `Literal("foo")` -> `foo`
 * - `Union(Literal(42), Number)` -> `${"42" | number}`
 */
var showEmbedded = function (circular) { return function (refl) {
    switch (refl.tag) {
        case 'literal':
            return String(refl.value);
        case 'brand':
            return "${" + refl.brand + "}";
        case 'constraint':
            return refl.name ? "${" + refl.name + "}" : showEmbedded(circular)(refl.underlying);
        case 'union':
            if (refl.alternatives.length === 1) {
                var inner = refl.alternatives[0];
                return showEmbedded(circular)(inner.reflect);
            }
            break;
        case 'intersect':
            if (refl.intersectees.length === 1) {
                var inner = refl.intersectees[0];
                return showEmbedded(circular)(inner.reflect);
            }
            break;
        default:
            break;
    }
    return "${" + show(false, circular)(refl) + "}";
}; };
var show = function (needsParens, circular) { return function (refl) {
    var parenthesize = function (s) { return (needsParens ? "(" + s + ")" : s); };
    if (circular.has(refl))
        return parenthesize("CIRCULAR " + refl.tag);
    else
        circular.add(refl);
    try {
        switch (refl.tag) {
            // Primitive types
            case 'unknown':
            case 'never':
            case 'void':
            case 'boolean':
            case 'number':
            case 'bigint':
            case 'string':
            case 'symbol':
            case 'function':
                return refl.tag;
            case 'literal': {
                var value = refl.value;
                return typeof value === 'string' ? "\"" + value + "\"" : String(value);
            }
            // Complex types
            case 'template': {
                if (refl.strings.length === 0)
                    return '""';
                else if (refl.strings.length === 1)
                    return "\"" + refl.strings[0] + "\"";
                else if (refl.strings.length === 2) {
                    if (refl.strings.every(function (string) { return string === ''; })) {
                        var runtype = refl.runtypes[0];
                        return showStringified(circular)(runtype.reflect);
                    }
                }
                var backtick_1 = false;
                var inner = refl.strings.reduce(function (inner, string, i) {
                    var prefix = inner + string;
                    var runtype = refl.runtypes[i];
                    if (runtype) {
                        var suffix = showEmbedded(circular)(runtype.reflect);
                        if (!backtick_1 && suffix.startsWith('$'))
                            backtick_1 = true;
                        return prefix + suffix;
                    }
                    else
                        return prefix;
                }, '');
                return backtick_1 ? "`" + inner + "`" : "\"" + inner + "\"";
            }
            case 'array':
                return "" + readonlyTag(refl) + show(true, circular)(refl.element) + "[]";
            case 'dictionary':
                return "{ [_: " + refl.key + "]: " + show(false, circular)(refl.value) + " }";
            case 'record': {
                var keys = Object.keys(refl.fields);
                return keys.length
                    ? "{ " + keys
                        .map(function (k) {
                        return "" + readonlyTag(refl) + k + partialTag(refl, k) + ": " + (refl.fields[k].tag === 'optional'
                            ? show(false, circular)(refl.fields[k].underlying)
                            : show(false, circular)(refl.fields[k])) + ";";
                    })
                        .join(' ') + " }"
                    : '{}';
            }
            case 'tuple':
                return "[" + refl.components.map(show(false, circular)).join(', ') + "]";
            case 'union':
                return parenthesize("" + refl.alternatives.map(show(true, circular)).join(' | '));
            case 'intersect':
                return parenthesize("" + refl.intersectees.map(show(true, circular)).join(' & '));
            case 'optional':
                return show(needsParens, circular)(refl.underlying) + ' | undefined';
            case 'constraint':
                return refl.name || show(needsParens, circular)(refl.underlying);
            case 'instanceof':
                return refl.ctor.name;
            case 'brand':
                return show(needsParens, circular)(refl.entity);
        }
    }
    finally {
        circular.delete(refl);
    }
    /* istanbul ignore next */
    throw Error('impossible');
}; };
exports.default = show(false, new Set());
function partialTag(_a, key) {
    var isPartial = _a.isPartial, fields = _a.fields;
    return isPartial || (key !== undefined && fields[key].tag === 'optional') ? '?' : '';
}
function readonlyTag(_a) {
    var isReadonly = _a.isReadonly;
    return isReadonly ? 'readonly ' : '';
}