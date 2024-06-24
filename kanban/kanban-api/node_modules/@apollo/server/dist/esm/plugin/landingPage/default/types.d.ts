type InitialDocumentVariablesHeaders = {
    document?: string;
    variables?: Record<string, any>;
    headers?: Record<string, string>;
    collectionId?: never;
    operationId?: never;
};
type InitialStateForEmbeds = {
    collectionId: string;
    operationId: string;
    document?: never;
    variables?: never;
    headers?: never;
} | InitialDocumentVariablesHeaders;
export type ApolloServerPluginLandingPageDefaultBaseOptions = {
    version?: string;
    footer?: boolean;
    includeCookies?: boolean;
    precomputedNonce?: string;
    __internal_apolloStudioEnv__?: 'staging' | 'prod';
};
export type ApolloServerPluginNonEmbeddedLandingPageLocalDefaultOptions = ApolloServerPluginLandingPageDefaultBaseOptions & InitialDocumentVariablesHeaders & {
    embed: false;
};
export type ApolloServerPluginNonEmbeddedLandingPageProductionDefaultOptions = ApolloServerPluginLandingPageDefaultBaseOptions & InitialDocumentVariablesHeaders & {
    graphRef?: string;
    embed?: false;
};
export type ApolloServerPluginEmbeddedLandingPageLocalDefaultOptions = ApolloServerPluginLandingPageDefaultBaseOptions & {
    embed?: true | EmbeddableSandboxOptions;
} & (InitialDocumentVariablesHeaders | InitialStateForEmbeds);
export type ApolloServerPluginEmbeddedLandingPageProductionDefaultOptions = ApolloServerPluginLandingPageDefaultBaseOptions & {
    graphRef: string;
    embed: true | EmbeddableExplorerOptions;
} & InitialStateForEmbeds;
type EmbeddableSandboxOptions = {
    runTelemetry?: boolean;
    initialState?: {
        pollForSchemaUpdates?: boolean;
        sharedHeaders?: Record<string, string>;
    };
    endpointIsEditable?: boolean;
};
type EmbeddableExplorerOptions = {
    runTelemetry?: boolean;
    displayOptions?: {
        showHeadersAndEnvVars: boolean;
        docsPanelState: 'open' | 'closed';
        theme: 'light' | 'dark';
    };
    persistExplorerState?: boolean;
};
export type ApolloServerPluginLandingPageLocalDefaultOptions = ApolloServerPluginEmbeddedLandingPageLocalDefaultOptions | ApolloServerPluginNonEmbeddedLandingPageLocalDefaultOptions;
export type ApolloServerPluginLandingPageProductionDefaultOptions = ApolloServerPluginEmbeddedLandingPageProductionDefaultOptions | ApolloServerPluginNonEmbeddedLandingPageProductionDefaultOptions;
export type LandingPageConfig = ApolloServerPluginLandingPageLocalDefaultOptions | ApolloServerPluginLandingPageProductionDefaultOptions;
export {};
//# sourceMappingURL=types.d.ts.map