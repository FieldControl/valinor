"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.logExperimentalWarnings = void 0;
const UNSUPPORTED_OPTIONS = [
    'budgets',
    'progress',
    'scripts',
    // * i18n support
    'localize',
    // The following two have no effect when localize is not enabled
    // 'i18nDuplicateTranslation',
    // 'i18nMissingTranslation',
    // * Deprecated
    'deployUrl',
    // * Always enabled with esbuild
    // 'commonChunk',
    // * Currently unsupported by esbuild
    'namedChunks',
    'vendorChunk',
    'webWorkerTsConfig',
];
function logExperimentalWarnings(options, context) {
    // Warn about experimental status of this builder
    context.logger.warn(`The esbuild browser application builder ('browser-esbuild') is currently experimental.`);
    // Validate supported options
    // Currently only a subset of the Webpack-based browser builder options are supported.
    for (const unsupportedOption of UNSUPPORTED_OPTIONS) {
        const value = options[unsupportedOption];
        if (value === undefined || value === false) {
            continue;
        }
        if (Array.isArray(value) && value.length === 0) {
            continue;
        }
        if (typeof value === 'object' && Object.keys(value).length === 0) {
            continue;
        }
        context.logger.warn(`The '${unsupportedOption}' option is currently unsupported by this experimental builder and will be ignored.`);
    }
}
exports.logExperimentalWarnings = logExperimentalWarnings;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXhwZXJpbWVudGFsLXdhcm5pbmdzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvYW5ndWxhcl9kZXZraXQvYnVpbGRfYW5ndWxhci9zcmMvYnVpbGRlcnMvYnJvd3Nlci1lc2J1aWxkL2V4cGVyaW1lbnRhbC13YXJuaW5ncy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7OztHQU1HOzs7QUFLSCxNQUFNLG1CQUFtQixHQUF1QztJQUM5RCxTQUFTO0lBQ1QsVUFBVTtJQUNWLFNBQVM7SUFFVCxpQkFBaUI7SUFDakIsVUFBVTtJQUNWLGdFQUFnRTtJQUNoRSw4QkFBOEI7SUFDOUIsNEJBQTRCO0lBRTVCLGVBQWU7SUFDZixXQUFXO0lBRVgsZ0NBQWdDO0lBQ2hDLGlCQUFpQjtJQUVqQixxQ0FBcUM7SUFDckMsYUFBYTtJQUNiLGFBQWE7SUFDYixtQkFBbUI7Q0FDcEIsQ0FBQztBQUVGLFNBQWdCLHVCQUF1QixDQUFDLE9BQThCLEVBQUUsT0FBdUI7SUFDN0YsaURBQWlEO0lBQ2pELE9BQU8sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUNqQix3RkFBd0YsQ0FDekYsQ0FBQztJQUVGLDZCQUE2QjtJQUM3QixzRkFBc0Y7SUFDdEYsS0FBSyxNQUFNLGlCQUFpQixJQUFJLG1CQUFtQixFQUFFO1FBQ25ELE1BQU0sS0FBSyxHQUFHLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO1FBRXpDLElBQUksS0FBSyxLQUFLLFNBQVMsSUFBSSxLQUFLLEtBQUssS0FBSyxFQUFFO1lBQzFDLFNBQVM7U0FDVjtRQUNELElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsSUFBSSxLQUFLLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtZQUM5QyxTQUFTO1NBQ1Y7UUFDRCxJQUFJLE9BQU8sS0FBSyxLQUFLLFFBQVEsSUFBSSxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7WUFDaEUsU0FBUztTQUNWO1FBRUQsT0FBTyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQ2pCLFFBQVEsaUJBQWlCLHFGQUFxRixDQUMvRyxDQUFDO0tBQ0g7QUFDSCxDQUFDO0FBekJELDBEQXlCQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQgeyBCdWlsZGVyQ29udGV4dCB9IGZyb20gJ0Bhbmd1bGFyLWRldmtpdC9hcmNoaXRlY3QnO1xuaW1wb3J0IHsgU2NoZW1hIGFzIEJyb3dzZXJCdWlsZGVyT3B0aW9ucyB9IGZyb20gJy4uL2Jyb3dzZXIvc2NoZW1hJztcblxuY29uc3QgVU5TVVBQT1JURURfT1BUSU9OUzogQXJyYXk8a2V5b2YgQnJvd3NlckJ1aWxkZXJPcHRpb25zPiA9IFtcbiAgJ2J1ZGdldHMnLFxuICAncHJvZ3Jlc3MnLFxuICAnc2NyaXB0cycsXG5cbiAgLy8gKiBpMThuIHN1cHBvcnRcbiAgJ2xvY2FsaXplJyxcbiAgLy8gVGhlIGZvbGxvd2luZyB0d28gaGF2ZSBubyBlZmZlY3Qgd2hlbiBsb2NhbGl6ZSBpcyBub3QgZW5hYmxlZFxuICAvLyAnaTE4bkR1cGxpY2F0ZVRyYW5zbGF0aW9uJyxcbiAgLy8gJ2kxOG5NaXNzaW5nVHJhbnNsYXRpb24nLFxuXG4gIC8vICogRGVwcmVjYXRlZFxuICAnZGVwbG95VXJsJyxcblxuICAvLyAqIEFsd2F5cyBlbmFibGVkIHdpdGggZXNidWlsZFxuICAvLyAnY29tbW9uQ2h1bmsnLFxuXG4gIC8vICogQ3VycmVudGx5IHVuc3VwcG9ydGVkIGJ5IGVzYnVpbGRcbiAgJ25hbWVkQ2h1bmtzJyxcbiAgJ3ZlbmRvckNodW5rJyxcbiAgJ3dlYldvcmtlclRzQ29uZmlnJyxcbl07XG5cbmV4cG9ydCBmdW5jdGlvbiBsb2dFeHBlcmltZW50YWxXYXJuaW5ncyhvcHRpb25zOiBCcm93c2VyQnVpbGRlck9wdGlvbnMsIGNvbnRleHQ6IEJ1aWxkZXJDb250ZXh0KSB7XG4gIC8vIFdhcm4gYWJvdXQgZXhwZXJpbWVudGFsIHN0YXR1cyBvZiB0aGlzIGJ1aWxkZXJcbiAgY29udGV4dC5sb2dnZXIud2FybihcbiAgICBgVGhlIGVzYnVpbGQgYnJvd3NlciBhcHBsaWNhdGlvbiBidWlsZGVyICgnYnJvd3Nlci1lc2J1aWxkJykgaXMgY3VycmVudGx5IGV4cGVyaW1lbnRhbC5gLFxuICApO1xuXG4gIC8vIFZhbGlkYXRlIHN1cHBvcnRlZCBvcHRpb25zXG4gIC8vIEN1cnJlbnRseSBvbmx5IGEgc3Vic2V0IG9mIHRoZSBXZWJwYWNrLWJhc2VkIGJyb3dzZXIgYnVpbGRlciBvcHRpb25zIGFyZSBzdXBwb3J0ZWQuXG4gIGZvciAoY29uc3QgdW5zdXBwb3J0ZWRPcHRpb24gb2YgVU5TVVBQT1JURURfT1BUSU9OUykge1xuICAgIGNvbnN0IHZhbHVlID0gb3B0aW9uc1t1bnN1cHBvcnRlZE9wdGlvbl07XG5cbiAgICBpZiAodmFsdWUgPT09IHVuZGVmaW5lZCB8fCB2YWx1ZSA9PT0gZmFsc2UpIHtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cbiAgICBpZiAoQXJyYXkuaXNBcnJheSh2YWx1ZSkgJiYgdmFsdWUubGVuZ3RoID09PSAwKSB7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG4gICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcgJiYgT2JqZWN0LmtleXModmFsdWUpLmxlbmd0aCA9PT0gMCkge1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgY29udGV4dC5sb2dnZXIud2FybihcbiAgICAgIGBUaGUgJyR7dW5zdXBwb3J0ZWRPcHRpb259JyBvcHRpb24gaXMgY3VycmVudGx5IHVuc3VwcG9ydGVkIGJ5IHRoaXMgZXhwZXJpbWVudGFsIGJ1aWxkZXIgYW5kIHdpbGwgYmUgaWdub3JlZC5gLFxuICAgICk7XG4gIH1cbn1cbiJdfQ==