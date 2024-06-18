export class HeaderMap extends Map {
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
//# sourceMappingURL=HeaderMap.js.map