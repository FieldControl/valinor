"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReadonlyVisitor = void 0;
const ts = require("typescript");
const merge_options_1 = require("../merge-options");
const is_filename_matched_util_1 = require("../utils/is-filename-matched.util");
const model_class_visitor_1 = require("./model-class.visitor");
class ReadonlyVisitor {
    get typeImports() {
        return this.modelClassVisitor.typeImports;
    }
    constructor(options) {
        this.options = options;
        this.key = '@nestjs/graphql';
        this.modelClassVisitor = new model_class_visitor_1.ModelClassVisitor();
        options.readonly = true;
        if (!options.pathToSource) {
            throw new Error(`"pathToSource" must be defined in plugin options`);
        }
    }
    visit(program, sf) {
        const factoryHost = { factory: ts.factory };
        const parsedOptions = (0, merge_options_1.mergePluginOptions)(this.options);
        if ((0, is_filename_matched_util_1.isFilenameMatched)(parsedOptions.typeFileNameSuffix, sf.fileName)) {
            return this.modelClassVisitor.visit(sf, factoryHost, program, parsedOptions);
        }
    }
    collect() {
        return {
            models: this.modelClassVisitor.collectedMetadata,
        };
    }
}
exports.ReadonlyVisitor = ReadonlyVisitor;
