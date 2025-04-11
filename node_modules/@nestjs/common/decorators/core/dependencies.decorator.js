"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Dependencies = void 0;
exports.flatten = flatten;
const constants_1 = require("../../constants");
function flatten(arr) {
    const flat = [].concat(...arr);
    return flat.some(Array.isArray) ? flatten(flat) : flat;
}
/**
 * Decorator that sets required dependencies (required with a vanilla JavaScript objects)
 *
 * @publicApi
 */
const Dependencies = (...dependencies) => {
    const flattenDeps = flatten(dependencies);
    return (target) => {
        Reflect.defineMetadata(constants_1.PARAMTYPES_METADATA, flattenDeps, target);
    };
};
exports.Dependencies = Dependencies;
