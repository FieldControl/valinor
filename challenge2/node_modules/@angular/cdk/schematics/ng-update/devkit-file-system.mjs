"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DevkitFileSystem = void 0;
const core_1 = require("@angular-devkit/core");
const file_system_1 = require("../update-tool/file-system");
const path = require("path");
/**
 * File system that leverages the virtual tree from the CLI devkit. This file
 * system is commonly used by `ng update` migrations that run as part of the
 * Angular CLI.
 */
class DevkitFileSystem extends file_system_1.FileSystem {
    constructor(_tree) {
        super();
        this._tree = _tree;
        this._updateRecorderCache = new Map();
    }
    resolve(...segments) {
        // Note: We use `posix.resolve` as the devkit paths are using posix separators.
        return core_1.normalize(path.posix.resolve('/', ...segments.map(core_1.normalize)));
    }
    edit(filePath) {
        if (this._updateRecorderCache.has(filePath)) {
            return this._updateRecorderCache.get(filePath);
        }
        const recorder = this._tree.beginUpdate(filePath);
        this._updateRecorderCache.set(filePath, recorder);
        return recorder;
    }
    commitEdits() {
        this._updateRecorderCache.forEach(r => this._tree.commitUpdate(r));
        this._updateRecorderCache.clear();
    }
    exists(fileOrDirPath) {
        // We need to check for both file or directory existence, in order
        // to comply with the expectation from the TypeScript compiler.
        return this._tree.exists(fileOrDirPath) || this._isExistingDirectory(fileOrDirPath);
    }
    overwrite(filePath, content) {
        this._tree.overwrite(filePath, content);
    }
    create(filePath, content) {
        this._tree.create(filePath, content);
    }
    delete(filePath) {
        this._tree.delete(filePath);
    }
    read(filePath) {
        const buffer = this._tree.read(filePath);
        return buffer !== null ? buffer.toString() : null;
    }
    readDirectory(dirPath) {
        const { subdirs: directories, subfiles: files } = this._tree.getDir(dirPath);
        return { directories, files };
    }
    _isExistingDirectory(dirPath) {
        if (dirPath === core_1.NormalizedRoot) {
            return true;
        }
        const parent = core_1.dirname(dirPath);
        const dirName = core_1.basename(dirPath);
        // TypeScript also checks potential entry points, so e.g. importing
        // package.json will result in a lookup of /package.json/package.json
        // and /package.json/index.ts. In order to avoid failure, we check if
        // the parent is an existing file and return false, if that is the case.
        if (this._tree.exists(parent)) {
            return false;
        }
        const dir = this._tree.getDir(parent);
        return dir.subdirs.indexOf(dirName) !== -1;
    }
}
exports.DevkitFileSystem = DevkitFileSystem;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGV2a2l0LWZpbGUtc3lzdGVtLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2Nkay9zY2hlbWF0aWNzL25nLXVwZGF0ZS9kZXZraXQtZmlsZS1zeXN0ZW0udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7R0FNRzs7O0FBRUgsK0NBQXdGO0FBRXhGLDREQUFzRTtBQUN0RSw2QkFBNkI7QUFFN0I7Ozs7R0FJRztBQUNILE1BQWEsZ0JBQWlCLFNBQVEsd0JBQVU7SUFHOUMsWUFBb0IsS0FBVztRQUM3QixLQUFLLEVBQUUsQ0FBQztRQURVLFVBQUssR0FBTCxLQUFLLENBQU07UUFGdkIseUJBQW9CLEdBQUcsSUFBSSxHQUFHLEVBQTBCLENBQUM7SUFJakUsQ0FBQztJQUVELE9BQU8sQ0FBQyxHQUFHLFFBQWtCO1FBQzNCLCtFQUErRTtRQUMvRSxPQUFPLGdCQUFTLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsR0FBRyxFQUFFLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyxnQkFBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ3hFLENBQUM7SUFFRCxJQUFJLENBQUMsUUFBYztRQUNqQixJQUFJLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLEVBQUU7WUFDM0MsT0FBTyxJQUFJLENBQUMsb0JBQW9CLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBRSxDQUFDO1NBQ2pEO1FBQ0QsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDbEQsSUFBSSxDQUFDLG9CQUFvQixDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsUUFBUSxDQUFDLENBQUM7UUFDbEQsT0FBTyxRQUFRLENBQUM7SUFDbEIsQ0FBQztJQUVELFdBQVc7UUFDVCxJQUFJLENBQUMsb0JBQW9CLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNuRSxJQUFJLENBQUMsb0JBQW9CLENBQUMsS0FBSyxFQUFFLENBQUM7SUFDcEMsQ0FBQztJQUVELE1BQU0sQ0FBQyxhQUFtQjtRQUN4QixrRUFBa0U7UUFDbEUsK0RBQStEO1FBQy9ELE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsYUFBYSxDQUFDLElBQUksSUFBSSxDQUFDLG9CQUFvQixDQUFDLGFBQWEsQ0FBQyxDQUFDO0lBQ3RGLENBQUM7SUFFRCxTQUFTLENBQUMsUUFBYyxFQUFFLE9BQWU7UUFDdkMsSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsUUFBUSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQzFDLENBQUM7SUFFRCxNQUFNLENBQUMsUUFBYyxFQUFFLE9BQWU7UUFDcEMsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQ3ZDLENBQUM7SUFFRCxNQUFNLENBQUMsUUFBYztRQUNuQixJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUM5QixDQUFDO0lBRUQsSUFBSSxDQUFDLFFBQWM7UUFDakIsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDekMsT0FBTyxNQUFNLEtBQUssSUFBSSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztJQUNwRCxDQUFDO0lBRUQsYUFBYSxDQUFDLE9BQWE7UUFDekIsTUFBTSxFQUFDLE9BQU8sRUFBRSxXQUFXLEVBQUUsUUFBUSxFQUFFLEtBQUssRUFBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQzNFLE9BQU8sRUFBQyxXQUFXLEVBQUUsS0FBSyxFQUFDLENBQUM7SUFDOUIsQ0FBQztJQUVPLG9CQUFvQixDQUFDLE9BQWE7UUFDeEMsSUFBSSxPQUFPLEtBQUsscUJBQWMsRUFBRTtZQUM5QixPQUFPLElBQUksQ0FBQztTQUNiO1FBRUQsTUFBTSxNQUFNLEdBQUcsY0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ2hDLE1BQU0sT0FBTyxHQUFHLGVBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUNsQyxtRUFBbUU7UUFDbkUscUVBQXFFO1FBQ3JFLHFFQUFxRTtRQUNyRSx3RUFBd0U7UUFDeEUsSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsRUFBRTtZQUM3QixPQUFPLEtBQUssQ0FBQztTQUNkO1FBRUQsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDdEMsT0FBTyxHQUFHLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztJQUM3QyxDQUFDO0NBQ0Y7QUF4RUQsNENBd0VDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7YmFzZW5hbWUsIGRpcm5hbWUsIG5vcm1hbGl6ZSwgTm9ybWFsaXplZFJvb3QsIFBhdGh9IGZyb20gJ0Bhbmd1bGFyLWRldmtpdC9jb3JlJztcbmltcG9ydCB7VHJlZSwgVXBkYXRlUmVjb3JkZXJ9IGZyb20gJ0Bhbmd1bGFyLWRldmtpdC9zY2hlbWF0aWNzJztcbmltcG9ydCB7RGlyZWN0b3J5RW50cnksIEZpbGVTeXN0ZW19IGZyb20gJy4uL3VwZGF0ZS10b29sL2ZpbGUtc3lzdGVtJztcbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XG5cbi8qKlxuICogRmlsZSBzeXN0ZW0gdGhhdCBsZXZlcmFnZXMgdGhlIHZpcnR1YWwgdHJlZSBmcm9tIHRoZSBDTEkgZGV2a2l0LiBUaGlzIGZpbGVcbiAqIHN5c3RlbSBpcyBjb21tb25seSB1c2VkIGJ5IGBuZyB1cGRhdGVgIG1pZ3JhdGlvbnMgdGhhdCBydW4gYXMgcGFydCBvZiB0aGVcbiAqIEFuZ3VsYXIgQ0xJLlxuICovXG5leHBvcnQgY2xhc3MgRGV2a2l0RmlsZVN5c3RlbSBleHRlbmRzIEZpbGVTeXN0ZW0ge1xuICBwcml2YXRlIF91cGRhdGVSZWNvcmRlckNhY2hlID0gbmV3IE1hcDxzdHJpbmcsIFVwZGF0ZVJlY29yZGVyPigpO1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgX3RyZWU6IFRyZWUpIHtcbiAgICBzdXBlcigpO1xuICB9XG5cbiAgcmVzb2x2ZSguLi5zZWdtZW50czogc3RyaW5nW10pOiBQYXRoIHtcbiAgICAvLyBOb3RlOiBXZSB1c2UgYHBvc2l4LnJlc29sdmVgIGFzIHRoZSBkZXZraXQgcGF0aHMgYXJlIHVzaW5nIHBvc2l4IHNlcGFyYXRvcnMuXG4gICAgcmV0dXJuIG5vcm1hbGl6ZShwYXRoLnBvc2l4LnJlc29sdmUoJy8nLCAuLi5zZWdtZW50cy5tYXAobm9ybWFsaXplKSkpO1xuICB9XG5cbiAgZWRpdChmaWxlUGF0aDogUGF0aCkge1xuICAgIGlmICh0aGlzLl91cGRhdGVSZWNvcmRlckNhY2hlLmhhcyhmaWxlUGF0aCkpIHtcbiAgICAgIHJldHVybiB0aGlzLl91cGRhdGVSZWNvcmRlckNhY2hlLmdldChmaWxlUGF0aCkhO1xuICAgIH1cbiAgICBjb25zdCByZWNvcmRlciA9IHRoaXMuX3RyZWUuYmVnaW5VcGRhdGUoZmlsZVBhdGgpO1xuICAgIHRoaXMuX3VwZGF0ZVJlY29yZGVyQ2FjaGUuc2V0KGZpbGVQYXRoLCByZWNvcmRlcik7XG4gICAgcmV0dXJuIHJlY29yZGVyO1xuICB9XG5cbiAgY29tbWl0RWRpdHMoKSB7XG4gICAgdGhpcy5fdXBkYXRlUmVjb3JkZXJDYWNoZS5mb3JFYWNoKHIgPT4gdGhpcy5fdHJlZS5jb21taXRVcGRhdGUocikpO1xuICAgIHRoaXMuX3VwZGF0ZVJlY29yZGVyQ2FjaGUuY2xlYXIoKTtcbiAgfVxuXG4gIGV4aXN0cyhmaWxlT3JEaXJQYXRoOiBQYXRoKSB7XG4gICAgLy8gV2UgbmVlZCB0byBjaGVjayBmb3IgYm90aCBmaWxlIG9yIGRpcmVjdG9yeSBleGlzdGVuY2UsIGluIG9yZGVyXG4gICAgLy8gdG8gY29tcGx5IHdpdGggdGhlIGV4cGVjdGF0aW9uIGZyb20gdGhlIFR5cGVTY3JpcHQgY29tcGlsZXIuXG4gICAgcmV0dXJuIHRoaXMuX3RyZWUuZXhpc3RzKGZpbGVPckRpclBhdGgpIHx8IHRoaXMuX2lzRXhpc3RpbmdEaXJlY3RvcnkoZmlsZU9yRGlyUGF0aCk7XG4gIH1cblxuICBvdmVyd3JpdGUoZmlsZVBhdGg6IFBhdGgsIGNvbnRlbnQ6IHN0cmluZykge1xuICAgIHRoaXMuX3RyZWUub3ZlcndyaXRlKGZpbGVQYXRoLCBjb250ZW50KTtcbiAgfVxuXG4gIGNyZWF0ZShmaWxlUGF0aDogUGF0aCwgY29udGVudDogc3RyaW5nKSB7XG4gICAgdGhpcy5fdHJlZS5jcmVhdGUoZmlsZVBhdGgsIGNvbnRlbnQpO1xuICB9XG5cbiAgZGVsZXRlKGZpbGVQYXRoOiBQYXRoKSB7XG4gICAgdGhpcy5fdHJlZS5kZWxldGUoZmlsZVBhdGgpO1xuICB9XG5cbiAgcmVhZChmaWxlUGF0aDogUGF0aCkge1xuICAgIGNvbnN0IGJ1ZmZlciA9IHRoaXMuX3RyZWUucmVhZChmaWxlUGF0aCk7XG4gICAgcmV0dXJuIGJ1ZmZlciAhPT0gbnVsbCA/IGJ1ZmZlci50b1N0cmluZygpIDogbnVsbDtcbiAgfVxuXG4gIHJlYWREaXJlY3RvcnkoZGlyUGF0aDogUGF0aCk6IERpcmVjdG9yeUVudHJ5IHtcbiAgICBjb25zdCB7c3ViZGlyczogZGlyZWN0b3JpZXMsIHN1YmZpbGVzOiBmaWxlc30gPSB0aGlzLl90cmVlLmdldERpcihkaXJQYXRoKTtcbiAgICByZXR1cm4ge2RpcmVjdG9yaWVzLCBmaWxlc307XG4gIH1cblxuICBwcml2YXRlIF9pc0V4aXN0aW5nRGlyZWN0b3J5KGRpclBhdGg6IFBhdGgpIHtcbiAgICBpZiAoZGlyUGF0aCA9PT0gTm9ybWFsaXplZFJvb3QpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIGNvbnN0IHBhcmVudCA9IGRpcm5hbWUoZGlyUGF0aCk7XG4gICAgY29uc3QgZGlyTmFtZSA9IGJhc2VuYW1lKGRpclBhdGgpO1xuICAgIC8vIFR5cGVTY3JpcHQgYWxzbyBjaGVja3MgcG90ZW50aWFsIGVudHJ5IHBvaW50cywgc28gZS5nLiBpbXBvcnRpbmdcbiAgICAvLyBwYWNrYWdlLmpzb24gd2lsbCByZXN1bHQgaW4gYSBsb29rdXAgb2YgL3BhY2thZ2UuanNvbi9wYWNrYWdlLmpzb25cbiAgICAvLyBhbmQgL3BhY2thZ2UuanNvbi9pbmRleC50cy4gSW4gb3JkZXIgdG8gYXZvaWQgZmFpbHVyZSwgd2UgY2hlY2sgaWZcbiAgICAvLyB0aGUgcGFyZW50IGlzIGFuIGV4aXN0aW5nIGZpbGUgYW5kIHJldHVybiBmYWxzZSwgaWYgdGhhdCBpcyB0aGUgY2FzZS5cbiAgICBpZiAodGhpcy5fdHJlZS5leGlzdHMocGFyZW50KSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGNvbnN0IGRpciA9IHRoaXMuX3RyZWUuZ2V0RGlyKHBhcmVudCk7XG4gICAgcmV0dXJuIGRpci5zdWJkaXJzLmluZGV4T2YoZGlyTmFtZSkgIT09IC0xO1xuICB9XG59XG4iXX0=