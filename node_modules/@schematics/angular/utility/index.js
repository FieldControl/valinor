"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.addDependency = exports.InstallBehavior = exports.ExistingBehavior = exports.DependencyType = exports.AngularBuilder = exports.writeWorkspace = exports.updateWorkspace = exports.readWorkspace = void 0;
// Workspace related rules and types
var workspace_1 = require("./workspace");
Object.defineProperty(exports, "readWorkspace", { enumerable: true, get: function () { return workspace_1.getWorkspace; } });
Object.defineProperty(exports, "updateWorkspace", { enumerable: true, get: function () { return workspace_1.updateWorkspace; } });
Object.defineProperty(exports, "writeWorkspace", { enumerable: true, get: function () { return workspace_1.writeWorkspace; } });
var workspace_models_1 = require("./workspace-models");
Object.defineProperty(exports, "AngularBuilder", { enumerable: true, get: function () { return workspace_models_1.Builders; } });
// Package dependency related rules and types
var dependency_1 = require("./dependency");
Object.defineProperty(exports, "DependencyType", { enumerable: true, get: function () { return dependency_1.DependencyType; } });
Object.defineProperty(exports, "ExistingBehavior", { enumerable: true, get: function () { return dependency_1.ExistingBehavior; } });
Object.defineProperty(exports, "InstallBehavior", { enumerable: true, get: function () { return dependency_1.InstallBehavior; } });
Object.defineProperty(exports, "addDependency", { enumerable: true, get: function () { return dependency_1.addDependency; } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9zY2hlbWF0aWNzL2FuZ3VsYXIvdXRpbGl0eS9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7OztHQU1HOzs7QUFFSCxvQ0FBb0M7QUFDcEMseUNBT3FCO0FBSG5CLDBHQUFBLFlBQVksT0FBaUI7QUFDN0IsNEdBQUEsZUFBZSxPQUFBO0FBQ2YsMkdBQUEsY0FBYyxPQUFBO0FBRWhCLHVEQUFnRTtBQUF2RCxrSEFBQSxRQUFRLE9BQWtCO0FBRW5DLDZDQUE2QztBQUM3QywyQ0FBZ0c7QUFBdkYsNEdBQUEsY0FBYyxPQUFBO0FBQUUsOEdBQUEsZ0JBQWdCLE9BQUE7QUFBRSw2R0FBQSxlQUFlLE9BQUE7QUFBRSwyR0FBQSxhQUFhLE9BQUEiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuLy8gV29ya3NwYWNlIHJlbGF0ZWQgcnVsZXMgYW5kIHR5cGVzXG5leHBvcnQge1xuICBQcm9qZWN0RGVmaW5pdGlvbixcbiAgVGFyZ2V0RGVmaW5pdGlvbixcbiAgV29ya3NwYWNlRGVmaW5pdGlvbixcbiAgZ2V0V29ya3NwYWNlIGFzIHJlYWRXb3Jrc3BhY2UsXG4gIHVwZGF0ZVdvcmtzcGFjZSxcbiAgd3JpdGVXb3Jrc3BhY2UsXG59IGZyb20gJy4vd29ya3NwYWNlJztcbmV4cG9ydCB7IEJ1aWxkZXJzIGFzIEFuZ3VsYXJCdWlsZGVyIH0gZnJvbSAnLi93b3Jrc3BhY2UtbW9kZWxzJztcblxuLy8gUGFja2FnZSBkZXBlbmRlbmN5IHJlbGF0ZWQgcnVsZXMgYW5kIHR5cGVzXG5leHBvcnQgeyBEZXBlbmRlbmN5VHlwZSwgRXhpc3RpbmdCZWhhdmlvciwgSW5zdGFsbEJlaGF2aW9yLCBhZGREZXBlbmRlbmN5IH0gZnJvbSAnLi9kZXBlbmRlbmN5JztcbiJdfQ==