"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InlineCriticalCssProcessor = void 0;
const fs = __importStar(require("fs"));
const Critters = require('critters');
class CrittersExtended extends Critters {
    constructor(optionsExtended) {
        super({
            logger: {
                warn: (s) => this.warnings.push(s),
                error: (s) => this.errors.push(s),
                info: () => { },
            },
            logLevel: 'warn',
            path: optionsExtended.outputPath,
            publicPath: optionsExtended.deployUrl,
            compress: !!optionsExtended.minify,
            pruneSource: false,
            reduceInlineStyles: false,
            mergeStylesheets: false,
            preload: 'media',
            noscriptFallback: true,
            inlineFonts: true,
        });
        this.optionsExtended = optionsExtended;
        this.warnings = [];
        this.errors = [];
    }
    readFile(path) {
        const readAsset = this.optionsExtended.readAsset;
        return readAsset ? readAsset(path) : fs.promises.readFile(path, 'utf-8');
    }
}
class InlineCriticalCssProcessor {
    constructor(options) {
        this.options = options;
    }
    async process(html, options) {
        const critters = new CrittersExtended({ ...this.options, ...options });
        const content = await critters.process(html);
        return {
            // Clean up value from value less attributes.
            // This is caused because parse5 always requires attributes to have a string value.
            // nomodule="" defer="" -> nomodule defer.
            content: content.replace(/(\s(?:defer|nomodule))=""/g, '$1'),
            errors: critters.errors,
            warnings: critters.warnings,
        };
    }
}
exports.InlineCriticalCssProcessor = InlineCriticalCssProcessor;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5saW5lLWNyaXRpY2FsLWNzcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2FuZ3VsYXJfZGV2a2l0L2J1aWxkX2FuZ3VsYXIvc3JjL3V0aWxzL2luZGV4LWZpbGUvaW5saW5lLWNyaXRpY2FsLWNzcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUVILHVDQUF5QjtBQUV6QixNQUFNLFFBQVEsR0FBc0MsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0FBWXhFLE1BQU0sZ0JBQWlCLFNBQVEsUUFBUTtJQUlyQyxZQUNtQixlQUNnQjtRQUVqQyxLQUFLLENBQUM7WUFDSixNQUFNLEVBQUU7Z0JBQ04sSUFBSSxFQUFFLENBQUMsQ0FBUyxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7Z0JBQzFDLEtBQUssRUFBRSxDQUFDLENBQVMsRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO2dCQUN6QyxJQUFJLEVBQUUsR0FBRyxFQUFFLEdBQUUsQ0FBQzthQUNmO1lBQ0QsUUFBUSxFQUFFLE1BQU07WUFDaEIsSUFBSSxFQUFFLGVBQWUsQ0FBQyxVQUFVO1lBQ2hDLFVBQVUsRUFBRSxlQUFlLENBQUMsU0FBUztZQUNyQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLGVBQWUsQ0FBQyxNQUFNO1lBQ2xDLFdBQVcsRUFBRSxLQUFLO1lBQ2xCLGtCQUFrQixFQUFFLEtBQUs7WUFDekIsZ0JBQWdCLEVBQUUsS0FBSztZQUN2QixPQUFPLEVBQUUsT0FBTztZQUNoQixnQkFBZ0IsRUFBRSxJQUFJO1lBQ3RCLFdBQVcsRUFBRSxJQUFJO1NBQ2xCLENBQUMsQ0FBQztRQW5CYyxvQkFBZSxHQUFmLGVBQWUsQ0FDQztRQUwxQixhQUFRLEdBQWEsRUFBRSxDQUFDO1FBQ3hCLFdBQU0sR0FBYSxFQUFFLENBQUM7SUF1Qi9CLENBQUM7SUFFZSxRQUFRLENBQUMsSUFBWTtRQUNuQyxNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDLFNBQVMsQ0FBQztRQUVqRCxPQUFPLFNBQVMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFDM0UsQ0FBQztDQUNGO0FBRUQsTUFBYSwwQkFBMEI7SUFDckMsWUFBK0IsT0FBMEM7UUFBMUMsWUFBTyxHQUFQLE9BQU8sQ0FBbUM7SUFBRyxDQUFDO0lBRTdFLEtBQUssQ0FBQyxPQUFPLENBQ1gsSUFBWSxFQUNaLE9BQXdDO1FBRXhDLE1BQU0sUUFBUSxHQUFHLElBQUksZ0JBQWdCLENBQUMsRUFBRSxHQUFHLElBQUksQ0FBQyxPQUFPLEVBQUUsR0FBRyxPQUFPLEVBQUUsQ0FBQyxDQUFDO1FBQ3ZFLE1BQU0sT0FBTyxHQUFHLE1BQU0sUUFBUSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUU3QyxPQUFPO1lBQ0wsNkNBQTZDO1lBQzdDLG1GQUFtRjtZQUNuRiwwQ0FBMEM7WUFDMUMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxPQUFPLENBQUMsNEJBQTRCLEVBQUUsSUFBSSxDQUFDO1lBQzVELE1BQU0sRUFBRSxRQUFRLENBQUMsTUFBTTtZQUN2QixRQUFRLEVBQUUsUUFBUSxDQUFDLFFBQVE7U0FDNUIsQ0FBQztJQUNKLENBQUM7Q0FDRjtBQW5CRCxnRUFtQkMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0ICogYXMgZnMgZnJvbSAnZnMnO1xuXG5jb25zdCBDcml0dGVyczogdHlwZW9mIGltcG9ydCgnY3JpdHRlcnMnKS5kZWZhdWx0ID0gcmVxdWlyZSgnY3JpdHRlcnMnKTtcblxuZXhwb3J0IGludGVyZmFjZSBJbmxpbmVDcml0aWNhbENzc1Byb2Nlc3NPcHRpb25zIHtcbiAgb3V0cHV0UGF0aDogc3RyaW5nO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIElubGluZUNyaXRpY2FsQ3NzUHJvY2Vzc29yT3B0aW9ucyB7XG4gIG1pbmlmeT86IGJvb2xlYW47XG4gIGRlcGxveVVybD86IHN0cmluZztcbiAgcmVhZEFzc2V0PzogKHBhdGg6IHN0cmluZykgPT4gUHJvbWlzZTxzdHJpbmc+O1xufVxuXG5jbGFzcyBDcml0dGVyc0V4dGVuZGVkIGV4dGVuZHMgQ3JpdHRlcnMge1xuICByZWFkb25seSB3YXJuaW5nczogc3RyaW5nW10gPSBbXTtcbiAgcmVhZG9ubHkgZXJyb3JzOiBzdHJpbmdbXSA9IFtdO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHByaXZhdGUgcmVhZG9ubHkgb3B0aW9uc0V4dGVuZGVkOiBJbmxpbmVDcml0aWNhbENzc1Byb2Nlc3Nvck9wdGlvbnMgJlxuICAgICAgSW5saW5lQ3JpdGljYWxDc3NQcm9jZXNzT3B0aW9ucyxcbiAgKSB7XG4gICAgc3VwZXIoe1xuICAgICAgbG9nZ2VyOiB7XG4gICAgICAgIHdhcm46IChzOiBzdHJpbmcpID0+IHRoaXMud2FybmluZ3MucHVzaChzKSxcbiAgICAgICAgZXJyb3I6IChzOiBzdHJpbmcpID0+IHRoaXMuZXJyb3JzLnB1c2gocyksXG4gICAgICAgIGluZm86ICgpID0+IHt9LFxuICAgICAgfSxcbiAgICAgIGxvZ0xldmVsOiAnd2FybicsXG4gICAgICBwYXRoOiBvcHRpb25zRXh0ZW5kZWQub3V0cHV0UGF0aCxcbiAgICAgIHB1YmxpY1BhdGg6IG9wdGlvbnNFeHRlbmRlZC5kZXBsb3lVcmwsXG4gICAgICBjb21wcmVzczogISFvcHRpb25zRXh0ZW5kZWQubWluaWZ5LFxuICAgICAgcHJ1bmVTb3VyY2U6IGZhbHNlLFxuICAgICAgcmVkdWNlSW5saW5lU3R5bGVzOiBmYWxzZSxcbiAgICAgIG1lcmdlU3R5bGVzaGVldHM6IGZhbHNlLFxuICAgICAgcHJlbG9hZDogJ21lZGlhJyxcbiAgICAgIG5vc2NyaXB0RmFsbGJhY2s6IHRydWUsXG4gICAgICBpbmxpbmVGb250czogdHJ1ZSxcbiAgICB9KTtcbiAgfVxuXG4gIHB1YmxpYyBvdmVycmlkZSByZWFkRmlsZShwYXRoOiBzdHJpbmcpOiBQcm9taXNlPHN0cmluZz4ge1xuICAgIGNvbnN0IHJlYWRBc3NldCA9IHRoaXMub3B0aW9uc0V4dGVuZGVkLnJlYWRBc3NldDtcblxuICAgIHJldHVybiByZWFkQXNzZXQgPyByZWFkQXNzZXQocGF0aCkgOiBmcy5wcm9taXNlcy5yZWFkRmlsZShwYXRoLCAndXRmLTgnKTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgSW5saW5lQ3JpdGljYWxDc3NQcm9jZXNzb3Ige1xuICBjb25zdHJ1Y3Rvcihwcm90ZWN0ZWQgcmVhZG9ubHkgb3B0aW9uczogSW5saW5lQ3JpdGljYWxDc3NQcm9jZXNzb3JPcHRpb25zKSB7fVxuXG4gIGFzeW5jIHByb2Nlc3MoXG4gICAgaHRtbDogc3RyaW5nLFxuICAgIG9wdGlvbnM6IElubGluZUNyaXRpY2FsQ3NzUHJvY2Vzc09wdGlvbnMsXG4gICk6IFByb21pc2U8eyBjb250ZW50OiBzdHJpbmc7IHdhcm5pbmdzOiBzdHJpbmdbXTsgZXJyb3JzOiBzdHJpbmdbXSB9PiB7XG4gICAgY29uc3QgY3JpdHRlcnMgPSBuZXcgQ3JpdHRlcnNFeHRlbmRlZCh7IC4uLnRoaXMub3B0aW9ucywgLi4ub3B0aW9ucyB9KTtcbiAgICBjb25zdCBjb250ZW50ID0gYXdhaXQgY3JpdHRlcnMucHJvY2VzcyhodG1sKTtcblxuICAgIHJldHVybiB7XG4gICAgICAvLyBDbGVhbiB1cCB2YWx1ZSBmcm9tIHZhbHVlIGxlc3MgYXR0cmlidXRlcy5cbiAgICAgIC8vIFRoaXMgaXMgY2F1c2VkIGJlY2F1c2UgcGFyc2U1IGFsd2F5cyByZXF1aXJlcyBhdHRyaWJ1dGVzIHRvIGhhdmUgYSBzdHJpbmcgdmFsdWUuXG4gICAgICAvLyBub21vZHVsZT1cIlwiIGRlZmVyPVwiXCIgLT4gbm9tb2R1bGUgZGVmZXIuXG4gICAgICBjb250ZW50OiBjb250ZW50LnJlcGxhY2UoLyhcXHMoPzpkZWZlcnxub21vZHVsZSkpPVwiXCIvZywgJyQxJyksXG4gICAgICBlcnJvcnM6IGNyaXR0ZXJzLmVycm9ycyxcbiAgICAgIHdhcm5pbmdzOiBjcml0dGVycy53YXJuaW5ncyxcbiAgICB9O1xuICB9XG59XG4iXX0=