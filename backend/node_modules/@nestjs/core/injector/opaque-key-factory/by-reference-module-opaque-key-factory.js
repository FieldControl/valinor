"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ByReferenceModuleOpaqueKeyFactory = void 0;
const random_string_generator_util_1 = require("@nestjs/common/utils/random-string-generator.util");
const crypto_1 = require("crypto");
const K_MODULE_ID = Symbol('K_MODULE_ID');
class ByReferenceModuleOpaqueKeyFactory {
    constructor(options) {
        this.keyGenerationStrategy = options?.keyGenerationStrategy ?? 'random';
    }
    createForStatic(moduleCls, originalRef = moduleCls) {
        return this.getOrCreateModuleId(moduleCls, undefined, originalRef);
    }
    createForDynamic(moduleCls, dynamicMetadata, originalRef) {
        return this.getOrCreateModuleId(moduleCls, dynamicMetadata, originalRef);
    }
    getOrCreateModuleId(moduleCls, dynamicMetadata, originalRef) {
        if (originalRef[K_MODULE_ID]) {
            return originalRef[K_MODULE_ID];
        }
        let moduleId;
        if (this.keyGenerationStrategy === 'random') {
            moduleId = this.generateRandomString();
        }
        else {
            const delimiter = ':';
            moduleId = dynamicMetadata
                ? `${this.generateRandomString()}${delimiter}${this.hashString(moduleCls.name + JSON.stringify(dynamicMetadata))}`
                : `${this.generateRandomString()}${delimiter}${this.hashString(moduleCls.toString())}`;
        }
        originalRef[K_MODULE_ID] = moduleId;
        return moduleId;
    }
    hashString(value) {
        return (0, crypto_1.createHash)('sha256').update(value).digest('hex');
    }
    generateRandomString() {
        return (0, random_string_generator_util_1.randomStringGenerator)();
    }
}
exports.ByReferenceModuleOpaqueKeyFactory = ByReferenceModuleOpaqueKeyFactory;
