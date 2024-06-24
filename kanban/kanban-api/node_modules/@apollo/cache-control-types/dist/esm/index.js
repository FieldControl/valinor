export function maybeCacheControlFromInfo(info) {
    if (info.cacheControl?.cacheHint?.restrict) {
        return info.cacheControl;
    }
    return null;
}
export function cacheControlFromInfo(info) {
    if (!('cacheControl' in info)) {
        throw new Error('The `info` argument does not appear to have a cacheControl field. ' +
            "Check that you are using Apollo Server 3 or newer and that you aren't using " +
            'ApolloServerPluginCacheControlDisabled.');
    }
    if (!info.cacheControl?.cacheHint?.restrict) {
        throw new Error('The `info` argument has a cacheControl field but it does not appear to be from Apollo' +
            "Server 3 or newer. Check that you are using Apollo Server 3 or newer and that you aren't using " +
            'ApolloServerPluginCacheControlDisabled.');
    }
    return info.cacheControl;
}
//# sourceMappingURL=index.js.map