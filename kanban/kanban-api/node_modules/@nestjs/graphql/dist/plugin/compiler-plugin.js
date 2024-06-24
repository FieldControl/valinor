"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.before = void 0;
const merge_options_1 = require("./merge-options");
const is_filename_matched_util_1 = require("./utils/is-filename-matched.util");
const model_class_visitor_1 = require("./visitors/model-class.visitor");
const typeClassVisitor = new model_class_visitor_1.ModelClassVisitor();
const before = (options, program) => {
    options = (0, merge_options_1.mergePluginOptions)(options);
    return (ctx) => {
        return (sf) => {
            if ((0, is_filename_matched_util_1.isFilenameMatched)(options.typeFileNameSuffix, sf.fileName)) {
                return typeClassVisitor.visit(sf, ctx, program, options);
            }
            return sf;
        };
    };
};
exports.before = before;
