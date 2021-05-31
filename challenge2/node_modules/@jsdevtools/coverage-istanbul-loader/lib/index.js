"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const convert = __importStar(require("convert-source-map"));
const istanbul_lib_instrument_1 = require("istanbul-lib-instrument");
const loaderUtils = __importStar(require("loader-utils"));
const merge_source_map_1 = __importDefault(require("merge-source-map"));
const path = __importStar(require("path"));
const schema_utils_1 = __importDefault(require("schema-utils"));
const optionsSchema = __importStar(require("./options-schema.json"));
const options_js_1 = require("./options.js");
/**
 * Adds code coverage instrumentation using Istanbul.
 *
 * If the source code has an existing source map, then it is used to re-map the instrumented
 * code back to the original source.
 */
function default_1(source, sourceMap) {
    let options = loaderUtils.getOptions(this);
    options = Object.assign(options_js_1.defaultOptions, options);
    schema_utils_1.default(optionsSchema, options, "Coverage Istanbul Loader");
    // If there's no external sourceMap file, then check for an inline sourceMap
    if (!sourceMap) {
        sourceMap = getInlineSourceMap.call(this, source);
    }
    // Instrument the code
    let instrumenter = istanbul_lib_instrument_1.createInstrumenter(options);
    instrumenter.instrument(source, this.resourcePath, done.bind(this), sourceMap);
    function done(error, instrumentedSource) {
        // Get the source map for the instrumented code
        let instrumentedSourceMap = instrumenter.lastSourceMap();
        if (sourceMap && instrumentedSourceMap) {
            // Re-map the source map to the original source code
            instrumentedSourceMap = merge_source_map_1.default(sourceMap, instrumentedSourceMap);
        }
        this.callback(error, instrumentedSource, instrumentedSourceMap);
    }
}
exports.default = default_1;
/**
 * If the source code has an inline base64-encoded source map,
 * then this function decodes it, parses it, and returns it.
 */
function getInlineSourceMap(source) {
    try {
        // Check for an inline source map
        const inlineSourceMap = convert.fromSource(source)
            || convert.fromMapFileSource(source, path.dirname(this.resourcePath));
        if (inlineSourceMap) {
            // Use the inline source map
            return inlineSourceMap.sourcemap;
        }
    }
    catch (e) {
        // Exception is thrown by fromMapFileSource when there is no source map file
        if (e instanceof Error && e.message.includes("An error occurred while trying to read the map file at")) {
            this.emitWarning(e);
        }
        else {
            throw e;
        }
    }
}
//# sourceMappingURL=index.js.map