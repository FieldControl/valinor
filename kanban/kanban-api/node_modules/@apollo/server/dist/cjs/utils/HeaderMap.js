"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HeaderMap = void 0;
class HeaderMap extends Map {
    constructor() {
        super(...arguments);
        this.__identity = Symbol('HeaderMap');
    }
    set(key, value) {
        return super.set(key.toLowerCase(), value);
    }
    get(key) {
        return super.get(key.toLowerCase());
    }
    delete(key) {
        return super.delete(key.toLowerCase());
    }
    has(key) {
        return super.has(key.toLowerCase());
    }
}
exports.HeaderMap = HeaderMap;
//# sourceMappingURL=HeaderMap.js.map