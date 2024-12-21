export declare class LegacyRouteConverter {
    private static readonly logger;
    /**
     * Convert legacy routes to the new format (syntax).
     * path-to-regexp used by Express>=v5 and @fastify/middie>=v9 no longer support unnamed wildcards.
     * This method attempts to convert the old syntax to the new one, and logs an error if it fails.
     * @param route The route to convert.
     * @returns The converted route, or the original route if it cannot be converted.
     */
    static tryConvert(route: string): string;
    static printError(route: string): void;
    static printWarning(route: string): void;
}
