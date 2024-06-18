import { execute, } from 'graphql';
let graphqlExperimentalExecuteIncrementally = undefined;
async function tryToLoadGraphQL17() {
    if (graphqlExperimentalExecuteIncrementally !== undefined) {
        return;
    }
    const graphql = await import('graphql');
    if ('experimentalExecuteIncrementally' in graphql) {
        graphqlExperimentalExecuteIncrementally = graphql
            .experimentalExecuteIncrementally;
    }
    else {
        graphqlExperimentalExecuteIncrementally = null;
    }
}
export async function executeIncrementally(args) {
    await tryToLoadGraphQL17();
    if (graphqlExperimentalExecuteIncrementally) {
        return graphqlExperimentalExecuteIncrementally(args);
    }
    return execute(args);
}
//# sourceMappingURL=incrementalDeliveryPolyfill.js.map