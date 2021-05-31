(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/compiler-cli/linker/babel/src/babel_plugin", ["require", "exports", "tslib", "@angular/compiler-cli/src/ngtsc/file_system", "@angular/compiler-cli/src/ngtsc/logging", "@angular/compiler-cli/linker/babel/src/es2015_linker_plugin"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.defaultLinkerPlugin = void 0;
    var tslib_1 = require("tslib");
    var file_system_1 = require("@angular/compiler-cli/src/ngtsc/file_system");
    var logging_1 = require("@angular/compiler-cli/src/ngtsc/logging");
    var es2015_linker_plugin_1 = require("@angular/compiler-cli/linker/babel/src/es2015_linker_plugin");
    /**
     * This is the Babel plugin definition that is provided as a default export from the package, such
     * that the plugin can be used using the module specifier of the package. This is the recommended
     * way of integrating the Angular Linker into a build pipeline other than the Angular CLI.
     *
     * When the module specifier `@angular/compiler-cli/linker/babel` is used as a plugin in a Babel
     * configuration, Babel invokes this function (by means of the default export) to create the plugin
     * instance according to the provided options.
     *
     * The linker plugin that is created uses the native NodeJS filesystem APIs to interact with the
     * filesystem. Any logging output is printed to the console.
     *
     * @param api Provides access to the Babel environment that is configuring this plugin.
     * @param options The plugin options that have been configured.
     */
    function defaultLinkerPlugin(api, options) {
        api.assertVersion(7);
        return es2015_linker_plugin_1.createEs2015LinkerPlugin(tslib_1.__assign(tslib_1.__assign({}, options), { fileSystem: new file_system_1.NodeJSFileSystem(), logger: new logging_1.ConsoleLogger(logging_1.LogLevel.info) }));
    }
    exports.defaultLinkerPlugin = defaultLinkerPlugin;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFiZWxfcGx1Z2luLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXItY2xpL2xpbmtlci9iYWJlbC9zcmMvYmFiZWxfcGx1Z2luLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7SUFTQSwyRUFBZ0U7SUFDaEUsbUVBQW1FO0lBR25FLG9HQUFnRTtJQUVoRTs7Ozs7Ozs7Ozs7Ozs7T0FjRztJQUNILFNBQWdCLG1CQUFtQixDQUFDLEdBQWMsRUFBRSxPQUErQjtRQUNqRixHQUFHLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBRXJCLE9BQU8sK0NBQXdCLHVDQUMxQixPQUFPLEtBQ1YsVUFBVSxFQUFFLElBQUksOEJBQWdCLEVBQUUsRUFDbEMsTUFBTSxFQUFFLElBQUksdUJBQWEsQ0FBQyxrQkFBUSxDQUFDLElBQUksQ0FBQyxJQUN4QyxDQUFDO0lBQ0wsQ0FBQztJQVJELGtEQVFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5pbXBvcnQge0NvbmZpZ0FQSSwgUGx1Z2luT2JqfSBmcm9tICdAYmFiZWwvY29yZSc7XG5cbmltcG9ydCB7Tm9kZUpTRmlsZVN5c3RlbX0gZnJvbSAnLi4vLi4vLi4vc3JjL25ndHNjL2ZpbGVfc3lzdGVtJztcbmltcG9ydCB7Q29uc29sZUxvZ2dlciwgTG9nTGV2ZWx9IGZyb20gJy4uLy4uLy4uL3NyYy9uZ3RzYy9sb2dnaW5nJztcbmltcG9ydCB7TGlua2VyT3B0aW9uc30gZnJvbSAnLi4vLi4vc3JjL2ZpbGVfbGlua2VyL2xpbmtlcl9vcHRpb25zJztcblxuaW1wb3J0IHtjcmVhdGVFczIwMTVMaW5rZXJQbHVnaW59IGZyb20gJy4vZXMyMDE1X2xpbmtlcl9wbHVnaW4nO1xuXG4vKipcbiAqIFRoaXMgaXMgdGhlIEJhYmVsIHBsdWdpbiBkZWZpbml0aW9uIHRoYXQgaXMgcHJvdmlkZWQgYXMgYSBkZWZhdWx0IGV4cG9ydCBmcm9tIHRoZSBwYWNrYWdlLCBzdWNoXG4gKiB0aGF0IHRoZSBwbHVnaW4gY2FuIGJlIHVzZWQgdXNpbmcgdGhlIG1vZHVsZSBzcGVjaWZpZXIgb2YgdGhlIHBhY2thZ2UuIFRoaXMgaXMgdGhlIHJlY29tbWVuZGVkXG4gKiB3YXkgb2YgaW50ZWdyYXRpbmcgdGhlIEFuZ3VsYXIgTGlua2VyIGludG8gYSBidWlsZCBwaXBlbGluZSBvdGhlciB0aGFuIHRoZSBBbmd1bGFyIENMSS5cbiAqXG4gKiBXaGVuIHRoZSBtb2R1bGUgc3BlY2lmaWVyIGBAYW5ndWxhci9jb21waWxlci1jbGkvbGlua2VyL2JhYmVsYCBpcyB1c2VkIGFzIGEgcGx1Z2luIGluIGEgQmFiZWxcbiAqIGNvbmZpZ3VyYXRpb24sIEJhYmVsIGludm9rZXMgdGhpcyBmdW5jdGlvbiAoYnkgbWVhbnMgb2YgdGhlIGRlZmF1bHQgZXhwb3J0KSB0byBjcmVhdGUgdGhlIHBsdWdpblxuICogaW5zdGFuY2UgYWNjb3JkaW5nIHRvIHRoZSBwcm92aWRlZCBvcHRpb25zLlxuICpcbiAqIFRoZSBsaW5rZXIgcGx1Z2luIHRoYXQgaXMgY3JlYXRlZCB1c2VzIHRoZSBuYXRpdmUgTm9kZUpTIGZpbGVzeXN0ZW0gQVBJcyB0byBpbnRlcmFjdCB3aXRoIHRoZVxuICogZmlsZXN5c3RlbS4gQW55IGxvZ2dpbmcgb3V0cHV0IGlzIHByaW50ZWQgdG8gdGhlIGNvbnNvbGUuXG4gKlxuICogQHBhcmFtIGFwaSBQcm92aWRlcyBhY2Nlc3MgdG8gdGhlIEJhYmVsIGVudmlyb25tZW50IHRoYXQgaXMgY29uZmlndXJpbmcgdGhpcyBwbHVnaW4uXG4gKiBAcGFyYW0gb3B0aW9ucyBUaGUgcGx1Z2luIG9wdGlvbnMgdGhhdCBoYXZlIGJlZW4gY29uZmlndXJlZC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGRlZmF1bHRMaW5rZXJQbHVnaW4oYXBpOiBDb25maWdBUEksIG9wdGlvbnM6IFBhcnRpYWw8TGlua2VyT3B0aW9ucz4pOiBQbHVnaW5PYmoge1xuICBhcGkuYXNzZXJ0VmVyc2lvbig3KTtcblxuICByZXR1cm4gY3JlYXRlRXMyMDE1TGlua2VyUGx1Z2luKHtcbiAgICAuLi5vcHRpb25zLFxuICAgIGZpbGVTeXN0ZW06IG5ldyBOb2RlSlNGaWxlU3lzdGVtKCksXG4gICAgbG9nZ2VyOiBuZXcgQ29uc29sZUxvZ2dlcihMb2dMZXZlbC5pbmZvKSxcbiAgfSk7XG59XG4iXX0=