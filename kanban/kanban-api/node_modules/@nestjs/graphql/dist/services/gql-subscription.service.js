"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GqlSubscriptionService = void 0;
const graphql_1 = require("graphql");
const graphql_ws_1 = require("graphql-ws");
const ws_1 = require("graphql-ws/lib/use/ws");
const subscriptions_transport_ws_1 = require("subscriptions-transport-ws");
const ws = require("ws");
class GqlSubscriptionService {
    constructor(options, httpServer) {
        this.options = options;
        this.httpServer = httpServer;
        this.wss = new ws.Server({
            path: this.options['graphql-ws']?.path ??
                this.options.path,
            noServer: true,
        });
        this.subTransWs = new ws.Server({
            path: this.options['subscriptions-transport-ws']?.path ?? this.options.path,
            noServer: true,
        });
        this.initialize();
    }
    initialize() {
        const supportedProtocols = [];
        const { execute = graphql_1.execute, subscribe = graphql_1.subscribe } = this.options;
        if ('graphql-ws' in this.options) {
            const graphqlWsOptions = this.options['graphql-ws'] === true ? {} : this.options['graphql-ws'];
            supportedProtocols.push(graphql_ws_1.GRAPHQL_TRANSPORT_WS_PROTOCOL);
            this.wsGqlDisposable = (0, ws_1.useServer)({
                schema: this.options.schema,
                execute,
                subscribe,
                context: this.options.context,
                ...graphqlWsOptions,
            }, this.wss);
        }
        if ('subscriptions-transport-ws' in this.options) {
            const subscriptionsWsOptions = this.options['subscriptions-transport-ws'] === true
                ? {}
                : this.options['subscriptions-transport-ws'];
            supportedProtocols.push(subscriptions_transport_ws_1.GRAPHQL_WS);
            this.subServer = subscriptions_transport_ws_1.SubscriptionServer.create({
                schema: this.options.schema,
                execute,
                subscribe,
                ...subscriptionsWsOptions,
            }, this.subTransWs);
        }
        this.httpServer.on('upgrade', (req, socket, head) => {
            const protocol = req.headers['sec-websocket-protocol'];
            let protocols = Array.isArray(protocol)
                ? protocol
                : protocol?.split(',').map((p) => p.trim());
            protocols = protocols?.filter((protocol) => supportedProtocols.includes(protocol));
            const wss = protocols?.includes(subscriptions_transport_ws_1.GRAPHQL_WS) && // subscriptions-transport-ws subprotocol
                !protocols.includes(graphql_ws_1.GRAPHQL_TRANSPORT_WS_PROTOCOL) // graphql-ws subprotocol
                ? this.subTransWs
                : this.wss;
            if (req.url?.startsWith(wss.options.path)) {
                wss.handleUpgrade(req, socket, head, (ws) => {
                    wss.emit('connection', ws, req);
                });
            }
        });
    }
    async stop() {
        await this.wsGqlDisposable?.dispose();
        this.subServer?.close();
    }
}
exports.GqlSubscriptionService = GqlSubscriptionService;
