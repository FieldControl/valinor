"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApolloServerPluginUsageReportingDisabled = exports.ApolloServerPluginSchemaReportingDisabled = exports.ApolloServerPluginLandingPageDisabled = exports.ApolloServerPluginInlineTraceDisabled = exports.ApolloServerPluginCacheControlDisabled = void 0;
function disabledPlugin(id) {
    const plugin = {
        __internal_plugin_id__: id,
        __is_disabled_plugin__: true,
    };
    return plugin;
}
function ApolloServerPluginCacheControlDisabled() {
    return disabledPlugin('CacheControl');
}
exports.ApolloServerPluginCacheControlDisabled = ApolloServerPluginCacheControlDisabled;
function ApolloServerPluginInlineTraceDisabled() {
    return disabledPlugin('InlineTrace');
}
exports.ApolloServerPluginInlineTraceDisabled = ApolloServerPluginInlineTraceDisabled;
function ApolloServerPluginLandingPageDisabled() {
    return disabledPlugin('LandingPageDisabled');
}
exports.ApolloServerPluginLandingPageDisabled = ApolloServerPluginLandingPageDisabled;
function ApolloServerPluginSchemaReportingDisabled() {
    return disabledPlugin('SchemaReporting');
}
exports.ApolloServerPluginSchemaReportingDisabled = ApolloServerPluginSchemaReportingDisabled;
function ApolloServerPluginUsageReportingDisabled() {
    return disabledPlugin('UsageReporting');
}
exports.ApolloServerPluginUsageReportingDisabled = ApolloServerPluginUsageReportingDisabled;
//# sourceMappingURL=index.js.map