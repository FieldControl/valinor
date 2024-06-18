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
exports.findPropertyInAstObject = void 0;
// https://github.com/angular/angular-cli/blob/master/packages/schematics/angular/utility/json-utils.ts
function findPropertyInAstObject(node, propertyName) {
    var e_1, _a;
    var maybeNode = null;
    try {
        for (var _b = __values(node.properties), _c = _b.next(); !_c.done; _c = _b.next()) {
            var property = _c.value;
            if (property.key.value == propertyName) {
                maybeNode = property.value;
            }
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
        }
        finally { if (e_1) throw e_1.error; }
    }
    return maybeNode;
}
exports.findPropertyInAstObject = findPropertyInAstObject;
//# sourceMappingURL=json-utilts.js.map