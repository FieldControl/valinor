import LRUCache from 'lru-cache';
export function createOperationDerivedDataCache({ logger, }) {
    let lastWarn;
    let lastDisposals = 0;
    return new LRUCache({
        sizeCalculation(obj) {
            return Buffer.byteLength(JSON.stringify(obj), 'utf8');
        },
        maxSize: Math.pow(2, 20) * 10,
        dispose() {
            lastDisposals++;
            if (!lastWarn || new Date().getTime() - lastWarn.getTime() > 60000) {
                lastWarn = new Date();
                logger.warn([
                    'This server is processing a high number of unique operations.  ',
                    `A total of ${lastDisposals} records have been `,
                    'ejected from the ApolloServerPluginUsageReporting signature cache in the past ',
                    'interval.  If you see this warning frequently, please open an ',
                    'issue on the Apollo Server repository.',
                ].join(''));
                lastDisposals = 0;
            }
        },
    });
}
export function operationDerivedDataCacheKey(queryHash, operationName) {
    return `${queryHash}${operationName && ':' + operationName}`;
}
//# sourceMappingURL=operationDerivedDataCache.js.map