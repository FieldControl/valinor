import { renderPlaygroundPage } from '@apollographql/graphql-playground-html';
const defaultPlaygroundVersion = '1.7.42';
export function ApolloServerPluginLandingPageGraphQLPlayground(options = Object.create(null)) {
    return {
        async serverWillStart() {
            return {
                async renderLandingPage() {
                    return {
                        html: renderPlaygroundPage({
                            version: defaultPlaygroundVersion,
                            ...options,
                        }),
                    };
                },
            };
        },
    };
}
//# sourceMappingURL=index.js.map