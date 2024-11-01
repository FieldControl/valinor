"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assignCustomParameterMetadata = assignCustomParameterMetadata;
const constants_1 = require("../constants");
function assignCustomParameterMetadata(args, paramtype, index, factory, data, ...pipes) {
    return {
        ...args,
        [`${paramtype}${constants_1.CUSTOM_ROUTE_ARGS_METADATA}:${index}`]: {
            index,
            factory,
            data,
            pipes,
        },
    };
}
