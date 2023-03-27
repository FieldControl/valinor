"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupJitPluginCallbacks = void 0;
const promises_1 = require("node:fs/promises");
const node_path_1 = __importDefault(require("node:path"));
const stylesheets_1 = require("../stylesheets");
const uri_1 = require("./uri");
/**
 * Loads/extracts the contents from a load callback Angular JIT entry.
 * An Angular JIT entry represents either a file path for a component resource or base64
 * encoded data for an inline component resource.
 * @param entry The value that represents content to load.
 * @param root The absolute path for the root of the build (typically the workspace root).
 * @param skipRead If true, do not attempt to read the file; if false, read file content from disk.
 * This option has no effect if the entry does not originate from a file. Defaults to false.
 * @returns An object containing the absolute path of the contents and optionally the actual contents.
 * For inline entries the contents will always be provided.
 */
async function loadEntry(entry, root, skipRead) {
    if (entry.startsWith('file:')) {
        const specifier = node_path_1.default.join(root, entry.slice(5));
        return {
            path: specifier,
            contents: skipRead ? undefined : await (0, promises_1.readFile)(specifier, 'utf-8'),
        };
    }
    else if (entry.startsWith('inline:')) {
        const [importer, data] = entry.slice(7).split(';', 2);
        return {
            path: node_path_1.default.join(root, importer),
            contents: Buffer.from(data, 'base64').toString(),
        };
    }
    else {
        throw new Error('Invalid data for Angular JIT entry.');
    }
}
/**
 * Sets up esbuild resolve and load callbacks to support Angular JIT mode processing
 * for both Component stylesheets and templates. These callbacks work alongside the JIT
 * resource TypeScript transformer to convert and then bundle Component resources as
 * static imports.
 * @param build An esbuild {@link PluginBuild} instance used to add callbacks.
 * @param styleOptions The options to use when bundling stylesheets.
 * @param stylesheetResourceFiles An array where stylesheet resources will be added.
 */
function setupJitPluginCallbacks(build, styleOptions, stylesheetResourceFiles) {
    var _a;
    const root = (_a = build.initialOptions.absWorkingDir) !== null && _a !== void 0 ? _a : '';
    // Add a resolve callback to capture and parse any JIT URIs that were added by the
    // JIT resource TypeScript transformer.
    // Resources originating from a file are resolved as relative from the containing file (importer).
    build.onResolve({ filter: uri_1.JIT_NAMESPACE_REGEXP }, (args) => {
        const parsed = (0, uri_1.parseJitUri)(args.path);
        if (!parsed) {
            return undefined;
        }
        const { namespace, origin, specifier } = parsed;
        if (origin === 'file') {
            return {
                // Use a relative path to prevent fully resolved paths in the metafile (JSON stats file).
                // This is only necessary for custom namespaces. esbuild will handle the file namespace.
                path: 'file:' + node_path_1.default.relative(root, node_path_1.default.join(node_path_1.default.dirname(args.importer), specifier)),
                namespace,
            };
        }
        else {
            // Inline data may need the importer to resolve imports/references within the content
            const importer = node_path_1.default.relative(root, args.importer);
            return {
                path: `inline:${importer};${specifier}`,
                namespace,
            };
        }
    });
    // Add a load callback to handle Component stylesheets (both inline and external)
    build.onLoad({ filter: /./, namespace: uri_1.JIT_STYLE_NAMESPACE }, async (args) => {
        var _a;
        // skipRead is used here because the stylesheet bundling will read a file stylesheet
        // directly either via a preprocessor or esbuild itself.
        const entry = await loadEntry(args.path, root, true /* skipRead */);
        const { contents, resourceFiles, errors, warnings } = await (0, stylesheets_1.bundleComponentStylesheet)(styleOptions.inlineStyleLanguage, 
        // The `data` parameter is only needed for a stylesheet if it was inline
        (_a = entry.contents) !== null && _a !== void 0 ? _a : '', entry.path, entry.contents !== undefined, styleOptions);
        stylesheetResourceFiles.push(...resourceFiles);
        return {
            errors,
            warnings,
            contents,
            loader: 'text',
        };
    });
    // Add a load callback to handle Component templates
    // NOTE: While this callback supports both inline and external templates, the transformer
    // currently only supports generating URIs for external templates.
    build.onLoad({ filter: /./, namespace: uri_1.JIT_TEMPLATE_NAMESPACE }, async (args) => {
        const { contents } = await loadEntry(args.path, root);
        return {
            contents,
            loader: 'text',
        };
    });
}
exports.setupJitPluginCallbacks = setupJitPluginCallbacks;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaml0LXBsdWdpbi1jYWxsYmFja3MuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9hbmd1bGFyX2RldmtpdC9idWlsZF9hbmd1bGFyL3NyYy9idWlsZGVycy9icm93c2VyLWVzYnVpbGQvYW5ndWxhci9qaXQtcGx1Z2luLWNhbGxiYWNrcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7OztHQU1HOzs7Ozs7QUFHSCwrQ0FBNEM7QUFDNUMsMERBQTZCO0FBQzdCLGdEQUFvRjtBQUNwRiwrQkFLZTtBQUVmOzs7Ozs7Ozs7O0dBVUc7QUFDSCxLQUFLLFVBQVUsU0FBUyxDQUN0QixLQUFhLEVBQ2IsSUFBWSxFQUNaLFFBQWtCO0lBRWxCLElBQUksS0FBSyxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsRUFBRTtRQUM3QixNQUFNLFNBQVMsR0FBRyxtQkFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBRWxELE9BQU87WUFDTCxJQUFJLEVBQUUsU0FBUztZQUNmLFFBQVEsRUFBRSxRQUFRLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsTUFBTSxJQUFBLG1CQUFRLEVBQUMsU0FBUyxFQUFFLE9BQU8sQ0FBQztTQUNwRSxDQUFDO0tBQ0g7U0FBTSxJQUFJLEtBQUssQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLEVBQUU7UUFDdEMsTUFBTSxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFFdEQsT0FBTztZQUNMLElBQUksRUFBRSxtQkFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsUUFBUSxDQUFDO1lBQy9CLFFBQVEsRUFBRSxNQUFNLENBQUMs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UUFFdEQsT0FBTztZQUNMLFFBQVE7WUFDUixNQUFNLEVBQUUsTUFBTTtTQUNmLENBQUM7SUFDSixDQUFDLENBQUMsQ0FBQztBQUNMLENBQUM7QUF4RUQsMERBd0VDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB0eXBlIHsgT3V0cHV0RmlsZSwgUGx1Z2luQnVpbGQgfSBmcm9tICdlc2J1aWxkJztcbmltcG9ydCB7IHJlYWRGaWxlIH0gZnJvbSAnbm9kZTpmcy9wcm9taXNlcyc7XG5pbXBvcnQgcGF0aCBmcm9tICdub2RlOnBhdGgnO1xuaW1wb3J0IHsgQnVuZGxlU3R5bGVzaGVldE9wdGlvbnMsIGJ1bmRsZUNvbXBvbmVudFN0eWxlc2hlZXQgfSBmcm9tICcuLi9zdHlsZXNoZWV0cyc7XG5pbXBvcnQge1xuICBKSVRfTkFNRVNQQUNFX1JFR0VYUCxcbiAgSklUX1NUWUxFX05BTUVTUEFDRSxcbiAgSklUX1RFTVBMQVRFX05BTUVTUEFDRSxcbiAgcGFyc2VKaXRVcmksXG59IGZyb20gJy4vdXJpJztcblxuLyoqXG4gKiBMb2Fkcy9leHRyYWN0cyB0aGUgY29udGVudHMgZnJvbSBhIGxvYWQgY2FsbGJhY2sgQW5ndWxhciBKSVQgZW50cnkuXG4gKiBBbiBBbmd1bGFyIEpJVCBlbnRyeSByZXByZXNlbnRzIGVpdGhlciBhIGZpbGUgcGF0aCBmb3IgYSBjb21wb25lbnQgcmVzb3VyY2Ugb3IgYmFzZTY0XG4gKiBlbmNvZGVkIGRhdGEgZm9yIGFuIGlubGluZSBjb21wb25lbnQgcmVzb3VyY2UuXG4gKiBAcGFyYW0gZW50cnkgVGhlIHZhbHVlIHRoYXQgcmVwcmVzZW50cyBjb250ZW50IHRvIGxvYWQuXG4gKiBAcGFyYW0gcm9vdCBUaGUgYWJzb2x1dGUgcGF0aCBmb3IgdGhlIHJvb3Qgb2YgdGhlIGJ1aWxkICh0eXBpY2FsbHkgdGhlIHdvcmtzcGFjZSByb290KS5cbiAqIEBwYXJhbSBza2lwUmVhZCBJZiB0cnVlLCBkbyBub3QgYXR0ZW1wdCB0byByZWFkIHRoZSBmaWxlOyBpZiBmYWxzZSwgcmVhZCBmaWxlIGNvbnRlbnQgZnJvbSBkaXNrLlxuICogVGhpcyBvcHRpb24gaGFzIG5vIGVmZmVjdCBpZiB0aGUgZW50cnkgZG9lcyBub3Qgb3JpZ2luYXRlIGZyb20gYSBmaWxlLiBEZWZhdWx0cyB0byBmYWxzZS5cbiAqIEByZXR1cm5zIEFuIG9iamVjdCBjb250YWluaW5nIHRoZSBhYnNvbHV0ZSBwYXRoIG9mIHRoZSBjb250ZW50cyBhbmQgb3B0aW9uYWxseSB0aGUgYWN0dWFsIGNvbnRlbnRzLlxuICogRm9yIGlubGluZSBlbnRyaWVzIHRoZSBjb250ZW50cyB3aWxsIGFsd2F5cyBiZSBwcm92aWRlZC5cbiAqL1xuYXN5bmMgZnVuY3Rpb24gbG9hZEVudHJ5KFxuICBlbnRyeTogc3RyaW5nLFxuICByb290OiBzdHJpbmcsXG4gIHNraXBSZWFkPzogYm9vbGVhbixcbik6IFByb21pc2U8eyBwYXRoOiBzdHJpbmc7IGNvbnRlbnRzPzogc3RyaW5nIH0+IHtcbiAgaWYgKGVudHJ5LnN0YXJ0c1dpdGgoJ2ZpbGU6JykpIHtcbiAgICBjb25zdCBzcGVjaWZpZXIgPSBwYXRoLmpvaW4ocm9vdCwgZW50cnkuc2xpY2UoNSkpO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIHBhdGg6IHNwZWNpZmllcixcbiAgICAgIGNvbnRlbnRzOiBza2lwUmVhZCA/IHVuZGVmaW5lZCA6IGF3YWl0IHJlYWRGaWxlKHNwZWNpZmllciwgJ3V0Zi04JyksXG4gICAgfTtcbiAgfSBlbHNlIGlmIChlbnRyeS5zdGFydHNXaXRoKCdpbmxpbmU6JykpIHtcbiAgICBjb25zdCBbaW1wb3J0ZXIsIGRhdGFdID0gZW50cnkuc2xpY2UoNykuc3BsaXQoJzsnLCAyKTtcblxuICAgIHJldHVybiB7XG4gICAgICBwYXRoOiBwYXRoLmpvaW4ocm9vdCwgaW1wb3J0ZXIpLFxuICAgICAgY29udGVudHM6IEJ1ZmZlci5mcm9tKGRhdGEsICdiYXNlNjQnKS50b1N0cmluZygpLFxuICAgIH07XG4gIH0gZWxzZSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIGRhdGEgZm9yIEFuZ3VsYXIgSklUIGVudHJ5LicpO1xuICB9XG59XG5cbi8qKlxuICogU2V0cyB1cCBlc2J1aWxkIHJlc29sdmUgYW5kIGxvYWQgY2FsbGJhY2tzIHRvIHN1cHBvcnQgQW5ndWxhciBKSVQgbW9kZSBwcm9jZXNzaW5nXG4gKiBmb3IgYm90aCBDb21wb25lbnQgc3R5bGVzaGVldHMgYW5kIHRlbXBsYXRlcy4gVGhlc2UgY2FsbGJhY2tzIHdvcmsgYWxvbmdzaWRlIHRoZSBKSVRcbiAqIHJlc291cmNlIFR5cGVTY3JpcHQgdHJhbnNmb3JtZXIgdG8gY29udmVydCBhbmQgdGhlbiBidW5kbGUgQ29tcG9uZW50IHJlc291cmNlcyBhc1xuICogc3RhdGljIGltcG9ydHMuXG4gKiBAcGFyYW0gYnVpbGQgQW4gZXNidWlsZCB7QGxpbmsgUGx1Z2luQnVpbGR9IGluc3RhbmNlIHVzZWQgdG8gYWRkIGNhbGxiYWNrcy5cbiAqIEBwYXJhbSBzdHlsZU9wdGlvbnMgVGhlIG9wdGlvbnMgdG8gdXNlIHdoZW4gYnVuZGxpbmcgc3R5bGVzaGVldHMuXG4gKiBAcGFyYW0gc3R5bGVzaGVldFJlc291cmNlRmlsZXMgQW4gYXJyYXkgd2hlcmUgc3R5bGVzaGVldCByZXNvdXJjZXMgd2lsbCBiZSBhZGRlZC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNldHVwSml0UGx1Z2luQ2FsbGJhY2tzKFxuICBidWlsZDogUGx1Z2luQnVpbGQsXG4gIHN0eWxlT3B0aW9uczogQnVuZGxlU3R5bGVzaGVldE9wdGlvbnMgJiB7IGlubGluZVN0eWxlTGFuZ3VhZ2U6IHN0cmluZyB9LFxuICBzdHlsZXNoZWV0UmVzb3VyY2VGaWxlczogT3V0cHV0RmlsZVtdLFxuKTogdm9pZCB7XG4gIGNvbnN0IHJvb3QgPSBidWlsZC5pbml0aWFsT3B0aW9ucy5hYnNXb3JraW5nRGlyID8/ICcnO1xuXG4gIC8vIEFkZCBhIHJlc29sdmUgY2FsbGJhY2sgdG8gY2FwdHVyZSBhbmQgcGFyc2UgYW55IEpJVCBVUklzIHRoYXQgd2VyZSBhZGRlZCBieSB0aGVcbiAgLy8gSklUIHJlc291cmNlIFR5cGVTY3JpcHQgdHJhbnNmb3JtZXIuXG4gIC8vIFJlc291cmNlcyBvcmlnaW5hdGluZyBmcm9tIGEgZmlsZSBhcmUgcmVzb2x2ZWQgYXMgcmVsYXRpdmUgZnJvbSB0aGUgY29udGFpbmluZyBmaWxlIChpbXBvcnRlcikuXG4gIGJ1aWxkLm9uUmVzb2x2ZSh7IGZpbHRlcjogSklUX05BTUVTUEFDRV9SRUdFWFAgfSwgKGFyZ3MpID0+IHtcbiAgICBjb25zdCBwYXJzZWQgPSBwYXJzZUppdFVyaShhcmdzLnBhdGgpO1xuICAgIGlmICghcGFyc2VkKSB7XG4gICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cblxuICAgIGNvbnN0IHsgbmFtZXNwYWNlLCBvcmlnaW4sIHNwZWNpZmllciB9ID0gcGFyc2VkO1xuXG4gICAgaWYgKG9yaWdpbiA9PT0gJ2ZpbGUnKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICAvLyBVc2UgYSByZWxhdGl2ZSBwYXRoIHRvIHByZXZlbnQgZnVsbHkgcmVzb2x2ZWQgcGF0aHMgaW4gdGhlIG1ldGFmaWxlIChKU09OIHN0YXRzIGZpbGUpLlxuICAgICAgICAvLyBUaGlzIGlzIG9ubHkgbmVjZXNzYXJ5IGZvciBjdXN0b20gbmFtZXNwYWNlcy4gZXNidWlsZCB3aWxsIGhhbmRsZSB0aGUgZmlsZSBuYW1lc3BhY2UuXG4gICAgICAgIHBhdGg6ICdmaWxlOicgKyBwYXRoLnJlbGF0aXZlKHJvb3QsIHBhdGguam9pbihwYXRoLmRpcm5hbWUoYXJncy5pbXBvcnRlciksIHNwZWNpZmllcikpLFxuICAgICAgICBuYW1lc3BhY2UsXG4gICAgICB9O1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBJbmxpbmUgZGF0YSBtYXkgbmVlZCB0aGUgaW1wb3J0ZXIgdG8gcmVzb2x2ZSBpbXBvcnRzL3JlZmVyZW5jZXMgd2l0aGluIHRoZSBjb250ZW50XG4gICAgICBjb25zdCBpbXBvcnRlciA9IHBhdGgucmVsYXRpdmUocm9vdCwgYXJncy5pbXBvcnRlcik7XG5cbiAgICAgIHJldHVybiB7XG4gICAgICAgIHBhdGg6IGBpbmxpbmU6JHtpbXBvcnRlcn07JHtzcGVjaWZpZXJ9YCxcbiAgICAgICAgbmFtZXNwYWNlLFxuICAgICAgfTtcbiAgICB9XG4gIH0pO1xuXG4gIC8vIEFkZCBhIGxvYWQgY2FsbGJhY2sgdG8gaGFuZGxlIENvbXBvbmVudCBzdHlsZXNoZWV0cyAoYm90aCBpbmxpbmUgYW5kIGV4dGVybmFsKVxuICBidWlsZC5vbkxvYWQoeyBmaWx0ZXI6IC8uLywgbmFtZXNwYWNlOiBKSVRfU1RZTEVfTkFNRVNQQUNFIH0sIGFzeW5jIChhcmdzKSA9PiB7XG4gICAgLy8gc2tpcFJlYWQgaXMgdXNlZCBoZXJlIGJlY2F1c2UgdGhlIHN0eWxlc2hlZXQgYnVuZGxpbmcgd2lsbCByZWFkIGEgZmlsZSBzdHlsZXNoZWV0XG4gICAgLy8gZGlyZWN0bHkgZWl0aGVyIHZpYSBhIHByZXByb2Nlc3NvciBvciBlc2J1aWxkIGl0c2VsZi5cbiAgICBjb25zdCBlbnRyeSA9IGF3YWl0IGxvYWRFbnRyeShhcmdzLnBhdGgsIHJvb3QsIHRydWUgLyogc2tpcFJlYWQgKi8pO1xuXG4gICAgY29uc3QgeyBjb250ZW50cywgcmVzb3VyY2VGaWxlcywgZXJyb3JzLCB3YXJuaW5ncyB9ID0gYXdhaXQgYnVuZGxlQ29tcG9uZW50U3R5bGVzaGVldChcbiAgICAgIHN0eWxlT3B0aW9ucy5pbmxpbmVTdHlsZUxhbmd1YWdlLFxuICAgICAgLy8gVGhlIGBkYXRhYCBwYXJhbWV0ZXIgaXMgb25seSBuZWVkZWQgZm9yIGEgc3R5bGVzaGVldCBpZiBpdCB3YXMgaW5saW5lXG4gICAgICBlbnRyeS5jb250ZW50cyA/PyAnJyxcbiAgICAgIGVudHJ5LnBhdGgsXG4gICAgICBlbnRyeS5jb250ZW50cyAhPT0gdW5kZWZpbmVkLFxuICAgICAgc3R5bGVPcHRpb25zLFxuICAgICk7XG5cbiAgICBzdHlsZXNoZWV0UmVzb3VyY2VGaWxlcy5wdXNoKC4uLnJlc291cmNlRmlsZXMpO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIGVycm9ycyxcbiAgICAgIHdhcm5pbmdzLFxuICAgICAgY29udGVudHMsXG4gICAgICBsb2FkZXI6ICd0ZXh0JyxcbiAgICB9O1xuICB9KTtcblxuICAvLyBBZGQgYSBsb2FkIGNhbGxiYWNrIHRvIGhhbmRsZSBDb21wb25lbnQgdGVtcGxhdGVzXG4gIC8vIE5PVEU6IFdoaWxlIHRoaXMgY2FsbGJhY2sgc3VwcG9ydHMgYm90aCBpbmxpbmUgYW5kIGV4dGVybmFsIHRlbXBsYXRlcywgdGhlIHRyYW5zZm9ybWVyXG4gIC8vIGN1cnJlbnRseSBvbmx5IHN1cHBvcnRzIGdlbmVyYXRpbmcgVVJJcyBmb3IgZXh0ZXJuYWwgdGVtcGxhdGVzLlxuICBidWlsZC5vbkxvYWQoeyBmaWx0ZXI6IC8uLywgbmFtZXNwYWNlOiBKSVRfVEVNUExBVEVfTkFNRVNQQUNFIH0sIGFzeW5jIChhcmdzKSA9PiB7XG4gICAgY29uc3QgeyBjb250ZW50cyB9ID0gYXdhaXQgbG9hZEVudHJ5KGFyZ3MucGF0aCwgcm9vdCk7XG5cbiAgICByZXR1cm4ge1xuICAgICAgY29udGVudHMsXG4gICAgICBsb2FkZXI6ICd0ZXh0JyxcbiAgICB9O1xuICB9KTtcbn1cbiJdfQ==