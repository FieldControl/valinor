"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoreSchemaRegistry = exports.SchemaValidationException = void 0;
const ajv_1 = require("ajv");
const ajv_formats_1 = require("ajv-formats");
const http = require("http");
const https = require("https");
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
const Url = require("url");
const exception_1 = require("../../exception/exception");
const utils_1 = require("../../utils");
const interface_1 = require("../interface");
const utility_1 = require("./utility");
const visitor_1 = require("./visitor");
class SchemaValidationException extends exception_1.BaseException {
    constructor(errors, baseMessage = 'Schema validation failed with the following errors:') {
        if (!errors || errors.length === 0) {
            super('Schema validation failed.');
            this.errors = [];
            return;
        }
        const messages = SchemaValidationException.createMessages(errors);
        super(`${baseMessage}\n  ${messages.join('\n  ')}`);
        this.errors = errors;
    }
    static createMessages(errors) {
        if (!errors || errors.length === 0) {
            return [];
        }
        const messages = errors.map((err) => {
            let message = `Data path ${JSON.stringify(err.instancePath)} ${err.message}`;
            if (err.keyword === 'additionalProperties') {
                message += `(${err.params.additionalProperty})`;
            }
            return message + '.';
        });
        return messages;
    }
}
exports.SchemaValidationException = SchemaValidationException;
class CoreSchemaRegistry {
    constructor(formats = []) {
        this._uriCache = new Map();
        this._uriHandlers = new Set();
        this._pre = new utils_1.PartiallyOrderedSet();
        this._post = new utils_1.PartiallyOrderedSet();
        this._smartDefaultKeyword = false;
        this._sourceMap = new Map();
        this._ajv = new ajv_1.default({
            strict: false,
            loadSchema: (uri) => this._fetch(uri),
            passContext: true,
        });
        ajv_formats_1.default(this._ajv);
        for (const format of formats) {
            this.addFormat(format);
        }
    }
    async _fetch(uri) {
        const maybeSchema = this._uriCache.get(uri);
        if (maybeSchema) {
            return maybeSchema;
        }
        // Try all handlers, one after the other.
        for (const handler of this._uriHandlers) {
            let handlerResult = handler(uri);
            if (handlerResult === null || handlerResult === undefined) {
                continue;
            }
            if (rxjs_1.isObservable(handlerResult)) {
                handlerResult = handlerResult.toPromise();
            }
            const value = await handlerResult;
            this._uriCache.set(uri, value);
            return value;
        }
        // If none are found, handle using http client.
        return new Promise((resolve, reject) => {
            const url = new Url.URL(uri);
            const client = url.protocol === 'https:' ? https : http;
            client.get(url, (res) => {
                if (!res.statusCode || res.statusCode >= 300) {
                    // Consume the rest of the data to free memory.
                    res.resume();
                    reject(new Error(`Request failed. Status Code: ${res.statusCode}`));
                }
                else {
                    res.setEncoding('utf8');
                    let data = '';
                    res.on('data', (chunk) => {
                        data += chunk;
                    });
                    res.on('end', () => {
                        try {
                            const json = JSON.parse(data);
                            this._uriCache.set(uri, json);
                            resolve(json);
                        }
                        catch (err) {
                            reject(err);
                        }
                    });
                }
            });
        });
    }
    /**
     * Add a transformation step before the validation of any Json.
     * @param {JsonVisitor} visitor The visitor to transform every value.
     * @param {JsonVisitor[]} deps A list of other visitors to run before.
     */
    addPreTransform(visitor, deps) {
        this._pre.add(visitor, deps);
    }
    /**
     * Add a transformation step after the validation of any Json. The JSON will not be validated
     * after the POST, so if transformations are not compatible with the Schema it will not result
     * in an error.
     * @param {JsonVisitor} visitor The visitor to transform every value.
     * @param {JsonVisitor[]} deps A list of other visitors to run before.
     */
    addPostTransform(visitor, deps) {
        this._post.add(visitor, deps);
    }
    _resolver(ref, validate) {
        if (!validate || !ref) {
            return {};
        }
        const schema = validate.schemaEnv.root.schema;
        const id = typeof schema === 'object' ? schema.$id : null;
        let fullReference = ref;
        if (typeof id === 'string') {
            fullReference = Url.resolve(id, ref);
            if (ref.startsWith('#')) {
                fullReference = id + fullReference;
            }
        }
        if (fullReference.startsWith('#')) {
            fullReference = fullReference.slice(0, -1);
        }
        const resolvedSchema = this._ajv.getSchema(fullReference);
        return {
            context: resolvedSchema === null || resolvedSchema === void 0 ? void 0 : resolvedSchema.schemaEnv.validate,
            schema: resolvedSchema === null || resolvedSchema === void 0 ? void 0 : resolvedSchema.schema,
        };
    }
    /**
     * Flatten the Schema, resolving and replacing all the refs. Makes it into a synchronous schema
     * that is also easier to traverse. Does not cache the result.
     *
     * @param schema The schema or URI to flatten.
     * @returns An Observable of the flattened schema object.
     * @deprecated since 11.2 without replacement.
     * Producing a flatten schema document does not in all cases produce a schema with identical behavior to the original.
     * See: https://json-schema.org/draft/2019-09/json-schema-core.html#rfc.appendix.B.2
     */
    flatten(schema) {
        return rxjs_1.from(this._flatten(schema));
    }
    async _flatten(schema) {
        this._replaceDeprecatedSchemaIdKeyword(schema);
        this._ajv.removeSchema(schema);
        this._currentCompilationSchemaInfo = undefined;
        const validate = await this._ajv.compileAsync(schema);
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const self = this;
        function visitor(current, pointer, parentSchema, index) {
            if (current &&
                parentSchema &&
                index &&
                interface_1.isJsonObject(current) &&
                Object.prototype.hasOwnProperty.call(current, '$ref') &&
                typeof current['$ref'] == 'string') {
                const resolved = self._resolver(current['$ref'], validate);
                if (resolved.schema) {
                    parentSchema[index] = resolved.schema;
                }
            }
        }
        const schemaCopy = utils_1.deepCopy(validate.schema);
        visitor_1.visitJsonSchema(schemaCopy, visitor);
        return schemaCopy;
    }
    /**
     * Compile and return a validation function for the Schema.
     *
     * @param schema The schema to validate. If a string, will fetch the schema before compiling it
     * (using schema as a URI).
     * @returns An Observable of the Validation function.
     */
    compile(schema) {
        return rxjs_1.from(this._compile(schema)).pipe(operators_1.map((validate) => (value, options) => rxjs_1.from(validate(value, options))));
    }
    async _compile(schema) {
        if (typeof schema === 'boolean') {
            return async (data) => ({ success: schema, data });
        }
        this._replaceDeprecatedSchemaIdKeyword(schema);
        const schemaInfo = {
            smartDefaultRecord: new Map(),
            promptDefinitions: [],
        };
        this._ajv.removeSchema(schema);
        let validator;
        try {
            this._currentCompilationSchemaInfo = schemaInfo;
            validator = this._ajv.compile(schema);
        }
        finally {
            this._currentCompilationSchemaInfo = undefined;
        }
        return async (data, options) => {
            var _a;
            const validationOptions = {
                withPrompts: true,
                applyPostTransforms: true,
                applyPreTransforms: true,
                ...options,
            };
            const validationContext = {
                promptFieldsWithValue: new Set(),
            };
            // Apply pre-validation transforms
            if (validationOptions.applyPreTransforms) {
                for (const visitor of this._pre.values()) {
                    data = await visitor_1.visitJson(data, visitor, schema, this._resolver.bind(this), validator).toPromise();
                }
            }
            // Apply smart defaults
            await this._applySmartDefaults(data, schemaInfo.smartDefaultRecord);
            // Apply prompts
            if (validationOptions.withPrompts) {
                const visitor = (value, pointer) => {
                    if (value !== undefined) {
                        validationContext.promptFieldsWithValue.add(pointer);
                    }
                    return value;
                };
                if (typeof schema === 'object') {
                    await visitor_1.visitJson(data, visitor, schema, this._resolver.bind(this), validator).toPromise();
                }
                const definitions = schemaInfo.promptDefinitions.filter((def) => !validationContext.promptFieldsWithValue.has(def.id));
                if (definitions.length > 0) {
                    await this._applyPrompts(data, definitions);
                }
            }
            // Validate using ajv
            const success = await validator.call(validationContext, data);
            if (!success) {
                return { data, success, errors: (_a = validator.errors) !== null && _a !== void 0 ? _a : [] };
            }
            // Apply post-validation transforms
            if (validationOptions.applyPostTransforms) {
                for (const visitor of this._post.values()) {
                    data = await visitor_1.visitJson(data, visitor, schema, this._resolver.bind(this), validator).toPromise();
                }
            }
            return { data, success: true };
        };
    }
    addFormat(format) {
        this._ajv.addFormat(format.name, format.formatter);
    }
    addSmartDefaultProvider(source, provider) {
        if (this._sourceMap.has(source)) {
            throw new Error(source);
        }
        this._sourceMap.set(source, provider);
        if (!this._smartDefaultKeyword) {
            this._smartDefaultKeyword = true;
            this._ajv.addKeyword({
                keyword: '$default',
                errors: false,
                valid: true,
                compile: (schema, _parentSchema, it) => {
                    const compilationSchemInfo = this._currentCompilationSchemaInfo;
                    if (compilationSchemInfo === undefined) {
                        return () => true;
                    }
                    // We cheat, heavily.
                    const pathArray = it.dataPathArr
                        .slice(1, it.dataLevel + 1)
                        .map((p) => (typeof p === 'number' ? p : p.str.slice(1, -1)));
                    compilationSchemInfo.smartDefaultRecord.set(JSON.stringify(pathArray), schema);
                    return () => true;
                },
                metaSchema: {
                    type: 'object',
                    properties: {
                        '$source': { type: 'string' },
                    },
                    additionalProperties: true,
                    required: ['$source'],
                },
            });
        }
    }
    registerUriHandler(handler) {
        this._uriHandlers.add(handler);
    }
    usePromptProvider(provider) {
        const isSetup = !!this._promptProvider;
        this._promptProvider = provider;
        if (isSetup) {
            return;
        }
        this._ajv.addKeyword({
            keyword: 'x-prompt',
            errors: false,
            valid: true,
            compile: (schema, parentSchema, it) => {
                const compilationSchemInfo = this._currentCompilationSchemaInfo;
                if (!compilationSchemInfo) {
                    return () => true;
                }
                const path = '/' +
                    it.dataPathArr
                        .slice(1, it.dataLevel + 1)
                        .map((p) => (typeof p === 'number' ? p : p.str.slice(1, -1)))
                        .join('/');
                let type;
                let items;
                let message;
                if (typeof schema == 'string') {
                    message = schema;
                }
                else {
                    message = schema.message;
                    type = schema.type;
                    items = schema.items;
                }
                const propertyTypes = utility_1.getTypesOfSchema(parentSchema);
                if (!type) {
                    if (propertyTypes.size === 1 && propertyTypes.has('boolean')) {
                        type = 'confirmation';
                    }
                    else if (Array.isArray(parentSchema.enum)) {
                        type = 'list';
                    }
                    else if (propertyTypes.size === 1 &&
                        propertyTypes.has('array') &&
                        parentSchema.items &&
                        Array.isArray(parentSchema.items.enum)) {
                        type = 'list';
                    }
                    else {
                        type = 'input';
                    }
                }
                let multiselect;
                if (type === 'list') {
                    multiselect =
                        schema.multiselect === undefined
                            ? propertyTypes.size === 1 && propertyTypes.has('array')
                            : schema.multiselect;
                    const enumValues = multiselect
                        ? parentSchema.items &&
                            parentSchema.items.enum
                        : parentSchema.enum;
                    if (!items && Array.isArray(enumValues)) {
                        items = [];
                        for (const value of enumValues) {
                            if (typeof value == 'string') {
                                items.push(value);
                            }
                            else if (typeof value == 'object') {
                                // Invalid
                            }
                            else {
                                items.push({ label: value.toString(), value });
                            }
                        }
                    }
                }
                const definition = {
                    id: path,
                    type,
                    message,
                    raw: schema,
                    items,
                    multiselect,
                    propertyTypes,
                    default: typeof parentSchema.default == 'object' &&
                        parentSchema.default !== null &&
                        !Array.isArray(parentSchema.default)
                        ? undefined
                        : parentSchema.default,
                    async validator(data) {
                        var _a;
                        try {
                            const result = await it.self.validate(parentSchema, data);
                            // If the schema is sync then false will be returned on validation failure
                            if (result) {
                                return result;
                            }
                            else if ((_a = it.self.errors) === null || _a === void 0 ? void 0 : _a.length) {
                                // Validation errors will be present on the Ajv instance when sync
                                return it.self.errors[0].message;
                            }
                        }
                        catch (e) {
                            // If the schema is async then an error will be thrown on validation failure
                            if (Array.isArray(e.errors) && e.errors.length) {
                                return e.errors[0].message;
                            }
                        }
                        return false;
                    },
                };
                compilationSchemInfo.promptDefinitions.push(definition);
                return function () {
                    // If 'this' is undefined in the call, then it defaults to the global
                    // 'this'.
                    if (this && this.promptFieldsWithValue) {
                        this.promptFieldsWithValue.add(path);
                    }
                    return true;
                };
            },
            metaSchema: {
                oneOf: [
                    { type: 'string' },
                    {
                        type: 'object',
                        properties: {
                            'type': { type: 'string' },
                            'message': { type: 'string' },
                        },
                        additionalProperties: true,
                        required: ['message'],
                    },
                ],
            },
        });
    }
    async _applyPrompts(data, prompts) {
        const provider = this._promptProvider;
        if (!provider) {
            return;
        }
        const answers = await rxjs_1.from(provider(prompts)).toPromise();
        for (const path in answers) {
            const pathFragments = path.split('/').slice(1);
            CoreSchemaRegistry._set(data, pathFragments, answers[path], null, undefined, true);
        }
    }
    static _set(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data, fragments, value, parent = null, parentProperty, force) {
        for (const fragment of fragments) {
            if (!data && parent !== null && parentProperty) {
                data = parent[parentProperty] = {};
            }
            parent = data;
            parentProperty = fragment;
            data = data[fragment];
        }
        if (parent && parentProperty && (force || parent[parentProperty] === undefined)) {
            parent[parentProperty] = value;
        }
    }
    async _applySmartDefaults(data, smartDefaults) {
        for (const [pointer, schema] of smartDefaults.entries()) {
            const fragments = JSON.parse(pointer);
            const source = this._sourceMap.get(schema.$source);
            if (!source) {
                continue;
            }
            let value = source(schema);
            if (rxjs_1.isObservable(value)) {
                value = await value.toPromise();
            }
            CoreSchemaRegistry._set(data, fragments, value);
        }
    }
    useXDeprecatedProvider(onUsage) {
        this._ajv.addKeyword({
            keyword: 'x-deprecated',
            validate: (schema, _data, _parentSchema, dataCxt) => {
                if (schema) {
                    onUsage(`Option "${dataCxt === null || dataCxt === void 0 ? void 0 : dataCxt.parentDataProperty}" is deprecated${typeof schema == 'string' ? ': ' + schema : '.'}`);
                }
                return true;
            },
            errors: false,
        });
    }
    /**
     * Workaround to avoid a breaking change in downstream schematics.
     * @deprecated will be removed in version 13.
     */
    _replaceDeprecatedSchemaIdKeyword(schema) {
        if (typeof schema.id === 'string') {
            schema.$id = schema.id;
            delete schema.id;
            // eslint-disable-next-line no-console
            console.warn(`"${schema.$id}" schema is using the keyword "id" which its support is deprecated. Use "$id" for schema ID.`);
        }
    }
}
exports.CoreSchemaRegistry = CoreSchemaRegistry;
