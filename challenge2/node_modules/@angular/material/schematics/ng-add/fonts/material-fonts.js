"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addFontsToIndex = void 0;
const schematics_1 = require("@angular-devkit/schematics");
const schematics_2 = require("@angular/cdk/schematics");
const workspace_1 = require("@schematics/angular/utility/workspace");
/** Adds the Material Design fonts to the index HTML file. */
function addFontsToIndex(options) {
    return (host) => __awaiter(this, void 0, void 0, function* () {
        const workspace = yield workspace_1.getWorkspace(host);
        const project = schematics_2.getProjectFromWorkspace(workspace, options.project);
        const projectIndexFiles = schematics_2.getProjectIndexFiles(project);
        if (!projectIndexFiles.length) {
            throw new schematics_1.SchematicsException('No project index HTML file could be found.');
        }
        const preconnect = `<link rel="preconnect" href="https://fonts.gstatic.com">`;
        const fonts = [
            'https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500&display=swap',
            'https://fonts.googleapis.com/icon?family=Material+Icons',
        ];
        projectIndexFiles.forEach(indexFilePath => {
            schematics_2.appendHtmlElementToHead(host, indexFilePath, preconnect);
            fonts.forEach(font => {
                schematics_2.appendHtmlElementToHead(host, indexFilePath, `<link href="${font}" rel="stylesheet">`);
            });
        });
    });
}
exports.addFontsToIndex = addFontsToIndex;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWF0ZXJpYWwtZm9udHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvbWF0ZXJpYWwvc2NoZW1hdGljcy9uZy1hZGQvZm9udHMvbWF0ZXJpYWwtZm9udHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7O0FBRUgsMkRBQTJFO0FBQzNFLHdEQUlpQztBQUNqQyxxRUFBbUU7QUFHbkUsNkRBQTZEO0FBQzdELFNBQWdCLGVBQWUsQ0FBQyxPQUFlO0lBQzdDLE9BQU8sQ0FBTyxJQUFVLEVBQUUsRUFBRTtRQUMxQixNQUFNLFNBQVMsR0FBRyxNQUFNLHdCQUFZLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDM0MsTUFBTSxPQUFPLEdBQUcsb0NBQXVCLENBQUMsU0FBUyxFQUFFLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUNwRSxNQUFNLGlCQUFpQixHQUFHLGlDQUFvQixDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBRXhELElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxNQUFNLEVBQUU7WUFDN0IsTUFBTSxJQUFJLGdDQUFtQixDQUFDLDRDQUE0QyxDQUFDLENBQUM7U0FDN0U7UUFFRCxNQUFNLFVBQVUsR0FBRywwREFBMEQsQ0FBQztRQUM5RSxNQUFNLEtBQUssR0FBRztZQUNaLCtFQUErRTtZQUMvRSx5REFBeUQ7U0FDMUQsQ0FBQztRQUVGLGlCQUFpQixDQUFDLE9BQU8sQ0FBQyxhQUFhLENBQUMsRUFBRTtZQUN4QyxvQ0FBdUIsQ0FBQyxJQUFJLEVBQUUsYUFBYSxFQUFFLFVBQVUsQ0FBQyxDQUFDO1lBRXpELEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUU7Z0JBQ25CLG9DQUF1QixDQUFDLElBQUksRUFBRSxhQUFhLEVBQUUsZUFBZSxJQUFJLHFCQUFxQixDQUFDLENBQUM7WUFDekYsQ0FBQyxDQUFDLENBQUM7UUFDTCxDQUFDLENBQUMsQ0FBQztJQUNMLENBQUMsQ0FBQSxDQUFDO0FBQ0osQ0FBQztBQXhCRCwwQ0F3QkMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtSdWxlLCBTY2hlbWF0aWNzRXhjZXB0aW9uLCBUcmVlfSBmcm9tICdAYW5ndWxhci1kZXZraXQvc2NoZW1hdGljcyc7XG5pbXBvcnQge1xuICBhcHBlbmRIdG1sRWxlbWVudFRvSGVhZCxcbiAgZ2V0UHJvamVjdEZyb21Xb3Jrc3BhY2UsXG4gIGdldFByb2plY3RJbmRleEZpbGVzLFxufSBmcm9tICdAYW5ndWxhci9jZGsvc2NoZW1hdGljcyc7XG5pbXBvcnQge2dldFdvcmtzcGFjZX0gZnJvbSAnQHNjaGVtYXRpY3MvYW5ndWxhci91dGlsaXR5L3dvcmtzcGFjZSc7XG5pbXBvcnQge1NjaGVtYX0gZnJvbSAnLi4vc2NoZW1hJztcblxuLyoqIEFkZHMgdGhlIE1hdGVyaWFsIERlc2lnbiBmb250cyB0byB0aGUgaW5kZXggSFRNTCBmaWxlLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFkZEZvbnRzVG9JbmRleChvcHRpb25zOiBTY2hlbWEpOiBSdWxlIHtcbiAgcmV0dXJuIGFzeW5jIChob3N0OiBUcmVlKSA9PiB7XG4gICAgY29uc3Qgd29ya3NwYWNlID0gYXdhaXQgZ2V0V29ya3NwYWNlKGhvc3QpO1xuICAgIGNvbnN0IHByb2plY3QgPSBnZXRQcm9qZWN0RnJvbVdvcmtzcGFjZSh3b3Jrc3BhY2UsIG9wdGlvbnMucHJvamVjdCk7XG4gICAgY29uc3QgcHJvamVjdEluZGV4RmlsZXMgPSBnZXRQcm9qZWN0SW5kZXhGaWxlcyhwcm9qZWN0KTtcblxuICAgIGlmICghcHJvamVjdEluZGV4RmlsZXMubGVuZ3RoKSB7XG4gICAgICB0aHJvdyBuZXcgU2NoZW1hdGljc0V4Y2VwdGlvbignTm8gcHJvamVjdCBpbmRleCBIVE1MIGZpbGUgY291bGQgYmUgZm91bmQuJyk7XG4gICAgfVxuXG4gICAgY29uc3QgcHJlY29ubmVjdCA9IGA8bGluayByZWw9XCJwcmVjb25uZWN0XCIgaHJlZj1cImh0dHBzOi8vZm9udHMuZ3N0YXRpYy5jb21cIj5gO1xuICAgIGNvbnN0IGZvbnRzID0gW1xuICAgICAgJ2h0dHBzOi8vZm9udHMuZ29vZ2xlYXBpcy5jb20vY3NzMj9mYW1pbHk9Um9ib3RvOndnaHRAMzAwOzQwMDs1MDAmZGlzcGxheT1zd2FwJyxcbiAgICAgICdodHRwczovL2ZvbnRzLmdvb2dsZWFwaXMuY29tL2ljb24/ZmFtaWx5PU1hdGVyaWFsK0ljb25zJyxcbiAgICBdO1xuXG4gICAgcHJvamVjdEluZGV4RmlsZXMuZm9yRWFjaChpbmRleEZpbGVQYXRoID0+IHtcbiAgICAgIGFwcGVuZEh0bWxFbGVtZW50VG9IZWFkKGhvc3QsIGluZGV4RmlsZVBhdGgsIHByZWNvbm5lY3QpO1xuXG4gICAgICBmb250cy5mb3JFYWNoKGZvbnQgPT4ge1xuICAgICAgICBhcHBlbmRIdG1sRWxlbWVudFRvSGVhZChob3N0LCBpbmRleEZpbGVQYXRoLCBgPGxpbmsgaHJlZj1cIiR7Zm9udH1cIiByZWw9XCJzdHlsZXNoZWV0XCI+YCk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfTtcbn1cbiJdfQ==