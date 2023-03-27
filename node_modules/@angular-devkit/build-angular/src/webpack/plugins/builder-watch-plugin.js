"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.BuilderWatchPlugin = void 0;
class TimeInfoMap extends Map {
    update(path, timestamp) {
        this.set(path, Object.freeze({ safeTime: timestamp, timestamp }));
    }
    toTimestamps() {
        const timestamps = new Map();
        for (const [file, entry] of this) {
            timestamps.set(file, entry.timestamp);
        }
        return timestamps;
    }
}
class BuilderWatchFileSystem {
    constructor(watcherFactory, inputFileSystem) {
        this.watcherFactory = watcherFactory;
        this.inputFileSystem = inputFileSystem;
    }
    watch(files, directories, missing, startTime, _options, callback, callbackUndelayed) {
        const watchedFiles = new Set(files);
        const watchedDirectories = new Set(directories);
        const watchedMissing = new Set(missing);
        const timeInfo = new TimeInfoMap();
        for (const file of files) {
            timeInfo.update(file, startTime);
        }
        for (const directory of directories) {
            timeInfo.update(directory, startTime);
        }
        const watcher = this.watcherFactory.watch(files, directories, (events) => {
            if (events.length === 0) {
                return;
            }
            if (callbackUndelayed) {
                process.nextTick(() => { var _a; return callbackUndelayed(events[0].path, (_a = events[0].time) !== null && _a !== void 0 ? _a : Date.now()); });
            }
            process.nextTick(() => {
                var _a, _b, _c;
                const removals = new Set();
                const fileChanges = new Set();
                const directoryChanges = new Set();
                const missingChanges = new Set();
                for (const event of events) {
                    (_b = (_a = this.inputFileSystem).purge) === null || _b === void 0 ? void 0 : _b.call(_a, event.path);
                    if (event.type === 'deleted') {
                        timeInfo.delete(event.path);
                        removals.add(event.path);
                    }
                    else {
                        timeInfo.update(event.path, (_c = event.time) !== null && _c !== void 0 ? _c : Date.now());
                        if (watchedFiles.has(event.path)) {
                            fileChanges.add(event.path);
                        }
                        else if (watchedDirectories.has(event.path)) {
                            directoryChanges.add(event.path);
                        }
                        else if (watchedMissing.has(event.path)) {
                            missingChanges.add(event.path);
                        }
                    }
                }
                const timeInfoMap = new Map(timeInfo);
                callback(undefined, timeInfoMap, timeInfoMap, new Set([...fileChanges, ...directoryChanges, ...missingChanges]), removals);
            });
        });
        return {
            close() {
                watcher.close();
            },
            pause() { },
            getFileTimeInfoEntries() {
                return new Map(timeInfo);
            },
            getContextTimeInfoEntries() {
                return new Map(timeInfo);
            },
        };
    }
}
class BuilderWatchPlugin {
    constructor(watcherFactory) {
        this.watcherFactory = watcherFactory;
    }
    apply(compiler) {
        compiler.hooks.environment.tap('BuilderWatchPlugin', () => {
            compiler.watchFileSystem = new BuilderWatchFileSystem(this.watcherFactory, compiler.inputFileSystem);
        });
    }
}
exports.BuilderWatchPlugin = BuilderWatchPlugin;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVpbGRlci13YXRjaC1wbHVnaW4uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9hbmd1bGFyX2RldmtpdC9idWlsZF9hbmd1bGFyL3NyYy93ZWJwYWNrL3BsdWdpbnMvYnVpbGRlci13YXRjaC1wbHVnaW4udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7R0FNRzs7O0FBZ0JILE1BQU0sV0FBWSxTQUFRLEdBQW9EO0lBQzVFLE1BQU0sQ0FBQyxJQUFZLEVBQUUsU0FBaUI7UUFDcEMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFFLFFBQVEsRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBQ3BFLENBQUM7SUFFRCxZQUFZO1FBQ1YsTUFBTSxVQUFVLEdBQUcsSUFBSSxHQUFHLEVBQWtCLENBQUM7UUFDN0MsS0FBSyxNQUFNLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxJQUFJLElBQUksRUFBRTtZQUNoQyxVQUFVLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsU0FBUyxDQUFDLENBQUM7U0FDdkM7UUFFRCxPQUFPLFVBQVUsQ0FBQztJQUNwQixDQUFDO0NBQ0Y7QUFPRCxNQUFNLHNCQUFzQjtJQUMxQixZQUNtQixjQUFxQyxFQUNyQyxlQUE0QztRQUQ1QyxtQkFBYyxHQUFkLGNBQWMsQ0FBdUI7UUFDckMsb0JBQWUsR0FBZixlQUFlLENBQTZCO0lBQzVELENBQUM7SUFFSixLQUFLLENBQ0gsS0FBdUIsRUFDdkIsV0FBNkIsRUFDN0IsT0FBeUIsRUFDekIsU0FBaUIsRUFDakIsUUFBc0IsRUFDdEIsUUFBdUIsRUFDdkIsaUJBQXdEO1FBRXhELE1BQU0sWUFBWSxHQUFHLElBQUksR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ3BDLE1BQU0sa0JBQWtCLEdBQUcsSUFBSSxH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QyxDQUFDO1FBQ0wsQ0FBQyxDQUFDLENBQUM7UUFFSCxPQUFPO1lBQ0wsS0FBSztnQkFDSCxPQUFPLENBQUMsS0FBSyxFQUFFLENBQUM7WUFDbEIsQ0FBQztZQUNELEtBQUssS0FBSSxDQUFDO1lBQ1Ysc0JBQXNCO2dCQUNwQixPQUFPLElBQUksR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQzNCLENBQUM7WUFDRCx5QkFBeUI7Z0JBQ3ZCLE9BQU8sSUFBSSxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDM0IsQ0FBQztTQUNGLENBQUM7SUFDSixDQUFDO0NBQ0Y7QUFFRCxNQUFhLGtCQUFrQjtJQUM3QixZQUE2QixjQUFxQztRQUFyQyxtQkFBYyxHQUFkLGNBQWMsQ0FBdUI7SUFBRyxDQUFDO0lBRXRFLEtBQUssQ0FBQyxRQUFrQjtRQUN0QixRQUFRLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsb0JBQW9CLEVBQUUsR0FBRyxFQUFFO1lBQ3hELFFBQVEsQ0FBQyxlQUFlLEdBQUcsSUFBSSxzQkFBc0IsQ0FDbkQsSUFBSSxDQUFDLGNBQWMsRUFDbkIsUUFBUSxDQUFDLGVBQWUsQ0FDekIsQ0FBQztRQUNKLENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztDQUNGO0FBWEQsZ0RBV0MiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHsgQ29tcGlsZXIgfSBmcm9tICd3ZWJwYWNrJztcblxuZXhwb3J0IHR5cGUgQnVpbGRlcldhdGNoZXJDYWxsYmFjayA9IChcbiAgZXZlbnRzOiBBcnJheTx7IHBhdGg6IHN0cmluZzsgdHlwZTogJ2NyZWF0ZWQnIHwgJ21vZGlmaWVkJyB8ICdkZWxldGVkJzsgdGltZT86IG51bWJlciB9PixcbikgPT4gdm9pZDtcblxuZXhwb3J0IGludGVyZmFjZSBCdWlsZGVyV2F0Y2hlckZhY3Rvcnkge1xuICB3YXRjaChcbiAgICBmaWxlczogSXRlcmFibGU8c3RyaW5nPixcbiAgICBkaXJlY3RvcmllczogSXRlcmFibGU8c3RyaW5nPixcbiAgICBjYWxsYmFjazogQnVpbGRlcldhdGNoZXJDYWxsYmFjayxcbiAgKTogeyBjbG9zZSgpOiB2b2lkIH07XG59XG5cbmNsYXNzIFRpbWVJbmZvTWFwIGV4dGVuZHMgTWFwPHN0cmluZywgeyBzYWZlVGltZTogbnVtYmVyOyB0aW1lc3RhbXA6IG51bWJlciB9PiB7XG4gIHVwZGF0ZShwYXRoOiBzdHJpbmcsIHRpbWVzdGFtcDogbnVtYmVyKTogdm9pZCB7XG4gICAgdGhpcy5zZXQocGF0aCwgT2JqZWN0LmZyZWV6ZSh7IHNhZmVUaW1lOiB0aW1lc3RhbXAsIHRpbWVzdGFtcCB9KSk7XG4gIH1cblxuICB0b1RpbWVzdGFtcHMoKTogTWFwPHN0cmluZywgbnVtYmVyPiB7XG4gICAgY29uc3QgdGltZXN0YW1wcyA9IG5ldyBNYXA8c3RyaW5nLCBudW1iZXI+KCk7XG4gICAgZm9yIChjb25zdCBbZmlsZSwgZW50cnldIG9mIHRoaXMpIHtcbiAgICAgIHRpbWVzdGFtcHMuc2V0KGZpbGUsIGVudHJ5LnRpbWVzdGFtcCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRpbWVzdGFtcHM7XG4gIH1cbn1cblxuLy8gRXh0cmFjdCB3YXRjaCByZWxhdGVkIHR5cGVzIGZyb20gdGhlIFdlYnBhY2sgY29tcGlsZXIgdHlwZSBzaW5jZSB0aGV5IGFyZSBub3QgZGlyZWN0bHkgZXhwb3J0ZWRcbnR5cGUgV2VicGFja1dhdGNoRmlsZVN5c3RlbSA9IENvbXBpbGVyWyd3YXRjaEZpbGVTeXN0ZW0nXTtcbnR5cGUgV2F0Y2hPcHRpb25zID0gUGFyYW1ldGVyczxXZWJwYWNrV2F0Y2hGaWxlU3lzdGVtWyd3YXRjaCddPls0XTtcbnR5cGUgV2F0Y2hDYWxsYmFjayA9IFBhcmFtZXRlcnM8V2VicGFja1dhdGNoRmlsZVN5c3RlbVsnd2F0Y2gnXT5bNV07XG5cbmNsYXNzIEJ1aWxkZXJXYXRjaEZpbGVTeXN0ZW0gaW1wbGVtZW50cyBXZWJwYWNrV2F0Y2hGaWxlU3lzdGVtIHtcbiAgY29uc3RydWN0b3IoXG4gICAgcHJpdmF0ZSByZWFkb25seSB3YXRjaGVyRmFjdG9yeTogQnVpbGRlcldhdGNoZXJGYWN0b3J5LFxuICAgIHByaXZhdGUgcmVhZG9ubHkgaW5wdXRGaWxlU3lzdGVtOiBDb21waWxlclsnaW5wdXRGaWxlU3lzdGVtJ10sXG4gICkge31cblxuICB3YXRjaChcbiAgICBmaWxlczogSXRlcmFibGU8c3RyaW5nPixcbiAgICBkaXJlY3RvcmllczogSXRlcmFibGU8c3RyaW5nPixcbiAgICBtaXNzaW5nOiBJdGVyYWJsZTxzdHJpbmc+LFxuICAgIHN0YXJ0VGltZTogbnVtYmVyLFxuICAgIF9vcHRpb25zOiBXYXRjaE9wdGlvbnMsXG4gICAgY2FsbGJhY2s6IFdhdGNoQ2FsbGJhY2ssXG4gICAgY2FsbGJhY2tVbmRlbGF5ZWQ/OiAoZmlsZTogc3RyaW5nLCB0aW1lOiBudW1iZXIpID0+IHZvaWQsXG4gICk6IFJldHVyblR5cGU8V2VicGFja1dhdGNoRmlsZVN5c3RlbVsnd2F0Y2gnXT4ge1xuICAgIGNvbnN0IHdhdGNoZWRGaWxlcyA9IG5ldyBTZXQoZmlsZXMpO1xuICAgIGNvbnN0IHdhdGNoZWREaXJlY3RvcmllcyA9IG5ldyBTZXQoZGlyZWN0b3JpZXMpO1xuICAgIGNvbnN0IHdhdGNoZWRNaXNzaW5nID0gbmV3IFNldChtaXNzaW5nKTtcblxuICAgIGNvbnN0IHRpbWVJbmZvID0gbmV3IFRpbWVJbmZvTWFwKCk7XG4gICAgZm9yIChjb25zdCBmaWxlIG9mIGZpbGVzKSB7XG4gICAgICB0aW1lSW5mby51cGRhdGUoZmlsZSwgc3RhcnRUaW1lKTtcbiAgICB9XG4gICAgZm9yIChjb25zdCBkaXJlY3Rvcnkgb2YgZGlyZWN0b3JpZXMpIHtcbiAgICAgIHRpbWVJbmZvLnVwZGF0ZShkaXJlY3RvcnksIHN0YXJ0VGltZSk7XG4gICAgfVxuXG4gICAgY29uc3Qgd2F0Y2hlciA9IHRoaXMud2F0Y2hlckZhY3Rvcnkud2F0Y2goZmlsZXMsIGRpcmVjdG9yaWVzLCAoZXZlbnRzKSA9PiB7XG4gICAgICBpZiAoZXZlbnRzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGlmIChjYWxsYmFja1VuZGVsYXllZCkge1xuICAgICAgICBwcm9jZXNzLm5leHRUaWNrKCgpID0+IGNhbGxiYWNrVW5kZWxheWVkKGV2ZW50c1swXS5wYXRoLCBldmVudHNbMF0udGltZSA/PyBEYXRlLm5vdygpKSk7XG4gICAgICB9XG5cbiAgICAgIHByb2Nlc3MubmV4dFRpY2soKCkgPT4ge1xuICAgICAgICBjb25zdCByZW1vdmFscyA9IG5ldyBTZXQ8c3RyaW5nPigpO1xuICAgICAgICBjb25zdCBmaWxlQ2hhbmdlcyA9IG5ldyBTZXQ8c3RyaW5nPigpO1xuICAgICAgICBjb25zdCBkaXJlY3RvcnlDaGFuZ2VzID0gbmV3IFNldDxzdHJpbmc+KCk7XG4gICAgICAgIGNvbnN0IG1pc3NpbmdDaGFuZ2VzID0gbmV3IFNldDxzdHJpbmc+KCk7XG5cbiAgICAgICAgZm9yIChjb25zdCBldmVudCBvZiBldmVudHMpIHtcbiAgICAgICAgICB0aGlzLmlucHV0RmlsZVN5c3RlbS5wdXJnZT8uKGV2ZW50LnBhdGgpO1xuXG4gICAgICAgICAgaWYgKGV2ZW50LnR5cGUgPT09ICdkZWxldGVkJykge1xuICAgICAgICAgICAgdGltZUluZm8uZGVsZXRlKGV2ZW50LnBhdGgpO1xuICAgICAgICAgICAgcmVtb3ZhbHMuYWRkKGV2ZW50LnBhdGgpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aW1lSW5mby51cGRhdGUoZXZlbnQucGF0aCwgZXZlbnQudGltZSA/PyBEYXRlLm5vdygpKTtcbiAgICAgICAgICAgIGlmICh3YXRjaGVkRmlsZXMuaGFzKGV2ZW50LnBhdGgpKSB7XG4gICAgICAgICAgICAgIGZpbGVDaGFuZ2VzLmFkZChldmVudC5wYXRoKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAod2F0Y2hlZERpcmVjdG9yaWVzLmhhcyhldmVudC5wYXRoKSkge1xuICAgICAgICAgICAgICBkaXJlY3RvcnlDaGFuZ2VzLmFkZChldmVudC5wYXRoKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAod2F0Y2hlZE1pc3NpbmcuaGFzKGV2ZW50LnBhdGgpKSB7XG4gICAgICAgICAgICAgIG1pc3NpbmdDaGFuZ2VzLmFkZChldmVudC5wYXRoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCB0aW1lSW5mb01hcCA9IG5ldyBNYXAodGltZUluZm8pO1xuXG4gICAgICAgIGNhbGxiYWNrKFxuICAgICAgICAgIHVuZGVmaW5lZCxcbiAgICAgICAgICB0aW1lSW5mb01hcCxcbiAgICAgICAgICB0aW1lSW5mb01hcCxcbiAgICAgICAgICBuZXcgU2V0KFsuLi5maWxlQ2hhbmdlcywgLi4uZGlyZWN0b3J5Q2hhbmdlcywgLi4ubWlzc2luZ0NoYW5nZXNdKSxcbiAgICAgICAgICByZW1vdmFscyxcbiAgICAgICAgKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIGNsb3NlKCkge1xuICAgICAgICB3YXRjaGVyLmNsb3NlKCk7XG4gICAgICB9LFxuICAgICAgcGF1c2UoKSB7fSxcbiAgICAgIGdldEZpbGVUaW1lSW5mb0VudHJpZXMoKSB7XG4gICAgICAgIHJldHVybiBuZXcgTWFwKHRpbWVJbmZvKTtcbiAgICAgIH0sXG4gICAgICBnZXRDb250ZXh0VGltZUluZm9FbnRyaWVzKCkge1xuICAgICAgICByZXR1cm4gbmV3IE1hcCh0aW1lSW5mbyk7XG4gICAgICB9LFxuICAgIH07XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIEJ1aWxkZXJXYXRjaFBsdWdpbiB7XG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgcmVhZG9ubHkgd2F0Y2hlckZhY3Rvcnk6IEJ1aWxkZXJXYXRjaGVyRmFjdG9yeSkge31cblxuICBhcHBseShjb21waWxlcjogQ29tcGlsZXIpOiB2b2lkIHtcbiAgICBjb21waWxlci5ob29rcy5lbnZpcm9ubWVudC50YXAoJ0J1aWxkZXJXYXRjaFBsdWdpbicsICgpID0+IHtcbiAgICAgIGNvbXBpbGVyLndhdGNoRmlsZVN5c3RlbSA9IG5ldyBCdWlsZGVyV2F0Y2hGaWxlU3lzdGVtKFxuICAgICAgICB0aGlzLndhdGNoZXJGYWN0b3J5LFxuICAgICAgICBjb21waWxlci5pbnB1dEZpbGVTeXN0ZW0sXG4gICAgICApO1xuICAgIH0pO1xuICB9XG59XG4iXX0=