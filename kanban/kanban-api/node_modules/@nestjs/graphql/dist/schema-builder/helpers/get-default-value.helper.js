"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDefaultValue = void 0;
const shared_utils_1 = require("@nestjs/common/utils/shared.utils");
const lodash_1 = require("lodash");
const default_values_conflict_error_1 = require("../errors/default-values-conflict.error");
function getDefaultValue(instance, options, key, typeName) {
    const initializerValue = instance[key];
    if ((0, shared_utils_1.isUndefined)(options.defaultValue)) {
        return initializerValue;
    }
    if (!(0, lodash_1.isEqual)(options.defaultValue, initializerValue) &&
        !(0, shared_utils_1.isUndefined)(initializerValue)) {
        throw new default_values_conflict_error_1.DefaultValuesConflictError(typeName, key, options.defaultValue, initializerValue);
    }
    return options.defaultValue;
}
exports.getDefaultValue = getDefaultValue;
