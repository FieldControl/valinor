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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.copyAssets = void 0;
const fs = __importStar(require("fs"));
const glob_1 = __importDefault(require("glob"));
const path = __importStar(require("path"));
const util_1 = require("util");
const globPromise = (0, util_1.promisify)(glob_1.default);
async function copyAssets(entries, basePaths, root, changed) {
    const defaultIgnore = ['.gitkeep', '**/.DS_Store', '**/Thumbs.db'];
    for (const entry of entries) {
        const cwd = path.resolve(root, entry.input);
        const files = await globPromise(entry.glob, {
            cwd,
            dot: true,
            nodir: true,
            root: cwd,
            nomount: true,
            ignore: entry.ignore ? defaultIgnore.concat(entry.ignore) : defaultIgnore,
            follow: entry.followSymlinks,
        });
        const directoryExists = new Set();
        for (const file of files) {
            const src = path.join(cwd, file);
            if (changed && !changed.has(src)) {
                continue;
            }
            const filePath = entry.flatten ? path.basename(file) : file;
            for (const base of basePaths) {
                const dest = path.join(base, entry.output, filePath);
                const dir = path.dirname(dest);
                if (!directoryExists.has(dir)) {
                    if (!fs.existsSync(dir)) {
                        fs.mkdirSync(dir, { recursive: true });
                    }
                    directoryExists.add(dir);
                }
                fs.copyFileSync(src, dest, fs.constants.COPYFILE_FICLONE);
            }
        }
    }
}
exports.copyAssets = copyAssets;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29weS1hc3NldHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9hbmd1bGFyX2RldmtpdC9idWlsZF9hbmd1bGFyL3NyYy91dGlscy9jb3B5LWFzc2V0cy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUVILHVDQUF5QjtBQUN6QixnREFBd0I7QUFDeEIsMkNBQTZCO0FBQzdCLCtCQUFpQztBQUVqQyxNQUFNLFdBQVcsR0FBRyxJQUFBLGdCQUFTLEVBQUMsY0FBSSxDQUFDLENBQUM7QUFFN0IsS0FBSyxVQUFVLFVBQVUsQ0FDOUIsT0FPRyxFQUNILFNBQTJCLEVBQzNCLElBQVksRUFDWixPQUFxQjtJQUVyQixNQUFNLGFBQWEsR0FBRyxDQUFDLFVBQVUsRUFBRSxjQUFjLEVBQUUsY0FBYyxDQUFDLENBQUM7SUFFbkUsS0FBSyxNQUFNLEtBQUssSUFBSSxPQUFPLEVBQUU7UUFDM0IsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQzVDLE1BQU0sS0FBSyxHQUFHLE1BQU0sV0FBVyxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUU7WUFDMUMsR0FBRztZQUNILEdBQUcsRUFBRSxJQUFJO1lBQ1QsS0FBSyxFQUFFLElBQUk7WUFDWCxJQUFJLEVBQUUsR0FBRztZQUNULE9BQU8sRUFBRSxJQUFJO1lBQ2IsTUFBTSxFQUFFLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxhQUFhO1lBQ3pFLE1BQU0sRUFBRSxLQUFLLENBQUMsY0FBYztTQUM3QixDQUFDLENBQUM7UUFFSCxNQUFNLGVBQWUsR0FBRyxJQUFJLEdBQUcsRUFBVSxDQUFDO1FBRTFDLEtBQUssTUFBTSxJQUFJLElBQUksS0FBSyxFQUFFO1lBQ3hCLE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxDQUFDO1lBQ2pDLElBQUksT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRTtnQkFDaEMsU0FBUzthQUNWO1lBRUQsTUFBTSxRQUFRLEdBQUcsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO1lBQzVELEtBQUssTUFBTSxJQUFJLElBQUksU0FBUyxFQUFFO2dCQUM1QixNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsTUFBTSxFQUFFLFFBQVEsQ0FBQyxDQUFDO2dCQUNyRCxNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUMvQixJQUFJLENBQUMsZUFBZSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRTtvQkFDN0IsSUFBSSxDQUFDLEVBQUUsQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLEVBQUU7d0JBQ3ZCLEVBQUUsQ0FBQyxTQUFTLENBQUMsR0FBRyxFQUFFLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7cUJBQ3hDO29CQUNELGVBQWUsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7aUJBQzFCO2dCQUNELEVBQUUsQ0FBQyxZQUFZLENBQUMsR0FBRyxFQUFFLElBQUksRUFBRSxFQUFFLENBQUMsU0FBUyxDQUFDLGdCQUFnQixDQUFDLENBQUM7YUFDM0Q7U0FDRjtLQUNGO0FBQ0gsQ0FBQztBQWpERCxnQ0FpREMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0ICogYXMgZnMgZnJvbSAnZnMnO1xuaW1wb3J0IGdsb2IgZnJvbSAnZ2xvYic7XG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IHsgcHJvbWlzaWZ5IH0gZnJvbSAndXRpbCc7XG5cbmNvbnN0IGdsb2JQcm9taXNlID0gcHJvbWlzaWZ5KGdsb2IpO1xuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gY29weUFzc2V0cyhcbiAgZW50cmllczoge1xuICAgIGdsb2I6IHN0cmluZztcbiAgICBpZ25vcmU/OiBzdHJpbmdbXTtcbiAgICBpbnB1dDogc3RyaW5nO1xuICAgIG91dHB1dDogc3RyaW5nO1xuICAgIGZsYXR0ZW4/OiBib29sZWFuO1xuICAgIGZvbGxvd1N5bWxpbmtzPzogYm9vbGVhbjtcbiAgfVtdLFxuICBiYXNlUGF0aHM6IEl0ZXJhYmxlPHN0cmluZz4sXG4gIHJvb3Q6IHN0cmluZyxcbiAgY2hhbmdlZD86IFNldDxzdHJpbmc+LFxuKSB7XG4gIGNvbnN0IGRlZmF1bHRJZ25vcmUgPSBbJy5naXRrZWVwJywgJyoqLy5EU19TdG9yZScsICcqKi9UaHVtYnMuZGInXTtcblxuICBmb3IgKGNvbnN0IGVudHJ5IG9mIGVudHJpZXMpIHtcbiAgICBjb25zdCBjd2QgPSBwYXRoLnJlc29sdmUocm9vdCwgZW50cnkuaW5wdXQpO1xuICAgIGNvbnN0IGZpbGVzID0gYXdhaXQgZ2xvYlByb21pc2UoZW50cnkuZ2xvYiwge1xuICAgICAgY3dkLFxuICAgICAgZG90OiB0cnVlLFxuICAgICAgbm9kaXI6IHRydWUsXG4gICAgICByb290OiBjd2QsXG4gICAgICBub21vdW50OiB0cnVlLFxuICAgICAgaWdub3JlOiBlbnRyeS5pZ25vcmUgPyBkZWZhdWx0SWdub3JlLmNvbmNhdChlbnRyeS5pZ25vcmUpIDogZGVmYXVsdElnbm9yZSxcbiAgICAgIGZvbGxvdzogZW50cnkuZm9sbG93U3ltbGlua3MsXG4gICAgfSk7XG5cbiAgICBjb25zdCBkaXJlY3RvcnlFeGlzdHMgPSBuZXcgU2V0PHN0cmluZz4oKTtcblxuICAgIGZvciAoY29uc3QgZmlsZSBvZiBmaWxlcykge1xuICAgICAgY29uc3Qgc3JjID0gcGF0aC5qb2luKGN3ZCwgZmlsZSk7XG4gICAgICBpZiAoY2hhbmdlZCAmJiAhY2hhbmdlZC5oYXMoc3JjKSkge1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgY29uc3QgZmlsZVBhdGggPSBlbnRyeS5mbGF0dGVuID8gcGF0aC5iYXNlbmFtZShmaWxlKSA6IGZpbGU7XG4gICAgICBmb3IgKGNvbnN0IGJhc2Ugb2YgYmFzZVBhdGhzKSB7XG4gICAgICAgIGNvbnN0IGRlc3QgPSBwYXRoLmpvaW4oYmFzZSwgZW50cnkub3V0cHV0LCBmaWxlUGF0aCk7XG4gICAgICAgIGNvbnN0IGRpciA9IHBhdGguZGlybmFtZShkZXN0KTtcbiAgICAgICAgaWYgKCFkaXJlY3RvcnlFeGlzdHMuaGFzKGRpcikpIHtcbiAgICAgICAgICBpZiAoIWZzLmV4aXN0c1N5bmMoZGlyKSkge1xuICAgICAgICAgICAgZnMubWtkaXJTeW5jKGRpciwgeyByZWN1cnNpdmU6IHRydWUgfSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGRpcmVjdG9yeUV4aXN0cy5hZGQoZGlyKTtcbiAgICAgICAgfVxuICAgICAgICBmcy5jb3B5RmlsZVN5bmMoc3JjLCBkZXN0LCBmcy5jb25zdGFudHMuQ09QWUZJTEVfRklDTE9ORSk7XG4gICAgICB9XG4gICAgfVxuICB9XG59XG4iXX0=