"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebpackModuleFileIterator = void 0;
var WebpackModuleFileIterator = /** @class */ (function () {
    function WebpackModuleFileIterator(requireResolve) {
        this.requireResolve = requireResolve;
    }
    WebpackModuleFileIterator.prototype.iterateFiles = function (chunkModule, callback) {
        var internalCallback = this.internalCallback.bind(this, callback);
        internalCallback(chunkModule.resource ||
            (chunkModule.rootModule && chunkModule.rootModule.resource));
        if (Array.isArray(chunkModule.fileDependencies)) {
            var fileDependencies = chunkModule.fileDependencies;
            fileDependencies.forEach(internalCallback);
        }
        if (Array.isArray(chunkModule.dependencies)) {
            chunkModule.dependencies.forEach(function (module) {
                return internalCallback(module.originModule && module.originModule.resource);
            });
        }
    };
    WebpackModuleFileIterator.prototype.internalCallback = function (callback, filename) {
        var actualFileName = this.getActualFilename(filename);
        if (actualFileName) {
            callback(actualFileName);
        }
    };
    WebpackModuleFileIterator.prototype.getActualFilename = function (filename) {
        if (!filename ||
            filename.indexOf('external ') === 0 ||
            filename.indexOf('container entry ') === 0 ||
            filename.indexOf('ignored|') === 0 ||
            filename.indexOf('remote ') === 0 ||
            filename.indexOf('data:') === 0) {
            return null;
        }
        if (filename.indexOf('webpack/runtime') === 0) {
            return this.requireResolve('webpack');
        }
        if (filename.indexOf('!') > -1) {
            // file was procesed by loader, last item after ! is the actual file
            var tokens = filename.split('!');
            return tokens[tokens.length - 1];
        }
        if (filename.indexOf('provide module') === 0) {
            return filename.split('=')[1].trim();
        }
        if (filename.indexOf('consume-shared-module') === 0) {
            var tokens = filename.split('|');
            // 3rd to last item is the filename, see identifier() function in node_modules/webpack/lib/sharing/ConsumeSharedModule.js
            var actualFilename = tokens[tokens.length - 3];
            if (actualFilename === 'undefined') {
                return null;
            }
            return actualFilename;
        }
        return filename;
    };
    return WebpackModuleFileIterator;
}());
exports.WebpackModuleFileIterator = WebpackModuleFileIterator;
