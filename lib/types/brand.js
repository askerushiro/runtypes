"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Brand = void 0;
var runtype_1 = require("../runtype");
function Brand(brand, entity) {
    var self = { tag: 'brand', brand: brand, entity: entity };
    return runtype_1.create(function (value) { return entity.validate(value); }, self);
}
exports.Brand = Brand;