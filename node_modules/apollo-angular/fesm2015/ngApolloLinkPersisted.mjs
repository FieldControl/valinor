import { ApolloLink } from '@apollo/client/link/core';
import { setContext } from '@apollo/client/link/context';
import { createPersistedQueryLink as createPersistedQueryLink$1 } from '@apollo/client/link/persisted-queries';

const transformLink = setContext((_, context) => {
    const ctx = {};
    if (context.http) {
        ctx.includeQuery = context.http.includeQuery;
        ctx.includeExtensions = context.http.includeExtensions;
    }
    if (context.fetchOptions && context.fetchOptions.method) {
        ctx.method = context.fetchOptions.method;
    }
    return ctx;
});
const createPersistedQueryLink = (options) => ApolloLink.from([createPersistedQueryLink$1(options), transformLink]);

/**
 * Generated bundle index. Do not edit.
 */

export { createPersistedQueryLink };
//# sourceMappingURL=ngApolloLinkPersisted.mjs.map
