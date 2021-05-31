(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/compiler-cli/ngcc/src/path_mappings", ["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getPathMappingsFromTsConfig = void 0;
    /**
     * If `pathMappings` is not provided directly, then try getting it from `tsConfig`, if available.
     */
    function getPathMappingsFromTsConfig(fs, tsConfig, projectPath) {
        if (tsConfig !== null && tsConfig.options.baseUrl !== undefined &&
            tsConfig.options.paths !== undefined) {
            return {
                baseUrl: fs.resolve(projectPath, tsConfig.options.baseUrl),
                paths: tsConfig.options.paths,
            };
        }
    }
    exports.getPathMappingsFromTsConfig = getPathMappingsFromTsConfig;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGF0aF9tYXBwaW5ncy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyLWNsaS9uZ2NjL3NyYy9wYXRoX21hcHBpbmdzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztJQWVBOztPQUVHO0lBQ0gsU0FBZ0IsMkJBQTJCLENBQ3ZDLEVBQW9CLEVBQUUsUUFBa0MsRUFDeEQsV0FBMkI7UUFDN0IsSUFBSSxRQUFRLEtBQUssSUFBSSxJQUFJLFFBQVEsQ0FBQyxPQUFPLENBQUMsT0FBTyxLQUFLLFNBQVM7WUFDM0QsUUFBUSxDQUFDLE9BQU8sQ0FBQyxLQUFLLEtBQUssU0FBUyxFQUFFO1lBQ3hDLE9BQU87Z0JBQ0wsT0FBTyxFQUFFLEVBQUUsQ0FBQyxPQUFPLENBQUMsV0FBVyxFQUFFLFFBQVEsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDO2dCQUMxRCxLQUFLLEVBQUUsUUFBUSxDQUFDLE9BQU8sQ0FBQyxLQUFLO2FBQzlCLENBQUM7U0FDSDtJQUNILENBQUM7SUFWRCxrRUFVQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuaW1wb3J0IHtBYnNvbHV0ZUZzUGF0aCwgUGF0aE1hbmlwdWxhdGlvbn0gZnJvbSAnLi4vLi4vc3JjL25ndHNjL2ZpbGVfc3lzdGVtJztcbmltcG9ydCB7UGFyc2VkQ29uZmlndXJhdGlvbn0gZnJvbSAnLi4vLi4vc3JjL3BlcmZvcm1fY29tcGlsZSc7XG5cbmV4cG9ydCB0eXBlIFBhdGhNYXBwaW5ncyA9IHtcbiAgYmFzZVVybDogc3RyaW5nLFxuICBwYXRoczoge1trZXk6IHN0cmluZ106IHN0cmluZ1tdfVxufTtcblxuLyoqXG4gKiBJZiBgcGF0aE1hcHBpbmdzYCBpcyBub3QgcHJvdmlkZWQgZGlyZWN0bHksIHRoZW4gdHJ5IGdldHRpbmcgaXQgZnJvbSBgdHNDb25maWdgLCBpZiBhdmFpbGFibGUuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRQYXRoTWFwcGluZ3NGcm9tVHNDb25maWcoXG4gICAgZnM6IFBhdGhNYW5pcHVsYXRpb24sIHRzQ29uZmlnOiBQYXJzZWRDb25maWd1cmF0aW9ufG51bGwsXG4gICAgcHJvamVjdFBhdGg6IEFic29sdXRlRnNQYXRoKTogUGF0aE1hcHBpbmdzfHVuZGVmaW5lZCB7XG4gIGlmICh0c0NvbmZpZyAhPT0gbnVsbCAmJiB0c0NvbmZpZy5vcHRpb25zLmJhc2VVcmwgIT09IHVuZGVmaW5lZCAmJlxuICAgICAgdHNDb25maWcub3B0aW9ucy5wYXRocyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGJhc2VVcmw6IGZzLnJlc29sdmUocHJvamVjdFBhdGgsIHRzQ29uZmlnLm9wdGlvbnMuYmFzZVVybCksXG4gICAgICBwYXRoczogdHNDb25maWcub3B0aW9ucy5wYXRocyxcbiAgICB9O1xuICB9XG59XG4iXX0=