"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mergePluginOptions = void 0;
const shared_utils_1 = require("@nestjs/common/utils/shared.utils");
const defaultOptions = {
    typeFileNameSuffix: ['.input.ts', '.args.ts', '.entity.ts', '.model.ts'],
    introspectComments: false,
    readonly: false,
    debug: false,
};
const mergePluginOptions = (options = {}) => {
    if ((0, shared_utils_1.isString)(options.typeFileNameSuffix)) {
        options.typeFileNameSuffix = [options.typeFileNameSuffix];
    }
    return {
        ...defaultOptions,
        ...options,
    };
};
exports.mergePluginOptions = mergePluginOptions;
