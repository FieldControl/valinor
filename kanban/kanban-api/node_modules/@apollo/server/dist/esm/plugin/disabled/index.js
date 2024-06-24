function disabledPlugin(id) {
    const plugin = {
        __internal_plugin_id__: id,
        __is_disabled_plugin__: true,
    };
    return plugin;
}
export function ApolloServerPluginCacheControlDisabled() {
    return disabledPlugin('CacheControl');
}
export function ApolloServerPluginInlineTraceDisabled() {
    return disabledPlugin('InlineTrace');
}
export function ApolloServerPluginLandingPageDisabled() {
    return disabledPlugin('LandingPageDisabled');
}
export function ApolloServerPluginSchemaReportingDisabled() {
    return disabledPlugin('SchemaReporting');
}
export function ApolloServerPluginUsageReportingDisabled() {
    return disabledPlugin('UsageReporting');
}
//# sourceMappingURL=index.js.map