"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrphanedReferenceRegistry = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const shared_utils_1 = require("@nestjs/common/utils/shared.utils");
const BANNED_TYPES = [String, Date, Number, Boolean];
let OrphanedReferenceRegistry = class OrphanedReferenceRegistry {
    constructor() {
        this.registry = new Set();
    }
    addToRegistryIfOrphaned(typeRef) {
        if (!(0, shared_utils_1.isFunction)(typeRef)) {
            return;
        }
        if (BANNED_TYPES.includes(typeRef)) {
            return;
        }
        this.registry.add(typeRef);
    }
    getAll() {
        return [...this.registry.values()];
    }
};
exports.OrphanedReferenceRegistry = OrphanedReferenceRegistry;
exports.OrphanedReferenceRegistry = OrphanedReferenceRegistry = tslib_1.__decorate([
    (0, common_1.Injectable)()
], OrphanedReferenceRegistry);
