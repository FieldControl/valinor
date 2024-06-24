"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApolloServerPluginDrainHttpServer = void 0;
const node_abort_controller_1 = require("node-abort-controller");
const stoppable_js_1 = require("./stoppable.js");
function ApolloServerPluginDrainHttpServer(options) {
    const stopper = new stoppable_js_1.Stopper(options.httpServer);
    return {
        async serverWillStart() {
            return {
                async drainServer() {
                    const hardDestroyAbortController = new node_abort_controller_1.AbortController();
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
exports.ApolloServerPluginDrainHttpServer = ApolloServerPluginDrainHttpServer;
//# sourceMappingURL=index.js.map