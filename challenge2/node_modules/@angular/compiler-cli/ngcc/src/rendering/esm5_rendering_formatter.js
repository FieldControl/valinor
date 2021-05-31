(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/compiler-cli/ngcc/src/rendering/esm5_rendering_formatter", ["require", "exports", "tslib", "typescript", "@angular/compiler-cli/src/ngtsc/translator", "@angular/compiler-cli/ngcc/src/host/esm2015_host", "@angular/compiler-cli/ngcc/src/rendering/esm_rendering_formatter"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Esm5RenderingFormatter = void 0;
    var tslib_1 = require("tslib");
    var ts = require("typescript");
    var translator_1 = require("@angular/compiler-cli/src/ngtsc/translator");
    var esm2015_host_1 = require("@angular/compiler-cli/ngcc/src/host/esm2015_host");
    var esm_rendering_formatter_1 = require("@angular/compiler-cli/ngcc/src/rendering/esm_rendering_formatter");
    /**
     * A RenderingFormatter that works with files that use ECMAScript Module `import` and `export`
     * statements, but instead of `class` declarations it uses ES5 `function` wrappers for classes.
     */
    var Esm5RenderingFormatter = /** @class */ (function (_super) {
        tslib_1.__extends(Esm5RenderingFormatter, _super);
        function Esm5RenderingFormatter() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        /**
         * Add the definitions, directly before the return statement, inside the IIFE of each decorated
         * class.
         */
        Esm5RenderingFormatter.prototype.addDefinitions = function (output, compiledClass, definitions) {
            var classSymbol = this.host.getClassSymbol(compiledClass.declaration);
            if (!classSymbol) {
                throw new Error("Compiled class \"" + compiledClass.name + "\" in \"" + compiledClass.declaration.getSourceFile()
                    .fileName + "\" does not have a valid syntax.\n" +
                    "Expected an ES5 IIFE wrapped function. But got:\n" +
                    compiledClass.declaration.getText());
            }
            var declarationStatement = esm2015_host_1.getContainingStatement(classSymbol.implementation.valueDeclaration);
            var iifeBody = declarationStatement.parent;
            if (!iifeBody || !ts.isBlock(iifeBody)) {
                throw new Error("Compiled class declaration is not inside an IIFE: " + compiledClass.name + " in " + compiledClass.declaration.getSourceFile().fileName);
            }
            var returnStatement = iifeBody.statements.find(ts.isReturnStatement);
            if (!returnStatement) {
                throw new Error("Compiled class wrapper IIFE does not have a return statement: " + compiledClass.name + " in " + compiledClass.declaration.getSourceFile().fileName);
            }
            var insertionPoint = returnStatement.getFullStart();
            output.appendLeft(insertionPoint, '\n' + definitions);
        };
        /**
         * Convert a `Statement` to JavaScript code in a format suitable for rendering by this formatter.
         *
         * @param stmt The `Statement` to print.
         * @param sourceFile A `ts.SourceFile` that provides context for the statement. See
         *     `ts.Printer#printNode()` for more info.
         * @param importManager The `ImportManager` to use for managing imports.
         *
         * @return The JavaScript code corresponding to `stmt` (in the appropriate format).
         */
        Esm5RenderingFormatter.prototype.printStatement = function (stmt, sourceFile, importManager) {
            var node = translator_1.translateStatement(stmt, importManager, { downlevelTaggedTemplates: true, downlevelVariableDeclarations: true });
            var code = this.printer.printNode(ts.EmitHint.Unspecified, node, sourceFile);
            return code;
        };
        return Esm5RenderingFormatter;
    }(esm_rendering_formatter_1.EsmRenderingFormatter));
    exports.Esm5RenderingFormatter = Esm5RenderingFormatter;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXNtNV9yZW5kZXJpbmdfZm9ybWF0dGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXItY2xpL25nY2Mvc3JjL3JlbmRlcmluZy9lc201X3JlbmRlcmluZ19mb3JtYXR0ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OztJQVNBLCtCQUFpQztJQUVqQyx5RUFBZ0Y7SUFFaEYsaUZBQTREO0lBRTVELDRHQUFnRTtJQUVoRTs7O09BR0c7SUFDSDtRQUE0QyxrREFBcUI7UUFBakU7O1FBbURBLENBQUM7UUFsREM7OztXQUdHO1FBQ0gsK0NBQWMsR0FBZCxVQUFlLE1BQW1CLEVBQUUsYUFBNEIsRUFBRSxXQUFtQjtZQUNuRixJQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxhQUFhLENBQUMsV0FBVyxDQUFDLENBQUM7WUFDeEUsSUFBSSxDQUFDLFdBQVcsRUFBRTtnQkFDaEIsTUFBTSxJQUFJLEtBQUssQ0FDWCxzQkFBbUIsYUFBYSxDQUFDLElBQUksZ0JBQ2pDLGFBQWEsQ0FBQyxXQUFXLENBQUMsYUFBYSxFQUFFO3FCQUNwQyxRQUFRLHVDQUFtQztvQkFDcEQsbURBQW1EO29CQUNuRCxhQUFhLENBQUMsV0FBVyxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUM7YUFDMUM7WUFDRCxJQUFNLG9CQUFvQixHQUN0QixxQ0FBc0IsQ0FBQyxXQUFXLENBQUMsY0FBYyxDQUFDLGdCQUFnQixDQUFDLENBQUM7WUFFeEUsSUFBTSxRQUFRLEdBQUcsb0JBQW9CLENBQUMsTUFBTSxDQUFDO1lBQzdDLElBQUksQ0FBQyxRQUFRLElBQUksQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxFQUFFO2dCQUN0QyxNQUFNLElBQUksS0FBSyxDQUFDLHVEQUFxRCxhQUFhLENBQUMsSUFBSSxZQUNuRixhQUFhLENBQUMsV0FBVyxDQUFDLGFBQWEsRUFBRSxDQUFDLFFBQVUsQ0FBQyxDQUFDO2FBQzNEO1lBRUQsSUFBTSxlQUFlLEdBQUcsUUFBUSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLGlCQUFpQixDQUFDLENBQUM7WUFDdkUsSUFBSSxDQUFDLGVBQWUsRUFBRTtnQkFDcEIsTUFBTSxJQUFJLEtBQUssQ0FBQyxtRUFDWixhQUFhLENBQUMsSUFBSSxZQUFPLGFBQWEsQ0FBQyxXQUFXLENBQUMsYUFBYSxFQUFFLENBQUMsUUFBVSxDQUFDLENBQUM7YUFDcEY7WUFFRCxJQUFNLGNBQWMsR0FBRyxlQUFlLENBQUMsWUFBWSxFQUFFLENBQUM7WUFDdEQsTUFBTSxDQUFDLFVBQVUsQ0FBQyxjQUFjLEVBQUUsSUFBSSxHQUFHLFdBQVcsQ0FBQyxDQUFDO1FBQ3hELENBQUM7UUFFRDs7Ozs7Ozs7O1dBU0c7UUFDSCwrQ0FBYyxHQUFkLFVBQWUsSUFBZSxFQUFFLFVBQXlCLEVBQUUsYUFBNEI7WUFDckYsSUFBTSxJQUFJLEdBQUcsK0JBQWtCLENBQzNCLElBQUksRUFBRSxhQUFhLEVBQUUsRUFBQyx3QkFBd0IsRUFBRSxJQUFJLEVBQUUsNkJBQTZCLEVBQUUsSUFBSSxFQUFDLENBQUMsQ0FBQztZQUNoRyxJQUFNLElBQUksR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsUUFBUSxDQUFDLFdBQVcsRUFBRSxJQUFJLEVBQUUsVUFBVSxDQUFDLENBQUM7WUFFL0UsT0FBTyxJQUFJLENBQUM7UUFDZCxDQUFDO1FBQ0gsNkJBQUM7SUFBRCxDQUFDLEFBbkRELENBQTRDLCtDQUFxQixHQW1EaEU7SUFuRFksd0RBQXNCIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5pbXBvcnQge1N0YXRlbWVudH0gZnJvbSAnQGFuZ3VsYXIvY29tcGlsZXInO1xuaW1wb3J0IE1hZ2ljU3RyaW5nIGZyb20gJ21hZ2ljLXN0cmluZyc7XG5pbXBvcnQgKiBhcyB0cyBmcm9tICd0eXBlc2NyaXB0JztcblxuaW1wb3J0IHtJbXBvcnRNYW5hZ2VyLCB0cmFuc2xhdGVTdGF0ZW1lbnR9IGZyb20gJy4uLy4uLy4uL3NyYy9uZ3RzYy90cmFuc2xhdG9yJztcbmltcG9ydCB7Q29tcGlsZWRDbGFzc30gZnJvbSAnLi4vYW5hbHlzaXMvdHlwZXMnO1xuaW1wb3J0IHtnZXRDb250YWluaW5nU3RhdGVtZW50fSBmcm9tICcuLi9ob3N0L2VzbTIwMTVfaG9zdCc7XG5cbmltcG9ydCB7RXNtUmVuZGVyaW5nRm9ybWF0dGVyfSBmcm9tICcuL2VzbV9yZW5kZXJpbmdfZm9ybWF0dGVyJztcblxuLyoqXG4gKiBBIFJlbmRlcmluZ0Zvcm1hdHRlciB0aGF0IHdvcmtzIHdpdGggZmlsZXMgdGhhdCB1c2UgRUNNQVNjcmlwdCBNb2R1bGUgYGltcG9ydGAgYW5kIGBleHBvcnRgXG4gKiBzdGF0ZW1lbnRzLCBidXQgaW5zdGVhZCBvZiBgY2xhc3NgIGRlY2xhcmF0aW9ucyBpdCB1c2VzIEVTNSBgZnVuY3Rpb25gIHdyYXBwZXJzIGZvciBjbGFzc2VzLlxuICovXG5leHBvcnQgY2xhc3MgRXNtNVJlbmRlcmluZ0Zvcm1hdHRlciBleHRlbmRzIEVzbVJlbmRlcmluZ0Zvcm1hdHRlciB7XG4gIC8qKlxuICAgKiBBZGQgdGhlIGRlZmluaXRpb25zLCBkaXJlY3RseSBiZWZvcmUgdGhlIHJldHVybiBzdGF0ZW1lbnQsIGluc2lkZSB0aGUgSUlGRSBvZiBlYWNoIGRlY29yYXRlZFxuICAgKiBjbGFzcy5cbiAgICovXG4gIGFkZERlZmluaXRpb25zKG91dHB1dDogTWFnaWNTdHJpbmcsIGNvbXBpbGVkQ2xhc3M6IENvbXBpbGVkQ2xhc3MsIGRlZmluaXRpb25zOiBzdHJpbmcpOiB2b2lkIHtcbiAgICBjb25zdCBjbGFzc1N5bWJvbCA9IHRoaXMuaG9zdC5nZXRDbGFzc1N5bWJvbChjb21waWxlZENsYXNzLmRlY2xhcmF0aW9uKTtcbiAgICBpZiAoIWNsYXNzU3ltYm9sKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgYENvbXBpbGVkIGNsYXNzIFwiJHtjb21waWxlZENsYXNzLm5hbWV9XCIgaW4gXCIke1xuICAgICAgICAgICAgICBjb21waWxlZENsYXNzLmRlY2xhcmF0aW9uLmdldFNvdXJjZUZpbGUoKVxuICAgICAgICAgICAgICAgICAgLmZpbGVOYW1lfVwiIGRvZXMgbm90IGhhdmUgYSB2YWxpZCBzeW50YXguXFxuYCArXG4gICAgICAgICAgYEV4cGVjdGVkIGFuIEVTNSBJSUZFIHdyYXBwZWQgZnVuY3Rpb24uIEJ1dCBnb3Q6XFxuYCArXG4gICAgICAgICAgY29tcGlsZWRDbGFzcy5kZWNsYXJhdGlvbi5nZXRUZXh0KCkpO1xuICAgIH1cbiAgICBjb25zdCBkZWNsYXJhdGlvblN0YXRlbWVudCA9XG4gICAgICAgIGdldENvbnRhaW5pbmdTdGF0ZW1lbnQoY2xhc3NTeW1ib2wuaW1wbGVtZW50YXRpb24udmFsdWVEZWNsYXJhdGlvbik7XG5cbiAgICBjb25zdCBpaWZlQm9keSA9IGRlY2xhcmF0aW9uU3RhdGVtZW50LnBhcmVudDtcbiAgICBpZiAoIWlpZmVCb2R5IHx8ICF0cy5pc0Jsb2NrKGlpZmVCb2R5KSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBDb21waWxlZCBjbGFzcyBkZWNsYXJhdGlvbiBpcyBub3QgaW5zaWRlIGFuIElJRkU6ICR7Y29tcGlsZWRDbGFzcy5uYW1lfSBpbiAke1xuICAgICAgICAgIGNvbXBpbGVkQ2xhc3MuZGVjbGFyYXRpb24uZ2V0U291cmNlRmlsZSgpLmZpbGVOYW1lfWApO1xuICAgIH1cblxuICAgIGNvbnN0IHJldHVyblN0YXRlbWVudCA9IGlpZmVCb2R5LnN0YXRlbWVudHMuZmluZCh0cy5pc1JldHVyblN0YXRlbWVudCk7XG4gICAgaWYgKCFyZXR1cm5TdGF0ZW1lbnQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgQ29tcGlsZWQgY2xhc3Mgd3JhcHBlciBJSUZFIGRvZXMgbm90IGhhdmUgYSByZXR1cm4gc3RhdGVtZW50OiAke1xuICAgICAgICAgIGNvbXBpbGVkQ2xhc3MubmFtZX0gaW4gJHtjb21waWxlZENsYXNzLmRlY2xhcmF0aW9uLmdldFNvdXJjZUZpbGUoKS5maWxlTmFtZX1gKTtcbiAgICB9XG5cbiAgICBjb25zdCBpbnNlcnRpb25Qb2ludCA9IHJldHVyblN0YXRlbWVudC5nZXRGdWxsU3RhcnQoKTtcbiAgICBvdXRwdXQuYXBwZW5kTGVmdChpbnNlcnRpb25Qb2ludCwgJ1xcbicgKyBkZWZpbml0aW9ucyk7XG4gIH1cblxuICAvKipcbiAgICogQ29udmVydCBhIGBTdGF0ZW1lbnRgIHRvIEphdmFTY3JpcHQgY29kZSBpbiBhIGZvcm1hdCBzdWl0YWJsZSBmb3IgcmVuZGVyaW5nIGJ5IHRoaXMgZm9ybWF0dGVyLlxuICAgKlxuICAgKiBAcGFyYW0gc3RtdCBUaGUgYFN0YXRlbWVudGAgdG8gcHJpbnQuXG4gICAqIEBwYXJhbSBzb3VyY2VGaWxlIEEgYHRzLlNvdXJjZUZpbGVgIHRoYXQgcHJvdmlkZXMgY29udGV4dCBmb3IgdGhlIHN0YXRlbWVudC4gU2VlXG4gICAqICAgICBgdHMuUHJpbnRlciNwcmludE5vZGUoKWAgZm9yIG1vcmUgaW5mby5cbiAgICogQHBhcmFtIGltcG9ydE1hbmFnZXIgVGhlIGBJbXBvcnRNYW5hZ2VyYCB0byB1c2UgZm9yIG1hbmFnaW5nIGltcG9ydHMuXG4gICAqXG4gICAqIEByZXR1cm4gVGhlIEphdmFTY3JpcHQgY29kZSBjb3JyZXNwb25kaW5nIHRvIGBzdG10YCAoaW4gdGhlIGFwcHJvcHJpYXRlIGZvcm1hdCkuXG4gICAqL1xuICBwcmludFN0YXRlbWVudChzdG10OiBTdGF0ZW1lbnQsIHNvdXJjZUZpbGU6IHRzLlNvdXJjZUZpbGUsIGltcG9ydE1hbmFnZXI6IEltcG9ydE1hbmFnZXIpOiBzdHJpbmcge1xuICAgIGNvbnN0IG5vZGUgPSB0cmFuc2xhdGVTdGF0ZW1lbnQoXG4gICAgICAgIHN0bXQsIGltcG9ydE1hbmFnZXIsIHtkb3dubGV2ZWxUYWdnZWRUZW1wbGF0ZXM6IHRydWUsIGRvd25sZXZlbFZhcmlhYmxlRGVjbGFyYXRpb25zOiB0cnVlfSk7XG4gICAgY29uc3QgY29kZSA9IHRoaXMucHJpbnRlci5wcmludE5vZGUodHMuRW1pdEhpbnQuVW5zcGVjaWZpZWQsIG5vZGUsIHNvdXJjZUZpbGUpO1xuXG4gICAgcmV0dXJuIGNvZGU7XG4gIH1cbn1cbiJdfQ==