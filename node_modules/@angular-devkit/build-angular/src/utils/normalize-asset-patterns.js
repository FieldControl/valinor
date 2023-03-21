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
exports.normalizeAssetPatterns = exports.MissingAssetSourceRootException = void 0;
const core_1 = require("@angular-devkit/core");
const fs_1 = require("fs");
const path = __importStar(require("path"));
class MissingAssetSourceRootException extends core_1.BaseException {
    constructor(path) {
        super(`The ${path} asset path must start with the project source root.`);
    }
}
exports.MissingAssetSourceRootException = MissingAssetSourceRootException;
function normalizeAssetPatterns(assetPatterns, workspaceRoot, projectRoot, projectSourceRoot) {
    if (assetPatterns.length === 0) {
        return [];
    }
    // When sourceRoot is not available, we default to ${projectRoot}/src.
    const sourceRoot = projectSourceRoot || path.join(projectRoot, 'src');
    const resolvedSourceRoot = path.resolve(workspaceRoot, sourceRoot);
    return assetPatterns.map((assetPattern) => {
        // Normalize string asset patterns to objects.
        if (typeof assetPattern === 'string') {
            const assetPath = path.normalize(assetPattern);
            const resolvedAssetPath = path.resolve(workspaceRoot, assetPath);
            // Check if the string asset is within sourceRoot.
            if (!resolvedAssetPath.startsWith(resolvedSourceRoot)) {
                throw new MissingAssetSourceRootException(assetPattern);
            }
            let glob, input;
            let isDirectory = false;
            try {
                isDirectory = (0, fs_1.statSync)(resolvedAssetPath).isDirectory();
            }
            catch (_a) {
                isDirectory = true;
            }
            if (isDirectory) {
                // Folders get a recursive star glob.
                glob = '**/*';
                // Input directory is their original path.
                input = assetPath;
            }
            else {
                // Files are their own glob.
                glob = path.basename(assetPath);
                // Input directory is their original dirname.
                input = path.dirname(assetPath);
            }
            // Output directory for both is the relative path from source root to input.
            const output = path.relative(resolvedSourceRoot, path.resolve(workspaceRoot, input));
            assetPattern = { glob, input, output };
        }
        if (assetPattern.output.startsWith('..')) {
            throw new Error('An asset cannot be written to a location outside of the output path.');
        }
        return assetPattern;
    });
}
exports.normalizeAssetPatterns = normalizeAssetPatterns;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm9ybWFsaXplLWFzc2V0LXBhdHRlcm5zLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvYW5ndWxhcl9kZXZraXQvYnVpbGRfYW5ndWxhci9zcmMvdXRpbHMvbm9ybWFsaXplLWFzc2V0LXBhdHRlcm5zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBRUgsK0NBQXFEO0FBQ3JELDJCQUE4QjtBQUM5QiwyQ0FBNkI7QUFHN0IsTUFBYSwrQkFBZ0MsU0FBUSxvQkFBYTtJQUNoRSxZQUFZLElBQVk7UUFDdEIsS0FBSyxDQUFDLE9BQU8sSUFBSSxzREFBc0QsQ0FBQyxDQUFDO0lBQzNFLENBQUM7Q0FDRjtBQUpELDBFQUlDO0FBRUQsU0FBZ0Isc0JBQXNCLENBQ3BDLGFBQTZCLEVBQzdCLGFBQXFCLEVBQ3JCLFdBQW1CLEVBQ25CLGlCQUFxQztJQUVyQyxJQUFJLGFBQWEsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO1FBQzlCLE9BQU8sRUFBRSxDQUFDO0tBQ1g7SUFFRCxzRUFBc0U7SUFDdEUsTUFBTSxVQUFVLEdBQUcsaUJBQWlCLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsS0FBSyxDQUFDLENBQUM7SUFDdEUsTUFBTSxrQkFBa0IsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLGFBQWEsRUFBRSxVQUFVLENBQUMsQ0FBQztJQUVuRSxPQUFPLGFBQWEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxZQUFZLEVBQUUsRUFBRTtRQUN4Qyw4Q0FBOEM7UUFDOUMsSUFBSSxPQUFPLFlBQVksS0FBSyxRQUFRLEVBQUU7WUFDcEMsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxZQUFZLENBQUMsQ0FBQztZQUMvQyxNQUFNLGlCQUFpQixHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsYUFBYSxFQUFFLFNBQVMsQ0FBQyxDQUFDO1lBRWpFLGtEQUFrRDtZQUNsRCxJQUFJLENBQUMsaUJBQWlCLENBQUMsVUFBVSxDQUFDLGtCQUFrQixDQUFDLEVBQUU7Z0JBQ3JELE1BQU0sSUFBSSwrQkFBK0IsQ0FBQyxZQUFZLENBQUMsQ0FBQzthQUN6RDtZQUVELElBQUksSUFBWSxFQUFFLEtBQWEsQ0FBQztZQUNoQyxJQUFJLFdBQVcsR0FBRyxLQUFLLENBQUM7WUFFeEIsSUFBSTtnQkFDRixXQUFXLEdBQUcsSUFBQSxhQUFRLEVBQUMsaUJBQWlCLENBQUMsQ0FBQyxXQUFXLEVBQUUsQ0FBQzthQUN6RDtZQUFDLFdBQU07Z0JBQ04sV0FBVyxHQUFHLElBQUksQ0FBQzthQUNwQjtZQUVELElBQUksV0FBVyxFQUFFO2dCQUNmLHFDQUFxQztnQkFDckMsSUFBSSxHQUFHLE1BQU0sQ0FBQztnQkFDZCwwQ0FBMEM7Z0JBQzFDLEtBQUssR0FBRyxTQUFTLENBQUM7YUFDbkI7aUJBQU07Z0JBQ0wsNEJBQTRCO2dCQUM1QixJQUFJLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsQ0FBQztnQkFDaEMsNkNBQTZDO2dCQUM3QyxLQUFLLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQzthQUNqQztZQUVELDRFQUE0RTtZQUM1RSxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLGtCQUFrQixFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsYUFBYSxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7WUFFckYsWUFBWSxHQUFHLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsQ0FBQztTQUN4QztRQUVELElBQUksWUFBWSxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLEVBQUU7WUFDeEMsTUFBTSxJQUFJLEtBQUssQ0FBQyxzRUFBc0UsQ0FBQyxDQUFDO1NBQ3pGO1FBRUQsT0FBTyxZQUFZLENBQUM7SUFDdEIsQ0FBQyxDQUFDLENBQUM7QUFDTCxDQUFDO0FBMURELHdEQTBEQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQgeyBCYXNlRXhjZXB0aW9uIH0gZnJvbSAnQGFuZ3VsYXItZGV2a2l0L2NvcmUnO1xuaW1wb3J0IHsgc3RhdFN5bmMgfSBmcm9tICdmcyc7XG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IHsgQXNzZXRQYXR0ZXJuLCBBc3NldFBhdHRlcm5DbGFzcyB9IGZyb20gJy4uL2J1aWxkZXJzL2Jyb3dzZXIvc2NoZW1hJztcblxuZXhwb3J0IGNsYXNzIE1pc3NpbmdBc3NldFNvdXJjZVJvb3RFeGNlcHRpb24gZXh0ZW5kcyBCYXNlRXhjZXB0aW9uIHtcbiAgY29uc3RydWN0b3IocGF0aDogU3RyaW5nKSB7XG4gICAgc3VwZXIoYFRoZSAke3BhdGh9IGFzc2V0IHBhdGggbXVzdCBzdGFydCB3aXRoIHRoZSBwcm9qZWN0IHNvdXJjZSByb290LmApO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBub3JtYWxpemVBc3NldFBhdHRlcm5zKFxuICBhc3NldFBhdHRlcm5zOiBBc3NldFBhdHRlcm5bXSxcbiAgd29ya3NwYWNlUm9vdDogc3RyaW5nLFxuICBwcm9qZWN0Um9vdDogc3RyaW5nLFxuICBwcm9qZWN0U291cmNlUm9vdDogc3RyaW5nIHwgdW5kZWZpbmVkLFxuKTogQXNzZXRQYXR0ZXJuQ2xhc3NbXSB7XG4gIGlmIChhc3NldFBhdHRlcm5zLmxlbmd0aCA9PT0gMCkge1xuICAgIHJldHVybiBbXTtcbiAgfVxuXG4gIC8vIFdoZW4gc291cmNlUm9vdCBpcyBub3QgYXZhaWxhYmxlLCB3ZSBkZWZhdWx0IHRvICR7cHJvamVjdFJvb3R9L3NyYy5cbiAgY29uc3Qgc291cmNlUm9vdCA9IHByb2plY3RTb3VyY2VSb290IHx8IHBhdGguam9pbihwcm9qZWN0Um9vdCwgJ3NyYycpO1xuICBjb25zdCByZXNvbHZlZFNvdXJjZVJvb3QgPSBwYXRoLnJlc29sdmUod29ya3NwYWNlUm9vdCwgc291cmNlUm9vdCk7XG5cbiAgcmV0dXJuIGFzc2V0UGF0dGVybnMubWFwKChhc3NldFBhdHRlcm4pID0+IHtcbiAgICAvLyBOb3JtYWxpemUgc3RyaW5nIGFzc2V0IHBhdHRlcm5zIHRvIG9iamVjdHMuXG4gICAgaWYgKHR5cGVvZiBhc3NldFBhdHRlcm4gPT09ICdzdHJpbmcnKSB7XG4gICAgICBjb25zdCBhc3NldFBhdGggPSBwYXRoLm5vcm1hbGl6ZShhc3NldFBhdHRlcm4pO1xuICAgICAgY29uc3QgcmVzb2x2ZWRBc3NldFBhdGggPSBwYXRoLnJlc29sdmUod29ya3NwYWNlUm9vdCwgYXNzZXRQYXRoKTtcblxuICAgICAgLy8gQ2hlY2sgaWYgdGhlIHN0cmluZyBhc3NldCBpcyB3aXRoaW4gc291cmNlUm9vdC5cbiAgICAgIGlmICghcmVzb2x2ZWRBc3NldFBhdGguc3RhcnRzV2l0aChyZXNvbHZlZFNvdXJjZVJvb3QpKSB7XG4gICAgICAgIHRocm93IG5ldyBNaXNzaW5nQXNzZXRTb3VyY2VSb290RXhjZXB0aW9uKGFzc2V0UGF0dGVybik7XG4gICAgICB9XG5cbiAgICAgIGxldCBnbG9iOiBzdHJpbmcsIGlucHV0OiBzdHJpbmc7XG4gICAgICBsZXQgaXNEaXJlY3RvcnkgPSBmYWxzZTtcblxuICAgICAgdHJ5IHtcbiAgICAgICAgaXNEaXJlY3RvcnkgPSBzdGF0U3luYyhyZXNvbHZlZEFzc2V0UGF0aCkuaXNEaXJlY3RvcnkoKTtcbiAgICAgIH0gY2F0Y2gge1xuICAgICAgICBpc0RpcmVjdG9yeSA9IHRydWU7XG4gICAgICB9XG5cbiAgICAgIGlmIChpc0RpcmVjdG9yeSkge1xuICAgICAgICAvLyBGb2xkZXJzIGdldCBhIHJlY3Vyc2l2ZSBzdGFyIGdsb2IuXG4gICAgICAgIGdsb2IgPSAnKiovKic7XG4gICAgICAgIC8vIElucHV0IGRpcmVjdG9yeSBpcyB0aGVpciBvcmlnaW5hbCBwYXRoLlxuICAgICAgICBpbnB1dCA9IGFzc2V0UGF0aDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIEZpbGVzIGFyZSB0aGVpciBvd24gZ2xvYi5cbiAgICAgICAgZ2xvYiA9IHBhdGguYmFzZW5hbWUoYXNzZXRQYXRoKTtcbiAgICAgICAgLy8gSW5wdXQgZGlyZWN0b3J5IGlzIHRoZWlyIG9yaWdpbmFsIGRpcm5hbWUuXG4gICAgICAgIGlucHV0ID0gcGF0aC5kaXJuYW1lKGFzc2V0UGF0aCk7XG4gICAgICB9XG5cbiAgICAgIC8vIE91dHB1dCBkaXJlY3RvcnkgZm9yIGJvdGggaXMgdGhlIHJlbGF0aXZlIHBhdGggZnJvbSBzb3VyY2Ugcm9vdCB0byBpbnB1dC5cbiAgICAgIGNvbnN0IG91dHB1dCA9IHBhdGgucmVsYXRpdmUocmVzb2x2ZWRTb3VyY2VSb290LCBwYXRoLnJlc29sdmUod29ya3NwYWNlUm9vdCwgaW5wdXQpKTtcblxuICAgICAgYXNzZXRQYXR0ZXJuID0geyBnbG9iLCBpbnB1dCwgb3V0cHV0IH07XG4gICAgfVxuXG4gICAgaWYgKGFzc2V0UGF0dGVybi5vdXRwdXQuc3RhcnRzV2l0aCgnLi4nKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdBbiBhc3NldCBjYW5ub3QgYmUgd3JpdHRlbiB0byBhIGxvY2F0aW9uIG91dHNpZGUgb2YgdGhlIG91dHB1dCBwYXRoLicpO1xuICAgIH1cblxuICAgIHJldHVybiBhc3NldFBhdHRlcm47XG4gIH0pO1xufVxuIl19