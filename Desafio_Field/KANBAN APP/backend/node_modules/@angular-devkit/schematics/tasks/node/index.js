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
exports.BuiltinTaskExecutor = void 0;
const options_1 = require("../package-manager/options");
const options_2 = require("../repo-init/options");
const options_3 = require("../run-schematic/options");
class BuiltinTaskExecutor {
}
BuiltinTaskExecutor.NodePackage = {
    name: options_1.NodePackageName,
    create: (options) => Promise.resolve().then(() => __importStar(require('../package-manager/executor'))).then((mod) => mod.default(options)),
};
BuiltinTaskExecutor.RepositoryInitializer = {
    name: options_2.RepositoryInitializerName,
    create: (options) => Promise.resolve().then(() => __importStar(require('../repo-init/executor'))).then((mod) => mod.default(options)),
};
BuiltinTaskExecutor.RunSchematic = {
    name: options_3.RunSchematicName,
    create: () => Promise.resolve().then(() => __importStar(require('../run-schematic/executor'))).then((mod) => mod.default()),
};
exports.BuiltinTaskExecutor = BuiltinTaskExecutor;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9hbmd1bGFyX2RldmtpdC9zY2hlbWF0aWNzL3Rhc2tzL25vZGUvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFHSCx3REFBNEY7QUFDNUYsa0RBRzhCO0FBQzlCLHNEQUE0RDtBQUU1RCxNQUFhLG1CQUFtQjs7QUFDZCwrQkFBVyxHQUF1RDtJQUNoRixJQUFJLEVBQUUseUJBQWU7SUFDckIsTUFBTSxFQUFFLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FDbEIsa0RBQU8sNkJBQTZCLElBQUUsSUFBSSxDQUFDLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUV2RTtDQUNKLENBQUM7QUFDYyx5Q0FBcUIsR0FDbkM7SUFDRSxJQUFJLEVBQUUsbUNBQXlCO0lBQy9CLE1BQU0sRUFBRSxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUMsa0RBQU8sdUJBQXVCLElBQUUsSUFBSSxDQUFDLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0NBQ3pGLENBQUM7QUFDWSxnQ0FBWSxHQUE0QjtJQUN0RCxJQUFJLEVBQUUsMEJBQWdCO0lBQ3RCLE1BQU0sRUFBRSxHQUFHLEVBQUUsQ0FDWCxrREFBTywyQkFBMkIsSUFBRSxJQUFJLENBQUMsQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsQ0FBOEI7Q0FDaEcsQ0FBQztBQWpCUyxrREFBbUIiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHsgVGFza0V4ZWN1dG9yLCBUYXNrRXhlY3V0b3JGYWN0b3J5IH0gZnJvbSAnLi4vLi4vc3JjJztcbmltcG9ydCB7IE5vZGVQYWNrYWdlTmFtZSwgTm9kZVBhY2thZ2VUYXNrRmFjdG9yeU9wdGlvbnMgfSBmcm9tICcuLi9wYWNrYWdlLW1hbmFnZXIvb3B0aW9ucyc7XG5pbXBvcnQge1xuICBSZXBvc2l0b3J5SW5pdGlhbGl6ZXJOYW1lLFxuICBSZXBvc2l0b3J5SW5pdGlhbGl6ZXJUYXNrRmFjdG9yeU9wdGlvbnMsXG59IGZyb20gJy4uL3JlcG8taW5pdC9vcHRpb25zJztcbmltcG9ydCB7IFJ1blNjaGVtYXRpY05hbWUgfSBmcm9tICcuLi9ydW4tc2NoZW1hdGljL29wdGlvbnMnO1xuXG5leHBvcnQgY2xhc3MgQnVpbHRpblRhc2tFeGVjdXRvciB7XG4gIHN0YXRpYyByZWFkb25seSBOb2RlUGFja2FnZTogVGFza0V4ZWN1dG9yRmFjdG9yeTxOb2RlUGFja2FnZVRhc2tGYWN0b3J5T3B0aW9ucz4gPSB7XG4gICAgbmFtZTogTm9kZVBhY2thZ2VOYW1lLFxuICAgIGNyZWF0ZTogKG9wdGlvbnMpID0+XG4gICAgICBpbXBvcnQoJy4uL3BhY2thZ2UtbWFuYWdlci9leGVjdXRvcicpLnRoZW4oKG1vZCkgPT4gbW9kLmRlZmF1bHQob3B0aW9ucykpIGFzIFByb21pc2U8XG4gICAgICAgIFRhc2tFeGVjdXRvcjx7fT5cbiAgICAgID4sXG4gIH07XG4gIHN0YXRpYyByZWFkb25seSBSZXBvc2l0b3J5SW5pdGlhbGl6ZXI6IFRhc2tFeGVjdXRvckZhY3Rvcnk8UmVwb3NpdG9yeUluaXRpYWxpemVyVGFza0ZhY3RvcnlPcHRpb25zPiA9XG4gICAge1xuICAgICAgbmFtZTogUmVwb3NpdG9yeUluaXRpYWxpemVyTmFtZSxcbiAgICAgIGNyZWF0ZTogKG9wdGlvbnMpID0+IGltcG9ydCgnLi4vcmVwby1pbml0L2V4ZWN1dG9yJykudGhlbigobW9kKSA9PiBtb2QuZGVmYXVsdChvcHRpb25zKSksXG4gICAgfTtcbiAgc3RhdGljIHJlYWRvbmx5IFJ1blNjaGVtYXRpYzogVGFza0V4ZWN1dG9yRmFjdG9yeTx7fT4gPSB7XG4gICAgbmFtZTogUnVuU2NoZW1hdGljTmFtZSxcbiAgICBjcmVhdGU6ICgpID0+XG4gICAgICBpbXBvcnQoJy4uL3J1bi1zY2hlbWF0aWMvZXhlY3V0b3InKS50aGVuKChtb2QpID0+IG1vZC5kZWZhdWx0KCkpIGFzIFByb21pc2U8VGFza0V4ZWN1dG9yPHt9Pj4sXG4gIH07XG59XG4iXX0=