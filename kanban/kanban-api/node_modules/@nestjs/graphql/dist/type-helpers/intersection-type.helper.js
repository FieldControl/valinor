"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntersectionType = void 0;
const shared_utils_1 = require("@nestjs/common/utils/shared.utils");
const mapped_types_1 = require("@nestjs/mapped-types");
const decorators_1 = require("../decorators");
const metadata_loader_1 = require("../plugin/metadata-loader");
const get_fields_and_decorator_util_1 = require("../schema-builder/utils/get-fields-and-decorator.util");
const type_helpers_utils_1 = require("./type-helpers.utils");
function IntersectionType(classARef, classBRef, decorator) {
    const { decoratorFactory, fields: fieldsA } = (0, get_fields_and_decorator_util_1.getFieldsAndDecoratorForType)(classARef);
    const { fields: fieldsB } = (0, get_fields_and_decorator_util_1.getFieldsAndDecoratorForType)(classBRef);
    const fields = [...fieldsA, ...fieldsB];
    class IntersectionObjectType {
        constructor() {
            (0, mapped_types_1.inheritPropertyInitializers)(this, classARef);
            (0, mapped_types_1.inheritPropertyInitializers)(this, classBRef);
        }
    }
    if (decorator) {
        decorator({ isAbstract: true })(IntersectionObjectType);
    }
    else {
        decoratorFactory({ isAbstract: true })(IntersectionObjectType);
    }
    (0, mapped_types_1.inheritValidationMetadata)(classARef, IntersectionObjectType);
    (0, mapped_types_1.inheritTransformationMetadata)(classARef, IntersectionObjectType);
    (0, mapped_types_1.inheritValidationMetadata)(classBRef, IntersectionObjectType);
    (0, mapped_types_1.inheritTransformationMetadata)(classBRef, IntersectionObjectType);
    function applyFields(fields) {
        fields.forEach((item) => {
            if ((0, shared_utils_1.isFunction)(item.typeFn)) {
                // Execute type function eagerly to update the type options object (before "clone" operation)
                // when the passed function (e.g., @Field(() => Type)) lazily returns an array.
                item.typeFn();
            }
            (0, decorators_1.Field)(item.typeFn, { ...item.options })(IntersectionObjectType.prototype, item.name);
            (0, type_helpers_utils_1.applyFieldDecorators)(IntersectionObjectType, item);
        });
    }
    applyFields(fields);
    // Register a refresh hook to update the fields when the serialized metadata
    // is loaded from file.
    metadata_loader_1.MetadataLoader.addRefreshHook(() => {
        const { fields: fieldsA } = (0, get_fields_and_decorator_util_1.getFieldsAndDecoratorForType)(classARef, {
            overrideFields: true,
        });
        const { fields: fieldsB } = (0, get_fields_and_decorator_util_1.getFieldsAndDecoratorForType)(classBRef, {
            overrideFields: true,
        });
        const fields = [...fieldsA, ...fieldsB];
        applyFields(fields);
    });
    Object.defineProperty(IntersectionObjectType, 'name', {
        value: `Intersection${classARef.name}${classBRef.name}`,
    });
    return IntersectionObjectType;
}
exports.IntersectionType = IntersectionType;
