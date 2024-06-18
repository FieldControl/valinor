"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extend = void 0;
const lodash_1 = require("lodash");
function extend(obj1, obj2) {
    if ((0, lodash_1.isString)(obj1)) {
        return (0, lodash_1.isString)(obj2)
            ? [(0, lodash_1.defaultTo)(obj1, ''), (0, lodash_1.defaultTo)(obj2, '')]
            : [(0, lodash_1.defaultTo)(obj1, '')].concat((0, lodash_1.defaultTo)(obj2, []));
    }
    if ((0, lodash_1.isArray)(obj1)) {
        return (0, lodash_1.defaultTo)(obj1, []).concat((0, lodash_1.defaultTo)(obj2, []));
    }
    return {
        ...(obj1 || {}),
        ...(obj2 || {}),
    };
}
exports.extend = extend;
