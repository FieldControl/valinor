(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/compiler-cli/ngcc/src/writing/in_place_file_writer", ["require", "exports", "tslib", "@angular/compiler-cli/src/ngtsc/file_system"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.InPlaceFileWriter = exports.NGCC_BACKUP_EXTENSION = void 0;
    var tslib_1 = require("tslib");
    /**
     * @license
     * Copyright Google LLC All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    var file_system_1 = require("@angular/compiler-cli/src/ngtsc/file_system");
    exports.NGCC_BACKUP_EXTENSION = '.__ivy_ngcc_bak';
    /**
     * This FileWriter overwrites the transformed file, in-place, while creating
     * a back-up of the original file with an extra `.__ivy_ngcc_bak` extension.
     */
    var InPlaceFileWriter = /** @class */ (function () {
        function InPlaceFileWriter(fs, logger, errorOnFailedEntryPoint) {
            this.fs = fs;
            this.logger = logger;
            this.errorOnFailedEntryPoint = errorOnFailedEntryPoint;
        }
        InPlaceFileWriter.prototype.writeBundle = function (_bundle, transformedFiles, _formatProperties) {
            var _this = this;
            transformedFiles.forEach(function (file) { return _this.writeFileAndBackup(file); });
        };
        InPlaceFileWriter.prototype.revertBundle = function (_entryPoint, transformedFilePaths, _formatProperties) {
            var e_1, _a;
            try {
                for (var transformedFilePaths_1 = tslib_1.__values(transformedFilePaths), transformedFilePaths_1_1 = transformedFilePaths_1.next(); !transformedFilePaths_1_1.done; transformedFilePaths_1_1 = transformedFilePaths_1.next()) {
                    var filePath = transformedFilePaths_1_1.value;
                    this.revertFileAndBackup(filePath);
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (transformedFilePaths_1_1 && !transformedFilePaths_1_1.done && (_a = transformedFilePaths_1.return)) _a.call(transformedFilePaths_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
        };
        InPlaceFileWriter.prototype.writeFileAndBackup = function (file) {
            this.fs.ensureDir(file_system_1.dirname(file.path));
            var backPath = file_system_1.absoluteFrom("" + file.path + exports.NGCC_BACKUP_EXTENSION);
            if (this.fs.exists(backPath)) {
                if (this.errorOnFailedEntryPoint) {
                    throw new Error("Tried to overwrite " + backPath + " with an ngcc back up file, which is disallowed.");
                }
                else {
                    this.logger.error("Tried to write " + backPath + " with an ngcc back up file but it already exists so not writing, nor backing up, " + file.path + ".\n" +
                        "This error may be caused by one of the following:\n" +
                        "* two or more entry-points overlap and ngcc has been asked to process some files more than once.\n" +
                        "  In this case, you should check other entry-points in this package\n" +
                        "  and set up a config to ignore any that you are not using.\n" +
                        "* a previous run of ngcc was killed in the middle of processing, in a way that cannot be recovered.\n" +
                        "  In this case, you should try cleaning the node_modules directory and any dist directories that contain local libraries. Then try again.");
                }
            }
            else {
                if (this.fs.exists(file.path)) {
                    this.fs.moveFile(file.path, backPath);
                }
                this.fs.writeFile(file.path, file.contents);
            }
        };
        InPlaceFileWriter.prototype.revertFileAndBackup = function (filePath) {
            if (this.fs.exists(filePath)) {
                this.fs.removeFile(filePath);
                var backPath = file_system_1.absoluteFrom("" + filePath + exports.NGCC_BACKUP_EXTENSION);
                if (this.fs.exists(backPath)) {
                    this.fs.moveFile(backPath, filePath);
                }
            }
        };
        return InPlaceFileWriter;
    }());
    exports.InPlaceFileWriter = InPlaceFileWriter;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5fcGxhY2VfZmlsZV93cml0ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci1jbGkvbmdjYy9zcmMvd3JpdGluZy9pbl9wbGFjZV9maWxlX3dyaXRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O0lBQUE7Ozs7OztPQU1HO0lBQ0gsMkVBQWlHO0lBUXBGLFFBQUEscUJBQXFCLEdBQUcsaUJBQWlCLENBQUM7SUFDdkQ7OztPQUdHO0lBQ0g7UUFDRSwyQkFDYyxFQUFjLEVBQVksTUFBYyxFQUN4Qyx1QkFBZ0M7WUFEaEMsT0FBRSxHQUFGLEVBQUUsQ0FBWTtZQUFZLFdBQU0sR0FBTixNQUFNLENBQVE7WUFDeEMsNEJBQXVCLEdBQXZCLHVCQUF1QixDQUFTO1FBQUcsQ0FBQztRQUVsRCx1Q0FBVyxHQUFYLFVBQ0ksT0FBeUIsRUFBRSxnQkFBK0IsRUFDMUQsaUJBQTRDO1lBRmhELGlCQUlDO1lBREMsZ0JBQWdCLENBQUMsT0FBTyxDQUFDLFVBQUEsSUFBSSxJQUFJLE9BQUEsS0FBSSxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxFQUE3QixDQUE2QixDQUFDLENBQUM7UUFDbEUsQ0FBQztRQUVELHdDQUFZLEdBQVosVUFDSSxXQUF1QixFQUFFLG9CQUFzQyxFQUMvRCxpQkFBMkM7OztnQkFDN0MsS0FBdUIsSUFBQSx5QkFBQSxpQkFBQSxvQkFBb0IsQ0FBQSwwREFBQSw0RkFBRTtvQkFBeEMsSUFBTSxRQUFRLGlDQUFBO29CQUNqQixJQUFJLENBQUMsbUJBQW1CLENBQUMsUUFBUSxDQUFDLENBQUM7aUJBQ3BDOzs7Ozs7Ozs7UUFDSCxDQUFDO1FBRVMsOENBQWtCLEdBQTVCLFVBQTZCLElBQWlCO1lBQzVDLElBQUksQ0FBQyxFQUFFLENBQUMsU0FBUyxDQUFDLHFCQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDdEMsSUFBTSxRQUFRLEdBQUcsMEJBQVksQ0FBQyxLQUFHLElBQUksQ0FBQyxJQUFJLEdBQUcsNkJBQXVCLENBQUMsQ0FBQztZQUN0RSxJQUFJLElBQUksQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxFQUFFO2dCQUM1QixJQUFJLElBQUksQ0FBQyx1QkFBdUIsRUFBRTtvQkFDaEMsTUFBTSxJQUFJLEtBQUssQ0FDWCx3QkFBc0IsUUFBUSxxREFBa0QsQ0FBQyxDQUFDO2lCQUN2RjtxQkFBTTtvQkFDTCxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FDYixvQkFDSSxRQUFRLHlGQUNSLElBQUksQ0FBQyxJQUFJLFFBQUs7d0JBQ2xCLHFEQUFxRDt3QkFDckQsb0dBQW9HO3dCQUNwRyx1RUFBdUU7d0JBQ3ZFLCtEQUErRDt3QkFDL0QsdUdBQXVHO3dCQUN2RywySUFBMkksQ0FBQyxDQUFDO2lCQUNsSjthQUNGO2lCQUFNO2dCQUNMLElBQUksSUFBSSxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFO29CQUM3QixJQUFJLENBQUMsRUFBRSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLFFBQVEsQ0FBQyxDQUFDO2lCQUN2QztnQkFDRCxJQUFJLENBQUMsRUFBRSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQzthQUM3QztRQUNILENBQUM7UUFFUywrQ0FBbUIsR0FBN0IsVUFBOEIsUUFBd0I7WUFDcEQsSUFBSSxJQUFJLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsRUFBRTtnQkFDNUIsSUFBSSxDQUFDLEVBQUUsQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLENBQUM7Z0JBRTdCLElBQU0sUUFBUSxHQUFHLDBCQUFZLENBQUMsS0FBRyxRQUFRLEdBQUcsNkJBQXVCLENBQUMsQ0FBQztnQkFDckUsSUFBSSxJQUFJLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsRUFBRTtvQkFDNUIsSUFBSSxDQUFDLEVBQUUsQ0FBQyxRQUFRLENBQUMsUUFBUSxFQUFFLFFBQVEsQ0FBQyxDQUFDO2lCQUN0QzthQUNGO1FBQ0gsQ0FBQztRQUNILHdCQUFDO0lBQUQsQ0FBQyxBQXhERCxJQXdEQztJQXhEWSw4Q0FBaUIiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCB7YWJzb2x1dGVGcm9tLCBBYnNvbHV0ZUZzUGF0aCwgZGlybmFtZSwgRmlsZVN5c3RlbX0gZnJvbSAnLi4vLi4vLi4vc3JjL25ndHNjL2ZpbGVfc3lzdGVtJztcbmltcG9ydCB7TG9nZ2VyfSBmcm9tICcuLi8uLi8uLi9zcmMvbmd0c2MvbG9nZ2luZyc7XG5pbXBvcnQge0VudHJ5UG9pbnQsIEVudHJ5UG9pbnRKc29uUHJvcGVydHl9IGZyb20gJy4uL3BhY2thZ2VzL2VudHJ5X3BvaW50JztcbmltcG9ydCB7RW50cnlQb2ludEJ1bmRsZX0gZnJvbSAnLi4vcGFja2FnZXMvZW50cnlfcG9pbnRfYnVuZGxlJztcbmltcG9ydCB7RmlsZVRvV3JpdGV9IGZyb20gJy4uL3JlbmRlcmluZy91dGlscyc7XG5cbmltcG9ydCB7RmlsZVdyaXRlcn0gZnJvbSAnLi9maWxlX3dyaXRlcic7XG5cbmV4cG9ydCBjb25zdCBOR0NDX0JBQ0tVUF9FWFRFTlNJT04gPSAnLl9faXZ5X25nY2NfYmFrJztcbi8qKlxuICogVGhpcyBGaWxlV3JpdGVyIG92ZXJ3cml0ZXMgdGhlIHRyYW5zZm9ybWVkIGZpbGUsIGluLXBsYWNlLCB3aGlsZSBjcmVhdGluZ1xuICogYSBiYWNrLXVwIG9mIHRoZSBvcmlnaW5hbCBmaWxlIHdpdGggYW4gZXh0cmEgYC5fX2l2eV9uZ2NjX2Jha2AgZXh0ZW5zaW9uLlxuICovXG5leHBvcnQgY2xhc3MgSW5QbGFjZUZpbGVXcml0ZXIgaW1wbGVtZW50cyBGaWxlV3JpdGVyIHtcbiAgY29uc3RydWN0b3IoXG4gICAgICBwcm90ZWN0ZWQgZnM6IEZpbGVTeXN0ZW0sIHByb3RlY3RlZCBsb2dnZXI6IExvZ2dlcixcbiAgICAgIHByb3RlY3RlZCBlcnJvck9uRmFpbGVkRW50cnlQb2ludDogYm9vbGVhbikge31cblxuICB3cml0ZUJ1bmRsZShcbiAgICAgIF9idW5kbGU6IEVudHJ5UG9pbnRCdW5kbGUsIHRyYW5zZm9ybWVkRmlsZXM6IEZpbGVUb1dyaXRlW10sXG4gICAgICBfZm9ybWF0UHJvcGVydGllcz86IEVudHJ5UG9pbnRKc29uUHJvcGVydHlbXSkge1xuICAgIHRyYW5zZm9ybWVkRmlsZXMuZm9yRWFjaChmaWxlID0+IHRoaXMud3JpdGVGaWxlQW5kQmFja3VwKGZpbGUpKTtcbiAgfVxuXG4gIHJldmVydEJ1bmRsZShcbiAgICAgIF9lbnRyeVBvaW50OiBFbnRyeVBvaW50LCB0cmFuc2Zvcm1lZEZpbGVQYXRoczogQWJzb2x1dGVGc1BhdGhbXSxcbiAgICAgIF9mb3JtYXRQcm9wZXJ0aWVzOiBFbnRyeVBvaW50SnNvblByb3BlcnR5W10pOiB2b2lkIHtcbiAgICBmb3IgKGNvbnN0IGZpbGVQYXRoIG9mIHRyYW5zZm9ybWVkRmlsZVBhdGhzKSB7XG4gICAgICB0aGlzLnJldmVydEZpbGVBbmRCYWNrdXAoZmlsZVBhdGgpO1xuICAgIH1cbiAgfVxuXG4gIHByb3RlY3RlZCB3cml0ZUZpbGVBbmRCYWNrdXAoZmlsZTogRmlsZVRvV3JpdGUpOiB2b2lkIHtcbiAgICB0aGlzLmZzLmVuc3VyZURpcihkaXJuYW1lKGZpbGUucGF0aCkpO1xuICAgIGNvbnN0IGJhY2tQYXRoID0gYWJzb2x1dGVGcm9tKGAke2ZpbGUucGF0aH0ke05HQ0NfQkFDS1VQX0VYVEVOU0lPTn1gKTtcbiAgICBpZiAodGhpcy5mcy5leGlzdHMoYmFja1BhdGgpKSB7XG4gICAgICBpZiAodGhpcy5lcnJvck9uRmFpbGVkRW50cnlQb2ludCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgICBgVHJpZWQgdG8gb3ZlcndyaXRlICR7YmFja1BhdGh9IHdpdGggYW4gbmdjYyBiYWNrIHVwIGZpbGUsIHdoaWNoIGlzIGRpc2FsbG93ZWQuYCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmxvZ2dlci5lcnJvcihcbiAgICAgICAgICAgIGBUcmllZCB0byB3cml0ZSAke1xuICAgICAgICAgICAgICAgIGJhY2tQYXRofSB3aXRoIGFuIG5nY2MgYmFjayB1cCBmaWxlIGJ1dCBpdCBhbHJlYWR5IGV4aXN0cyBzbyBub3Qgd3JpdGluZywgbm9yIGJhY2tpbmcgdXAsICR7XG4gICAgICAgICAgICAgICAgZmlsZS5wYXRofS5cXG5gICtcbiAgICAgICAgICAgIGBUaGlzIGVycm9yIG1heSBiZSBjYXVzZWQgYnkgb25lIG9mIHRoZSBmb2xsb3dpbmc6XFxuYCArXG4gICAgICAgICAgICBgKiB0d28gb3IgbW9yZSBlbnRyeS1wb2ludHMgb3ZlcmxhcCBhbmQgbmdjYyBoYXMgYmVlbiBhc2tlZCB0byBwcm9jZXNzIHNvbWUgZmlsZXMgbW9yZSB0aGFuIG9uY2UuXFxuYCArXG4gICAgICAgICAgICBgICBJbiB0aGlzIGNhc2UsIHlvdSBzaG91bGQgY2hlY2sgb3RoZXIgZW50cnktcG9pbnRzIGluIHRoaXMgcGFja2FnZVxcbmAgK1xuICAgICAgICAgICAgYCAgYW5kIHNldCB1cCBhIGNvbmZpZyB0byBpZ25vcmUgYW55IHRoYXQgeW91IGFyZSBub3QgdXNpbmcuXFxuYCArXG4gICAgICAgICAgICBgKiBhIHByZXZpb3VzIHJ1biBvZiBuZ2NjIHdhcyBraWxsZWQgaW4gdGhlIG1pZGRsZSBvZiBwcm9jZXNzaW5nLCBpbiBhIHdheSB0aGF0IGNhbm5vdCBiZSByZWNvdmVyZWQuXFxuYCArXG4gICAgICAgICAgICBgICBJbiB0aGlzIGNhc2UsIHlvdSBzaG91bGQgdHJ5IGNsZWFuaW5nIHRoZSBub2RlX21vZHVsZXMgZGlyZWN0b3J5IGFuZCBhbnkgZGlzdCBkaXJlY3RvcmllcyB0aGF0IGNvbnRhaW4gbG9jYWwgbGlicmFyaWVzLiBUaGVuIHRyeSBhZ2Fpbi5gKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKHRoaXMuZnMuZXhpc3RzKGZpbGUucGF0aCkpIHtcbiAgICAgICAgdGhpcy5mcy5tb3ZlRmlsZShmaWxlLnBhdGgsIGJhY2tQYXRoKTtcbiAgICAgIH1cbiAgICAgIHRoaXMuZnMud3JpdGVGaWxlKGZpbGUucGF0aCwgZmlsZS5jb250ZW50cyk7XG4gICAgfVxuICB9XG5cbiAgcHJvdGVjdGVkIHJldmVydEZpbGVBbmRCYWNrdXAoZmlsZVBhdGg6IEFic29sdXRlRnNQYXRoKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuZnMuZXhpc3RzKGZpbGVQYXRoKSkge1xuICAgICAgdGhpcy5mcy5yZW1vdmVGaWxlKGZpbGVQYXRoKTtcblxuICAgICAgY29uc3QgYmFja1BhdGggPSBhYnNvbHV0ZUZyb20oYCR7ZmlsZVBhdGh9JHtOR0NDX0JBQ0tVUF9FWFRFTlNJT059YCk7XG4gICAgICBpZiAodGhpcy5mcy5leGlzdHMoYmFja1BhdGgpKSB7XG4gICAgICAgIHRoaXMuZnMubW92ZUZpbGUoYmFja1BhdGgsIGZpbGVQYXRoKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cbiJdfQ==