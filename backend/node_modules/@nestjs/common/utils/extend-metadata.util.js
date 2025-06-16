"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extendArrayMetadata = extendArrayMetadata;
function extendArrayMetadata(key, metadata, target) {
    const previousValue = Reflect.getMetadata(key, target) || [];
    const value = [...previousValue, ...metadata];
    Reflect.defineMetadata(key, value, target);
}
