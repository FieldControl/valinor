import { HttpHeaders } from '@angular/common/http';
import { ApolloLink } from '@apollo/client/core';

const httpHeaders = () => {
    return new ApolloLink((operation, forward) => {
        const { getContext, setContext } = operation;
        const context = getContext();
        if (context.headers) {
            setContext({
                ...context,
                headers: new HttpHeaders(context.headers),
            });
        }
        return forward(operation);
    });
};

/**
 * Generated bundle index. Do not edit.
 */

export { httpHeaders };
//# sourceMappingURL=ngApolloLinkHeaders.mjs.map
