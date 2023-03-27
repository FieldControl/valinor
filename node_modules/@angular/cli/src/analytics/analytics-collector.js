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
exports.AnalyticsCollector = void 0;
const crypto_1 = require("crypto");
const https = __importStar(require("https"));
const os = __importStar(require("os"));
const querystring = __importStar(require("querystring"));
const semver = __importStar(require("semver"));
const environment_options_1 = require("../utilities/environment-options");
const error_1 = require("../utilities/error");
const version_1 = require("../utilities/version");
const analytics_parameters_1 = require("./analytics-parameters");
const TRACKING_ID_PROD = 'G-VETNJBW8L4';
const TRACKING_ID_STAGING = 'G-TBMPRL1BTM';
class AnalyticsCollector {
    constructor(context, userId) {
        this.context = context;
        const requestParameters = {
            [analytics_parameters_1.RequestParameter.ProtocolVersion]: 2,
            [analytics_parameters_1.RequestParameter.ClientId]: userId,
            [analytics_parameters_1.RequestParameter.UserId]: userId,
            [analytics_parameters_1.RequestParameter.TrackingId]: /^\d+\.\d+\.\d+$/.test(version_1.VERSION.full) && version_1.VERSION.full !== '0.0.0'
                ? TRACKING_ID_PROD
                : TRACKING_ID_STAGING,
            // Built-in user properties
            [analytics_parameters_1.RequestParameter.SessionId]: (0, crypto_1.randomUUID)(),
            [analytics_parameters_1.RequestParameter.UserAgentArchitecture]: os.arch(),
            [analytics_parameters_1.RequestParameter.UserAgentPlatform]: os.platform(),
            [analytics_parameters_1.RequestParameter.UserAgentPlatformVersion]: os.release(),
            [analytics_parameters_1.RequestParameter.SessionEngaged]: 1,
        };
        if (environment_options_1.ngDebug) {
            requestParameters[analytics_parameters_1.RequestParameter.DebugView] = 1;
        }
        this.requestParameterStringified = querystring.stringify(requestParameters);
        const parsedVersion = semver.parse(process.version);
        const packageManagerVersion = context.packageManager.version;
        this.userParameters = {
            // While architecture is being collect by GA as UserAgentArchitecture.
            // It doesn't look like there is a way to query this. Therefore we collect this as a custom user dimension too.
            [analytics_parameters_1.UserCustomDimension.OsArchitecture]: os.arch(),
            // While User ID is being collected by GA, this is not visible in reports/for filtering.
            [analytics_parameters_1.UserCustomDimension.UserId]: userId,
            [analytics_parameters_1.UserCustomDimension.NodeVersion]: parsedVersion
                ? `${parsedVersion.major}.${parsedVersion.minor}.${parsedVersion.patch}`
                : 'other',
            [analytics_parameters_1.UserCustomDimension.NodeMajorVersion]: parsedVersion === null || parsedVersion === void 0 ? void 0 : parsedVersion.major,
            [analytics_parameters_1.UserCustomDimension.PackageManager]: context.packageManager.name,
            [analytics_parameters_1.UserCustomDimension.PackageManagerVersion]: packageManagerVersion,
            [analytics_parameters_1.UserCustomDimension.PackageManagerMajorVersion]: packageManagerVersion
                ? +packageManagerVersion.split('.', 1)[0]
                : undefined,
            [analytics_parameters_1.UserCustomDimension.AngularCLIVersion]: version_1.VERSION.full,
            [analytics_parameters_1.UserCustomDimension.AngularCLIMajorVersion]: version_1.VERSION.major,
        };
    }
    reportWorkspaceInfoEvent(parameters) {
        this.event('workspace_info', parameters);
    }
    reportRebuildRunEvent(parameters) {
        this.event('run_rebuild', parameters);
    }
    reportBuildRunEvent(parameters) {
        this.event('run_build', parameters);
    }
    reportArchitectRunEvent(parameters) {
        this.event('run_architect', parameters);
    }
    reportSchematicRunEvent(parameters) {
        this.event('run_schematic', parameters);
    }
    reportCommandRunEvent(command) {
        this.event('run_command', { [analytics_parameters_1.EventCustomDimension.Command]: command });
    }
    event(eventName, parameters) {
        var _a;
        (_a = this.trackingEventsQueue) !== null && _a !== void 0 ? _a : (this.trackingEventsQueue = []);
        this.trackingEventsQueue.push({
            ...this.userParameters,
            ...parameters,
            'en': eventName,
        });
    }
    /**
     * Flush on an interval (if the event loop is waiting).
     *
     * @returns a method that when called will terminate the periodic
     * flush and call flush one last time.
     */
    periodFlush() {
        let analyticsFlushPromise = Promise.resolve();
        const analyticsFlushInterval = setInterval(() => {
            var _a;
            if ((_a = this.trackingEventsQueue) === null || _a === void 0 ? void 0 : _a.length) {
                analyticsFlushPromise = analyticsFlushPromise.then(() => this.flush());
            }
        }, 4000);
        return () => {
            clearInterval(analyticsFlushInterval);
            // Flush one last time.
            return analyticsFlushPromise.then(() => this.flush());
        };
    }
    async flush() {
        const pendingTrackingEvents = this.trackingEventsQueue;
        this.context.logger.debug(`Analytics flush size. ${pendingTrackingEvents === null || pendingTrackingEvents === void 0 ? void 0 : pendingTrackingEvents.length}.`);
        if (!(pendingTrackingEvents === null || pendingTrackingEvents === void 0 ? void 0 : pendingTrackingEvents.length)) {
            return;
        }
        // The below is needed so that if flush is called multiple times,
        // we don't report the same event multiple times.
        this.trackingEventsQueue = undefined;
        try {
            await this.send(pendingTrackingEvents);
        }
        catch (error) {
            // Failure to report analytics shouldn't crash the CLI.
            (0, error_1.assertIsError)(error);
            this.context.logger.debug(`Send analytics error. ${error.message}.`);
        }
    }
    async send(data) {
        return new Promise((resolve, reject) => {
            const request = https.request({
                host: 'www.google-analytics.com',
                method: 'POST',
                path: '/g/collect?' + this.requestParameterStringified,
            }, (response) => {
                if (response.statusCode !== 200 && response.statusCode !== 204) {
                    reject(new Error(`Analytics reporting failed with status code: ${response.statusCode}.`));
                }
                else {
                    resolve();
                }
            });
            request.on('error', reject);
            const queryParameters = data.map((p) => querystring.stringify(p)).join('\n');
            request.write(queryParameters);
            request.end();
        });
    }
}
exports.AnalyticsCollector = AnalyticsCollector;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5hbHl0aWNzLWNvbGxlY3Rvci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2FuZ3VsYXIvY2xpL3NyYy9hbmFseXRpY3MvYW5hbHl0aWNzLWNvbGxlY3Rvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUVILG1DQUFvQztBQUNwQyw2Q0FBK0I7QUFDL0IsdUNBQXlCO0FBQ3pCLHlEQUEyQztBQUMzQywrQ0FBaUM7QUFFakMsMEVBQTJEO0FBQzNELDhDQUFtRDtBQUNuRCxrREFBK0M7QUFDL0MsaUVBTWdDO0FBRWhDLE1BQU0sZ0JBQWdCLEdBQUcsY0FBYyxDQUFDO0FBQ3hDLE1BQU0sbUJBQW1CLEdBQUcsY0FBYyxDQUFDO0FBRTNDLE1BQWEsa0JBQWtCO0lBSzdCLFlBQW9CLE9BQXVCLEVBQUUsTUFBYztRQUF2QyxZQUFPLEdBQVAsT0FBTyxDQUFnQjtRQUN6QyxNQUFNLGlCQUFpQixHQUFzRDtZQUMzRSxDQUFDLHVDQUFnQixDQUFDLGVBQWUsQ0FBQyxFQUFFLENBQUM7WUFDckMsQ0FBQyx1Q0FBZ0IsQ0FBQyxRQUFRLENBQUMsRUFBRSxNQUFNO1lBQ25DLENBQUMsdUNBQWdCLENBQUMsTUFBTSxDQUFDLEVBQUUsTUFBTTtZQUNqQyxDQUFDLHVDQUFnQixDQUFDLFVBQVUsQ0FBQyxFQUMzQixpQkFBaUIsQ0FBQyxJQUFJLENBQUMsaUJBQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxpQkFBTyxDQUFDLElBQUksS0FBSyxPQUFPO2dCQUM5RCxDQUFDLENBQUMsZ0JBQWdCO2dCQUNsQixDQUFDLENBQUMsbUJBQW1CO1lBRXpCLDJCQUEyQjtZQUMzQixDQUFDLHVDQUFnQixDQUFDLFNBQVMsQ0FBQyxFQUFFLElBQUEsbUJBQVUsR0FBRTtZQUMxQyxDQUFDLHVDQUFnQixDQUFDLHFCQUFxQixDQUFDLEVBQUUsRUFB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VyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUM3RSxPQUFPLENBQUMsS0FBSyxDQUFDLGVBQWUsQ0FBQyxDQUFDO1lBQy9CLE9BQU8sQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUNoQixDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7Q0FDRjtBQW5LRCxnREFtS0MiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHsgcmFuZG9tVVVJRCB9IGZyb20gJ2NyeXB0byc7XG5pbXBvcnQgKiBhcyBodHRwcyBmcm9tICdodHRwcyc7XG5pbXBvcnQgKiBhcyBvcyBmcm9tICdvcyc7XG5pbXBvcnQgKiBhcyBxdWVyeXN0cmluZyBmcm9tICdxdWVyeXN0cmluZyc7XG5pbXBvcnQgKiBhcyBzZW12ZXIgZnJvbSAnc2VtdmVyJztcbmltcG9ydCB0eXBlIHsgQ29tbWFuZENvbnRleHQgfSBmcm9tICcuLi9jb21tYW5kLWJ1aWxkZXIvY29tbWFuZC1tb2R1bGUnO1xuaW1wb3J0IHsgbmdEZWJ1ZyB9IGZyb20gJy4uL3V0aWxpdGllcy9lbnZpcm9ubWVudC1vcHRpb25zJztcbmltcG9ydCB7IGFzc2VydElzRXJyb3IgfSBmcm9tICcuLi91dGlsaXRpZXMvZXJyb3InO1xuaW1wb3J0IHsgVkVSU0lPTiB9IGZyb20gJy4uL3V0aWxpdGllcy92ZXJzaW9uJztcbmltcG9ydCB7XG4gIEV2ZW50Q3VzdG9tRGltZW5zaW9uLFxuICBFdmVudEN1c3RvbU1ldHJpYyxcbiAgUHJpbWl0aXZlVHlwZXMsXG4gIFJlcXVlc3RQYXJhbWV0ZXIsXG4gIFVzZXJDdXN0b21EaW1lbnNpb24sXG59IGZyb20gJy4vYW5hbHl0aWNzLXBhcmFtZXRlcnMnO1xuXG5jb25zdCBUUkFDS0lOR19JRF9QUk9EID0gJ0ctVkVUTkpCVzhMNCc7XG5jb25zdCBUUkFDS0lOR19JRF9TVEFHSU5HID0gJ0ctVEJNUFJMMUJUTSc7XG5cbmV4cG9ydCBjbGFzcyBBbmFseXRpY3NDb2xsZWN0b3Ige1xuICBwcml2YXRlIHRyYWNraW5nRXZlbnRzUXVldWU6IFJlY29yZDxzdHJpbmcsIFByaW1pdGl2ZVR5cGVzIHwgdW5kZWZpbmVkPltdIHwgdW5kZWZpbmVkO1xuICBwcml2YXRlIHJlYWRvbmx5IHJlcXVlc3RQYXJhbWV0ZXJTdHJpbmdpZmllZDogc3RyaW5nO1xuICBwcml2YXRlIHJlYWRvbmx5IHVzZXJQYXJhbWV0ZXJzOiBSZWNvcmQ8VXNlckN1c3RvbURpbWVuc2lvbiwgUHJpbWl0aXZlVHlwZXMgfCB1bmRlZmluZWQ+O1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgY29udGV4dDogQ29tbWFuZENvbnRleHQsIHVzZXJJZDogc3RyaW5nKSB7XG4gICAgY29uc3QgcmVxdWVzdFBhcmFtZXRlcnM6IFBhcnRpYWw8UmVjb3JkPFJlcXVlc3RQYXJhbWV0ZXIsIFByaW1pdGl2ZVR5cGVzPj4gPSB7XG4gICAgICBbUmVxdWVzdFBhcmFtZXRlci5Qcm90b2NvbFZlcnNpb25dOiAyLFxuICAgICAgW1JlcXVlc3RQYXJhbWV0ZXIuQ2xpZW50SWRdOiB1c2VySWQsXG4gICAgICBbUmVxdWVzdFBhcmFtZXRlci5Vc2VySWRdOiB1c2VySWQsXG4gICAgICBbUmVxdWVzdFBhcmFtZXRlci5UcmFja2luZ0lkXTpcbiAgICAgICAgL15cXGQrXFwuXFxkK1xcLlxcZCskLy50ZXN0KFZFUlNJT04uZnVsbCkgJiYgVkVSU0lPTi5mdWxsICE9PSAnMC4wLjAnXG4gICAgICAgICAgPyBUUkFDS0lOR19JRF9QUk9EXG4gICAgICAgICAgOiBUUkFDS0lOR19JRF9TVEFHSU5HLFxuXG4gICAgICAvLyBCdWlsdC1pbiB1c2VyIHByb3BlcnRpZXNcbiAgICAgIFtSZXF1ZXN0UGFyYW1ldGVyLlNlc3Npb25JZF06IHJhbmRvbVVVSUQoKSxcbiAgICAgIFtSZXF1ZXN0UGFyYW1ldGVyLlVzZXJBZ2VudEFyY2hpdGVjdHVyZV06IG9zLmFyY2goKSxcbiAgICAgIFtSZXF1ZXN0UGFyYW1ldGVyLlVzZXJBZ2VudFBsYXRmb3JtXTogb3MucGxhdGZvcm0oKSxcbiAgICAgIFtSZXF1ZXN0UGFyYW1ldGVyLlVzZXJBZ2VudFBsYXRmb3JtVmVyc2lvbl06IG9zLnJlbGVhc2UoKSxcbiAgICAgIFtSZXF1ZXN0UGFyYW1ldGVyLlNlc3Npb25FbmdhZ2VkXTogMSxcbiAgICB9O1xuXG4gICAgaWYgKG5nRGVidWcpIHtcbiAgICAgIHJlcXVlc3RQYXJhbWV0ZXJzW1JlcXVlc3RQYXJhbWV0ZXIuRGVidWdWaWV3XSA9IDE7XG4gICAgfVxuXG4gICAgdGhpcy5yZXF1ZXN0UGFyYW1ldGVyU3RyaW5naWZpZWQgPSBxdWVyeXN0cmluZy5zdHJpbmdpZnkocmVxdWVzdFBhcmFtZXRlcnMpO1xuXG4gICAgY29uc3QgcGFyc2VkVmVyc2lvbiA9IHNlbXZlci5wYXJzZShwcm9jZXNzLnZlcnNpb24pO1xuICAgIGNvbnN0IHBhY2thZ2VNYW5hZ2VyVmVyc2lvbiA9IGNvbnRleHQucGFja2FnZU1hbmFnZXIudmVyc2lvbjtcblxuICAgIHRoaXMudXNlclBhcmFtZXRlcnMgPSB7XG4gICAgICAvLyBXaGlsZSBhcmNoaXRlY3R1cmUgaXMgYmVpbmcgY29sbGVjdCBieSBHQSBhcyBVc2VyQWdlbnRBcmNoaXRlY3R1cmUuXG4gICAgICAvLyBJdCBkb2Vzbid0IGxvb2sgbGlrZSB0aGVyZSBpcyBhIHdheSB0byBxdWVyeSB0aGlzLiBUaGVyZWZvcmUgd2UgY29sbGVjdCB0aGlzIGFzIGEgY3VzdG9tIHVzZXIgZGltZW5zaW9uIHRvby5cbiAgICAgIFtVc2VyQ3VzdG9tRGltZW5zaW9uLk9zQXJjaGl0ZWN0dXJlXTogb3MuYXJjaCgpLFxuICAgICAgLy8gV2hpbGUgVXNlciBJRCBpcyBiZWluZyBjb2xsZWN0ZWQgYnkgR0EsIHRoaXMgaXMgbm90IHZpc2libGUgaW4gcmVwb3J0cy9mb3IgZmlsdGVyaW5nLlxuICAgICAgW1VzZXJDdXN0b21EaW1lbnNpb24uVXNlcklkXTogdXNlcklkLFxuICAgICAgW1VzZXJDdXN0b21EaW1lbnNpb24uTm9kZVZlcnNpb25dOiBwYXJzZWRWZXJzaW9uXG4gICAgICAgID8gYCR7cGFyc2VkVmVyc2lvbi5tYWpvcn0uJHtwYXJzZWRWZXJzaW9uLm1pbm9yfS4ke3BhcnNlZFZlcnNpb24ucGF0Y2h9YFxuICAgICAgICA6ICdvdGhlcicsXG4gICAgICBbVXNlckN1c3RvbURpbWVuc2lvbi5Ob2RlTWFqb3JWZXJzaW9uXTogcGFyc2VkVmVyc2lvbj8ubWFqb3IsXG4gICAgICBbVXNlckN1c3RvbURpbWVuc2lvbi5QYWNrYWdlTWFuYWdlcl06IGNvbnRleHQucGFja2FnZU1hbmFnZXIubmFtZSxcbiAgICAgIFtVc2VyQ3VzdG9tRGltZW5zaW9uLlBhY2thZ2VNYW5hZ2VyVmVyc2lvbl06IHBhY2thZ2VNYW5hZ2VyVmVyc2lvbixcbiAgICAgIFtVc2VyQ3VzdG9tRGltZW5zaW9uLlBhY2thZ2VNYW5hZ2VyTWFqb3JWZXJzaW9uXTogcGFja2FnZU1hbmFnZXJWZXJzaW9uXG4gICAgICAgID8gK3BhY2thZ2VNYW5hZ2VyVmVyc2lvbi5zcGxpdCgnLicsIDEpWzBdXG4gICAgICAgIDogdW5kZWZpbmVkLFxuICAgICAgW1VzZXJDdXN0b21EaW1lbnNpb24uQW5ndWxhckNMSVZlcnNpb25dOiBWRVJTSU9OLmZ1bGwsXG4gICAgICBbVXNlckN1c3RvbURpbWVuc2lvbi5Bbmd1bGFyQ0xJTWFqb3JWZXJzaW9uXTogVkVSU0lPTi5tYWpvcixcbiAgICB9O1xuICB9XG5cbiAgcmVwb3J0V29ya3NwYWNlSW5mb0V2ZW50KFxuICAgIHBhcmFtZXRlcnM6IFBhcnRpYWw8UmVjb3JkPEV2ZW50Q3VzdG9tTWV0cmljLCBzdHJpbmcgfCBib29sZWFuIHwgbnVtYmVyIHwgdW5kZWZpbmVkPj4sXG4gICk6IHZvaWQge1xuICAgIHRoaXMuZXZlbnQoJ3dvcmtzcGFjZV9pbmZvJywgcGFyYW1ldGVycyk7XG4gIH1cblxuICByZXBvcnRSZWJ1aWxkUnVuRXZlbnQoXG4gICAgcGFyYW1ldGVyczogUGFydGlhbDxcbiAgICAgIFJlY29yZDxFdmVudEN1c3RvbU1ldHJpYyAmIEV2ZW50Q3VzdG9tRGltZW5zaW9uLCBzdHJpbmcgfCBib29sZWFuIHwgbnVtYmVyIHwgdW5kZWZpbmVkPlxuICAgID4sXG4gICk6IHZvaWQge1xuICAgIHRoaXMuZXZlbnQoJ3J1bl9yZWJ1aWxkJywgcGFyYW1ldGVycyk7XG4gIH1cblxuICByZXBvcnRCdWlsZFJ1bkV2ZW50KFxuICAgIHBhcmFtZXRlcnM6IFBhcnRpYWw8XG4gICAgICBSZWNvcmQ8RXZlbnRDdXN0b21NZXRyaWMgJiBFdmVudEN1c3RvbURpbWVuc2lvbiwgc3RyaW5nIHwgYm9vbGVhbiB8IG51bWJlciB8IHVuZGVmaW5lZD5cbiAgICA+LFxuICApOiB2b2lkIHtcbiAgICB0aGlzLmV2ZW50KCdydW5fYnVpbGQnLCBwYXJhbWV0ZXJzKTtcbiAgfVxuXG4gIHJlcG9ydEFyY2hpdGVjdFJ1bkV2ZW50KHBhcmFtZXRlcnM6IFBhcnRpYWw8UmVjb3JkPEV2ZW50Q3VzdG9tRGltZW5zaW9uLCBQcmltaXRpdmVUeXBlcz4+KTogdm9pZCB7XG4gICAgdGhpcy5ldmVudCgncnVuX2FyY2hpdGVjdCcsIHBhcmFtZXRlcnMpO1xuICB9XG5cbiAgcmVwb3J0U2NoZW1hdGljUnVuRXZlbnQocGFyYW1ldGVyczogUGFydGlhbDxSZWNvcmQ8RXZlbnRDdXN0b21EaW1lbnNpb24sIFByaW1pdGl2ZVR5cGVzPj4pOiB2b2lkIHtcbiAgICB0aGlzLmV2ZW50KCdydW5fc2NoZW1hdGljJywgcGFyYW1ldGVycyk7XG4gIH1cblxuICByZXBvcnRDb21tYW5kUnVuRXZlbnQoY29tbWFuZDogc3RyaW5nKTogdm9pZCB7XG4gICAgdGhpcy5ldmVudCgncnVuX2NvbW1hbmQnLCB7IFtFdmVudEN1c3RvbURpbWVuc2lvbi5Db21tYW5kXTogY29tbWFuZCB9KTtcbiAgfVxuXG4gIHByaXZhdGUgZXZlbnQoZXZlbnROYW1lOiBzdHJpbmcsIHBhcmFtZXRlcnM/OiBSZWNvcmQ8c3RyaW5nLCBQcmltaXRpdmVUeXBlcz4pOiB2b2lkIHtcbiAgICB0aGlzLnRyYWNraW5nRXZlbnRzUXVldWUgPz89IFtdO1xuICAgIHRoaXMudHJhY2tpbmdFdmVudHNRdWV1ZS5wdXNoKHtcbiAgICAgIC4uLnRoaXMudXNlclBhcmFtZXRlcnMsXG4gICAgICAuLi5wYXJhbWV0ZXJzLFxuICAgICAgJ2VuJzogZXZlbnROYW1lLFxuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEZsdXNoIG9uIGFuIGludGVydmFsIChpZiB0aGUgZXZlbnQgbG9vcCBpcyB3YWl0aW5nKS5cbiAgICpcbiAgICogQHJldHVybnMgYSBtZXRob2QgdGhhdCB3aGVuIGNhbGxlZCB3aWxsIHRlcm1pbmF0ZSB0aGUgcGVyaW9kaWNcbiAgICogZmx1c2ggYW5kIGNhbGwgZmx1c2ggb25lIGxhc3QgdGltZS5cbiAgICovXG4gIHBlcmlvZEZsdXNoKCk6ICgpID0+IFByb21pc2U8dm9pZD4ge1xuICAgIGxldCBhbmFseXRpY3NGbHVzaFByb21pc2UgPSBQcm9taXNlLnJlc29sdmUoKTtcbiAgICBjb25zdCBhbmFseXRpY3NGbHVzaEludGVydmFsID0gc2V0SW50ZXJ2YWwoKCkgPT4ge1xuICAgICAgaWYgKHRoaXMudHJhY2tpbmdFdmVudHNRdWV1ZT8ubGVuZ3RoKSB7XG4gICAgICAgIGFuYWx5dGljc0ZsdXNoUHJvbWlzZSA9IGFuYWx5dGljc0ZsdXNoUHJvbWlzZS50aGVuKCgpID0+IHRoaXMuZmx1c2goKSk7XG4gICAgICB9XG4gICAgfSwgNDAwMCk7XG5cbiAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgY2xlYXJJbnRlcnZhbChhbmFseXRpY3NGbHVzaEludGVydmFsKTtcblxuICAgICAgLy8gRmx1c2ggb25lIGxhc3QgdGltZS5cbiAgICAgIHJldHVybiBhbmFseXRpY3NGbHVzaFByb21pc2UudGhlbigoKSA9PiB0aGlzLmZsdXNoKCkpO1xuICAgIH07XG4gIH1cblxuICBhc3luYyBmbHVzaCgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCBwZW5kaW5nVHJhY2tpbmdFdmVudHMgPSB0aGlzLnRyYWNraW5nRXZlbnRzUXVldWU7XG4gICAgdGhpcy5jb250ZXh0LmxvZ2dlci5kZWJ1ZyhgQW5hbHl0aWNzIGZsdXNoIHNpemUuICR7cGVuZGluZ1RyYWNraW5nRXZlbnRzPy5sZW5ndGh9LmApO1xuXG4gICAgaWYgKCFwZW5kaW5nVHJhY2tpbmdFdmVudHM/Lmxlbmd0aCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIFRoZSBiZWxvdyBpcyBuZWVkZWQgc28gdGhhdCBpZiBmbHVzaCBpcyBjYWxsZWQgbXVsdGlwbGUgdGltZXMsXG4gICAgLy8gd2UgZG9uJ3QgcmVwb3J0IHRoZSBzYW1lIGV2ZW50IG11bHRpcGxlIHRpbWVzLlxuICAgIHRoaXMudHJhY2tpbmdFdmVudHNRdWV1ZSA9IHVuZGVmaW5lZDtcblxuICAgIHRyeSB7XG4gICAgICBhd2FpdCB0aGlzLnNlbmQocGVuZGluZ1RyYWNraW5nRXZlbnRzKTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgLy8gRmFpbHVyZSB0byByZXBvcnQgYW5hbHl0aWNzIHNob3VsZG4ndCBjcmFzaCB0aGUgQ0xJLlxuICAgICAgYXNzZXJ0SXNFcnJvcihlcnJvcik7XG4gICAgICB0aGlzLmNvbnRleHQubG9nZ2VyLmRlYnVnKGBTZW5kIGFuYWx5dGljcyBlcnJvci4gJHtlcnJvci5tZXNzYWdlfS5gKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGFzeW5jIHNlbmQoZGF0YTogUmVjb3JkPHN0cmluZywgUHJpbWl0aXZlVHlwZXMgfCB1bmRlZmluZWQ+W10pOiBQcm9taXNlPHZvaWQ+IHtcbiAgICByZXR1cm4gbmV3IFByb21pc2U8dm9pZD4oKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgY29uc3QgcmVxdWVzdCA9IGh0dHBzLnJlcXVlc3QoXG4gICAgICAgIHtcbiAgICAgICAgICBob3N0OiAnd3d3Lmdvb2dsZS1hbmFseXRpY3MuY29tJyxcbiAgICAgICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgICAgICBwYXRoOiAnL2cvY29sbGVjdD8nICsgdGhpcy5yZXF1ZXN0UGFyYW1ldGVyU3RyaW5naWZpZWQsXG4gICAgICAgIH0sXG4gICAgICAgIChyZXNwb25zZSkgPT4ge1xuICAgICAgICAgIGlmIChyZXNwb25zZS5zdGF0dXNDb2RlICE9PSAyMDAgJiYgcmVzcG9uc2Uuc3RhdHVzQ29kZSAhPT0gMjA0KSB7XG4gICAgICAgICAgICByZWplY3QoXG4gICAgICAgICAgICAgIG5ldyBFcnJvcihgQW5hbHl0aWNzIHJlcG9ydGluZyBmYWlsZWQgd2l0aCBzdGF0dXMgY29kZTogJHtyZXNwb25zZS5zdGF0dXNDb2RlfS5gKSxcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICApO1xuXG4gICAgICByZXF1ZXN0Lm9uKCdlcnJvcicsIHJlamVjdCk7XG4gICAgICBjb25zdCBxdWVyeVBhcmFtZXRlcnMgPSBkYXRhLm1hcCgocCkgPT4gcXVlcnlzdHJpbmcuc3RyaW5naWZ5KHApKS5qb2luKCdcXG4nKTtcbiAgICAgIHJlcXVlc3Qud3JpdGUocXVlcnlQYXJhbWV0ZXJzKTtcbiAgICAgIHJlcXVlc3QuZW5kKCk7XG4gICAgfSk7XG4gIH1cbn1cbiJdfQ==