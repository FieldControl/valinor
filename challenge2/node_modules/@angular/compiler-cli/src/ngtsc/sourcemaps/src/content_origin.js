/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/compiler-cli/src/ngtsc/sourcemaps/src/content_origin", ["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ContentOrigin = void 0;
    /**
     * From where the content for a source file or source-map came.
     *
     * - Source files can be linked to source-maps by:
     *   - providing the content inline via a base64 encoded data comment,
     *   - providing a URL to the file path in a comment,
     *   - the loader inferring the source-map path from the source file path.
     * - Source-maps can link to source files by:
     *   - providing the content inline in the `sourcesContent` property
     *   - providing the path to the file in the `sources` property
     */
    var ContentOrigin;
    (function (ContentOrigin) {
        /**
         * The contents were provided programmatically when calling `loadSourceFile()`.
         */
        ContentOrigin[ContentOrigin["Provided"] = 0] = "Provided";
        /**
         * The contents were extracted directly form the contents of the referring file.
         */
        ContentOrigin[ContentOrigin["Inline"] = 1] = "Inline";
        /**
         * The contents were loaded from the file-system, after being explicitly referenced or inferred
         * from the referring file.
         */
        ContentOrigin[ContentOrigin["FileSystem"] = 2] = "FileSystem";
    })(ContentOrigin = exports.ContentOrigin || (exports.ContentOrigin = {}));
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udGVudF9vcmlnaW4uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci1jbGkvc3JjL25ndHNjL3NvdXJjZW1hcHMvc3JjL2NvbnRlbnRfb3JpZ2luLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7OztJQUVIOzs7Ozs7Ozs7O09BVUc7SUFDSCxJQUFZLGFBY1g7SUFkRCxXQUFZLGFBQWE7UUFDdkI7O1dBRUc7UUFDSCx5REFBUSxDQUFBO1FBQ1I7O1dBRUc7UUFDSCxxREFBTSxDQUFBO1FBQ047OztXQUdHO1FBQ0gsNkRBQVUsQ0FBQTtJQUNaLENBQUMsRUFkVyxhQUFhLEdBQWIscUJBQWEsS0FBYixxQkFBYSxRQWN4QiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG4vKipcbiAqIEZyb20gd2hlcmUgdGhlIGNvbnRlbnQgZm9yIGEgc291cmNlIGZpbGUgb3Igc291cmNlLW1hcCBjYW1lLlxuICpcbiAqIC0gU291cmNlIGZpbGVzIGNhbiBiZSBsaW5rZWQgdG8gc291cmNlLW1hcHMgYnk6XG4gKiAgIC0gcHJvdmlkaW5nIHRoZSBjb250ZW50IGlubGluZSB2aWEgYSBiYXNlNjQgZW5jb2RlZCBkYXRhIGNvbW1lbnQsXG4gKiAgIC0gcHJvdmlkaW5nIGEgVVJMIHRvIHRoZSBmaWxlIHBhdGggaW4gYSBjb21tZW50LFxuICogICAtIHRoZSBsb2FkZXIgaW5mZXJyaW5nIHRoZSBzb3VyY2UtbWFwIHBhdGggZnJvbSB0aGUgc291cmNlIGZpbGUgcGF0aC5cbiAqIC0gU291cmNlLW1hcHMgY2FuIGxpbmsgdG8gc291cmNlIGZpbGVzIGJ5OlxuICogICAtIHByb3ZpZGluZyB0aGUgY29udGVudCBpbmxpbmUgaW4gdGhlIGBzb3VyY2VzQ29udGVudGAgcHJvcGVydHlcbiAqICAgLSBwcm92aWRpbmcgdGhlIHBhdGggdG8gdGhlIGZpbGUgaW4gdGhlIGBzb3VyY2VzYCBwcm9wZXJ0eVxuICovXG5leHBvcnQgZW51bSBDb250ZW50T3JpZ2luIHtcbiAgLyoqXG4gICAqIFRoZSBjb250ZW50cyB3ZXJlIHByb3ZpZGVkIHByb2dyYW1tYXRpY2FsbHkgd2hlbiBjYWxsaW5nIGBsb2FkU291cmNlRmlsZSgpYC5cbiAgICovXG4gIFByb3ZpZGVkLFxuICAvKipcbiAgICogVGhlIGNvbnRlbnRzIHdlcmUgZXh0cmFjdGVkIGRpcmVjdGx5IGZvcm0gdGhlIGNvbnRlbnRzIG9mIHRoZSByZWZlcnJpbmcgZmlsZS5cbiAgICovXG4gIElubGluZSxcbiAgLyoqXG4gICAqIFRoZSBjb250ZW50cyB3ZXJlIGxvYWRlZCBmcm9tIHRoZSBmaWxlLXN5c3RlbSwgYWZ0ZXIgYmVpbmcgZXhwbGljaXRseSByZWZlcmVuY2VkIG9yIGluZmVycmVkXG4gICAqIGZyb20gdGhlIHJlZmVycmluZyBmaWxlLlxuICAgKi9cbiAgRmlsZVN5c3RlbSxcbn1cbiJdfQ==