import { AbortController } from 'node-abort-controller';
import { Stopper } from './stoppable.js';
export function ApolloServerPluginDrainHttpServer(options) {
    const stopper = new Stopper(options.httpServer);
    return {
        async serverWillStart() {
            return {
                async drainServer() {
                    const hardDestroyAbortController = new AbortController();
                    const stopGracePeriodMillis = options.stopGracePeriodMillis ?? 10000;
                    let timeout;
                    if (stopGracePeriodMillis < Infinity) {
                        timeout = setTimeout(() => hardDestroyAbortController.abort(), stopGracePeriodMillis);
                    }
                    await stopper.stop(hardDestroyAbortController.signal);
                    if (timeout) {
                        clearTimeout(timeout);
                    }
                },
            };
        },
    };
}
//# sourceMappingURL=index.js.map