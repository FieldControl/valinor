(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/compiler-cli/linker/babel/src/linker_plugin_options", ["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGlua2VyX3BsdWdpbl9vcHRpb25zLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXItY2xpL2xpbmtlci9iYWJlbC9zcmMvbGlua2VyX3BsdWdpbl9vcHRpb25zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCB7TGlua2VyT3B0aW9uc30gZnJvbSAnLi4vLi4nO1xuaW1wb3J0IHtSZWFkb25seUZpbGVTeXN0ZW19IGZyb20gJy4uLy4uLy4uL3NyYy9uZ3RzYy9maWxlX3N5c3RlbSc7XG5pbXBvcnQge0xvZ2dlcn0gZnJvbSAnLi4vLi4vLi4vc3JjL25ndHNjL2xvZ2dpbmcnO1xuXG5leHBvcnQgaW50ZXJmYWNlIExpbmtlclBsdWdpbk9wdGlvbnMgZXh0ZW5kcyBQYXJ0aWFsPExpbmtlck9wdGlvbnM+IHtcbiAgLyoqXG4gICAqIEZpbGUtc3lzdGVtLCB1c2VkIHRvIGxvYWQgdXAgdGhlIGlucHV0IHNvdXJjZS1tYXAgYW5kIGNvbnRlbnQuXG4gICAqL1xuICBmaWxlU3lzdGVtOiBSZWFkb25seUZpbGVTeXN0ZW07XG5cbiAgLyoqXG4gICAqIExvZ2dlciB1c2VkIGJ5IHRoZSBsaW5rZXIuXG4gICAqL1xuICBsb2dnZXI6IExvZ2dlcjtcbn1cbiJdfQ==