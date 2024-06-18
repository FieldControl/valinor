"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pluginIsInternal = exports.internalPlugin = void 0;
function internalPlugin(p) {
    return p;
}
exports.internalPlugin = internalPlugin;
function pluginIsInternal(plugin) {
    return '__internal_plugin_id__' in plugin;
}
exports.pluginIsInternal = pluginIsInternal;
//# sourceMappingURL=internalPlugin.js.map