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
const node_assert_1 = __importDefault(require("node:assert"));
const node_worker_threads_1 = require("node:worker_threads");
/**
 * The fully resolved path to the zone.js package that will be loaded during worker initialization.
 * This is passed as workerData when setting up the worker via the `piscina` package.
 */
const { zonePackage } = node_worker_threads_1.workerData;
/**
 * Renders an application based on a provided server bundle path, initial document, and optional URL route.
 * @param param0 A request to render a server bundle.
 * @returns A promise that resolves to the render HTML document for the application.
 */
async function render({ serverBundlePath, document, url }) {
    var _a;
    const { AppServerModule, renderModule, ɵSERVER_CONTEXT } = (await (_a = serverBundlePath, Promise.resolve().then(() => __importStar(require(_a)))));
    (0, node_assert_1.default)(renderModule, `renderModule was not exported from: ${serverBundlePath}.`);
    (0, node_assert_1.default)(AppServerModule, `AppServerModule was not exported from: ${serverBundlePath}.`);
    (0, node_assert_1.default)(ɵSERVER_CONTEXT, `ɵSERVER_CONTEXT was not exported from: ${serverBundlePath}.`);
    // Render platform server module
    const html = await renderModule(AppServerModule, {
        document,
        url,
        extraProviders: [
            {
                provide: ɵSERVER_CONTEXT,
                useValue: 'app-shell',
            },
        ],
    });
    return html;
}
/**
 * Initializes the worker when it is first created by loading the Zone.js package
 * into the worker instance.
 *
 * @returns A promise resolving to the render function of the worker.
 */
async function initialize() {
    var _a;
    // Setup Zone.js
    await (_a = zonePackage, Promise.resolve().then(() => __importStar(require(_a))));
    // Return the render function for use
    return render;
}
/**
 * The default export will be the promise returned by the initialize function.
 * This is awaited by piscina prior to using the Worker.
 */
exports.default = initialize();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVuZGVyLXdvcmtlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2FuZ3VsYXJfZGV2a2l0L2J1aWxkX2FuZ3VsYXIvc3JjL2J1aWxkZXJzL2FwcC1zaGVsbC9yZW5kZXItd29ya2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFJSCw4REFBaUM7QUFDakMsNkRBQWlEO0FBRWpEOzs7R0FHRztBQUNILE1BQU0sRUFBRSxXQUFXLEVBQUUsR0FBRyxnQ0FFdkIsQ0FBQztBQW9CRjs7OztHQUlHO0FBQ0gsS0FBSyxVQUFVLE1BQU0sQ0FBQyxFQUFFLGdCQUFnQixFQUFFLFFBQVEsRUFBRSxHQUFHLEVBQWlCOztJQUN0RSxNQUFNLEVBQUUsZUFBZSxFQUFFLFlBQVksRUFBRSxlQUFlLEVBQUUsR0FBRyxDQUFDLFlBQWEsZ0JBQWdCLDBEQUFDLENBSXpGLENBQUM7SUFFRixJQUFBLHFCQUFNLEVBQUMsWUFBWSxFQUFFLHVDQUF1QyxnQkFBZ0IsR0FBRyxDQUFDLENBQUM7SUFDakYsSUFBQSxxQkFBTSxFQUFDLGVBQWUsRUFBRSwwQ0FBMEMsZ0JBQWdCLEdBQUcsQ0FBQyxDQUFDO0lBQ3ZGLElBQUEscUJBQU0sRUFBQyxlQUFlLEVBQUUsMENBQTBDLGdCQUFnQixHQUFHLENBQUMsQ0FBQztJQUV2RixnQ0FBZ0M7SUFDaEMsTUFBTSxJQUFJLEdBQUcsTUFBTSxZQUFZLENBQUMsZUFBZSxFQUFFO1FBQy9DLFFBQVE7UUFDUixHQUFHO1FBQ0gsY0FBYyxFQUFFO1lBQ2Q7Z0JBQ0UsT0FBTyxFQUFFLGVBQWU7Z0JBQ3hCLFFBQVEsRUFBRSxXQUFXO2FBQ3RCO1NBQ0Y7S0FDRixDQUFDLENBQUM7SUFFSCxPQUFPLElBQUksQ0FBQztBQUNkLENBQUM7QUFFRDs7Ozs7R0FLRztBQUNILEtBQUssVUFBVSxVQUFVOztJQUN2QixnQkFBZ0I7SUFDaEIsWUFBYSxXQUFXLDBEQUFDLENBQUM7SUFFMUIscUNBQXFDO0lBQ3JDLE9BQU8sTUFBTSxDQUFDO0FBQ2hCLENBQUM7QUFFRDs7O0dBR0c7QUFDSCxrQkFBZSxVQUFVLEVBQUUsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQgdHlwZSB7IFR5cGUgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB0eXBlICogYXMgcGxhdGZvcm1TZXJ2ZXIgZnJvbSAnQGFuZ3VsYXIvcGxhdGZvcm0tc2VydmVyJztcbmltcG9ydCBhc3NlcnQgZnJvbSAnbm9kZTphc3NlcnQnO1xuaW1wb3J0IHsgd29ya2VyRGF0YSB9IGZyb20gJ25vZGU6d29ya2VyX3RocmVhZHMnO1xuXG4vKipcbiAqIFRoZSBmdWxseSByZXNvbHZlZCBwYXRoIHRvIHRoZSB6b25lLmpzIHBhY2thZ2UgdGhhdCB3aWxsIGJlIGxvYWRlZCBkdXJpbmcgd29ya2VyIGluaXRpYWxpemF0aW9uLlxuICogVGhpcyBpcyBwYXNzZWQgYXMgd29ya2VyRGF0YSB3aGVuIHNldHRpbmcgdXAgdGhlIHdvcmtlciB2aWEgdGhlIGBwaXNjaW5hYCBwYWNrYWdlLlxuICovXG5jb25zdCB7IHpvbmVQYWNrYWdlIH0gPSB3b3JrZXJEYXRhIGFzIHtcbiAgem9uZVBhY2thZ2U6IHN0cmluZztcbn07XG5cbi8qKlxuICogQSByZXF1ZXN0IHRvIHJlbmRlciBhIFNlcnZlciBidW5kbGUgZ2VuZXJhdGUgYnkgdGhlIHVuaXZlcnNhbCBzZXJ2ZXIgYnVpbGRlci5cbiAqL1xuaW50ZXJmYWNlIFJlbmRlclJlcXVlc3Qge1xuICAvKipcbiAgICogVGhlIHBhdGggdG8gdGhlIHNlcnZlciBidW5kbGUgdGhhdCBzaG91bGQgYmUgbG9hZGVkIGFuZCByZW5kZXJlZC5cbiAgICovXG4gIHNlcnZlckJ1bmRsZVBhdGg6IHN0cmluZztcbiAgLyoqXG4gICAqIFRoZSBleGlzdGluZyBIVE1MIGRvY3VtZW50IGFzIGEgc3RyaW5nIHRoYXQgd2lsbCBiZSBhdWdtZW50ZWQgd2l0aCB0aGUgcmVuZGVyZWQgYXBwbGljYXRpb24uXG4gICAqL1xuICBkb2N1bWVudDogc3RyaW5nO1xuICAvKipcbiAgICogQW4gb3B0aW9uYWwgVVJMIHBhdGggdGhhdCByZXByZXNlbnRzIHRoZSBBbmd1bGFyIHJvdXRlIHRoYXQgc2hvdWxkIGJlIHJlbmRlcmVkLlxuICAgKi9cbiAgdXJsOiBzdHJpbmcgfCB1bmRlZmluZWQ7XG59XG5cbi8qKlxuICogUmVuZGVycyBhbiBhcHBsaWNhdGlvbiBiYXNlZCBvbiBhIHByb3ZpZGVkIHNlcnZlciBidW5kbGUgcGF0aCwgaW5pdGlhbCBkb2N1bWVudCwgYW5kIG9wdGlvbmFsIFVSTCByb3V0ZS5cbiAqIEBwYXJhbSBwYXJhbTAgQSByZXF1ZXN0IHRvIHJlbmRlciBhIHNlcnZlciBidW5kbGUuXG4gKiBAcmV0dXJucyBBIHByb21pc2UgdGhhdCByZXNvbHZlcyB0byB0aGUgcmVuZGVyIEhUTUwgZG9jdW1lbnQgZm9yIHRoZSBhcHBsaWNhdGlvbi5cbiAqL1xuYXN5bmMgZnVuY3Rpb24gcmVuZGVyKHsgc2VydmVyQnVuZGxlUGF0aCwgZG9jdW1lbnQsIHVybCB9OiBSZW5kZXJSZXF1ZXN0KTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgY29uc3QgeyBBcHBTZXJ2ZXJNb2R1bGUsIHJlbmRlck1vZHVsZSwgybVTRVJWRVJfQ09OVEVYVCB9ID0gKGF3YWl0IGltcG9ydChzZXJ2ZXJCdW5kbGVQYXRoKSkgYXMge1xuICAgIHJlbmRlck1vZHVsZTogdHlwZW9mIHBsYXRmb3JtU2VydmVyLnJlbmRlck1vZHVsZSB8IHVuZGVmaW5lZDtcbiAgICDJtVNFUlZFUl9DT05URVhUOiB0eXBlb2YgcGxhdGZvcm1TZXJ2ZXIuybVTRVJWRVJfQ09OVEVYVCB8IHVuZGVmaW5lZDtcbiAgICBBcHBTZXJ2ZXJNb2R1bGU6IFR5cGU8dW5rbm93bj4gfCB1bmRlZmluZWQ7XG4gIH07XG5cbiAgYXNzZXJ0KHJlbmRlck1vZHVsZSwgYHJlbmRlck1vZHVsZSB3YXMgbm90IGV4cG9ydGVkIGZyb206ICR7c2VydmVyQnVuZGxlUGF0aH0uYCk7XG4gIGFzc2VydChBcHBTZXJ2ZXJNb2R1bGUsIGBBcHBTZXJ2ZXJNb2R1bGUgd2FzIG5vdCBleHBvcnRlZCBmcm9tOiAke3NlcnZlckJ1bmRsZVBhdGh9LmApO1xuICBhc3NlcnQoybVTRVJWRVJfQ09OVEVYVCwgYMm1U0VSVkVSX0NPTlRFWFQgd2FzIG5vdCBleHBvcnRlZCBmcm9tOiAke3NlcnZlckJ1bmRsZVBhdGh9LmApO1xuXG4gIC8vIFJlbmRlciBwbGF0Zm9ybSBzZXJ2ZXIgbW9kdWxlXG4gIGNvbnN0IGh0bWwgPSBhd2FpdCByZW5kZXJNb2R1bGUoQXBwU2VydmVyTW9kdWxlLCB7XG4gICAgZG9jdW1lbnQsXG4gICAgdXJsLFxuICAgIGV4dHJhUHJvdmlkZXJzOiBbXG4gICAgICB7XG4gICAgICAgIHByb3ZpZGU6IMm1U0VSVkVSX0NPTlRFWFQsXG4gICAgICAgIHVzZVZhbHVlOiAnYXBwLXNoZWxsJyxcbiAgICAgIH0sXG4gICAgXSxcbiAgfSk7XG5cbiAgcmV0dXJuIGh0bWw7XG59XG5cbi8qKlxuICogSW5pdGlhbGl6ZXMgdGhlIHdvcmtlciB3aGVuIGl0IGlzIGZpcnN0IGNyZWF0ZWQgYnkgbG9hZGluZyB0aGUgWm9uZS5qcyBwYWNrYWdlXG4gKiBpbnRvIHRoZSB3b3JrZXIgaW5zdGFuY2UuXG4gKlxuICogQHJldHVybnMgQSBwcm9taXNlIHJlc29sdmluZyB0byB0aGUgcmVuZGVyIGZ1bmN0aW9uIG9mIHRoZSB3b3JrZXIuXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIGluaXRpYWxpemUoKSB7XG4gIC8vIFNldHVwIFpvbmUuanNcbiAgYXdhaXQgaW1wb3J0KHpvbmVQYWNrYWdlKTtcblxuICAvLyBSZXR1cm4gdGhlIHJlbmRlciBmdW5jdGlvbiBmb3IgdXNlXG4gIHJldHVybiByZW5kZXI7XG59XG5cbi8qKlxuICogVGhlIGRlZmF1bHQgZXhwb3J0IHdpbGwgYmUgdGhlIHByb21pc2UgcmV0dXJuZWQgYnkgdGhlIGluaXRpYWxpemUgZnVuY3Rpb24uXG4gKiBUaGlzIGlzIGF3YWl0ZWQgYnkgcGlzY2luYSBwcmlvciB0byB1c2luZyB0aGUgV29ya2VyLlxuICovXG5leHBvcnQgZGVmYXVsdCBpbml0aWFsaXplKCk7XG4iXX0=