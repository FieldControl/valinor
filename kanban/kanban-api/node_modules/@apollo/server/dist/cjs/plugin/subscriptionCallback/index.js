"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApolloServerPluginSubscriptionCallback = void 0;
const async_retry_1 = __importDefault(require("async-retry"));
const graphql_1 = require("graphql");
const node_fetch_1 = __importDefault(require("node-fetch"));
const errorNormalize_js_1 = require("../../errorNormalize.js");
const HeaderMap_js_1 = require("../../utils/HeaderMap.js");
function ApolloServerPluginSubscriptionCallback(options = Object.create(null)) {
    const subscriptionManager = new SubscriptionManager(options);
    const logger = options.logger
        ? prefixedLogger(options.logger, 'SubscriptionCallback')
        : undefined;
    return {
        async requestDidStart({ request }) {
            const subscriptionExtension = request?.extensions?.subscription;
            if (!subscriptionExtension)
                return;
            let { callbackUrl, subscriptionId: id, verifier, heartbeatIntervalMs, } = subscriptionExtension;
            callbackUrl = callbackUrl || subscriptionExtension.callback_url;
            id = id || subscriptionExtension.subscription_id;
            heartbeatIntervalMs =
                heartbeatIntervalMs ??
                    subscriptionExtension.heartbeat_interval_ms ??
                    5000;
            return {
                async responseForOperation() {
                    logger?.debug('Received new subscription request', id);
                    return {
                        http: {
                            status: 200,
                            headers: new HeaderMap_js_1.HeaderMap([['content-type', 'application/json']]),
                        },
                        body: {
                            kind: 'single',
                            singleResult: {
                                data: null,
                            },
                        },
                    };
                },
                async willSendResponse({ request, schema, document, contextValue, operationName, response, }) {
                    try {
                        await subscriptionManager.checkRequest({
                            callbackUrl,
                            id,
                            verifier,
                        });
                    }
                    catch (e) {
                        const graphqlError = (0, errorNormalize_js_1.ensureGraphQLError)(e);
                        logger?.error(`\`check\` request failed: ${graphqlError.message}`, id);
                        if (response.body.kind === 'single') {
                            response.body.singleResult.errors = [graphqlError];
                            response.http.status = 500;
                        }
                        return;
                    }
                    subscriptionManager.initHeartbeat({
                        callbackUrl,
                        id,
                        verifier,
                        heartbeatIntervalMs,
                    });
                    logger?.debug(`Starting graphql-js subscription`, id);
                    let subscription;
                    try {
                        subscription = await (0, graphql_1.subscribe)({
                            schema,
                            document: document,
                            variableValues: request.variables,
                            contextValue: contextValue,
                            operationName: operationName,
                        });
                    }
                    catch (e) {
                        const graphqlError = (0, errorNormalize_js_1.ensureGraphQLError)(e);
                        logger?.error(`Programming error: graphql-js subscribe() threw unexpectedly! Please report this bug to Apollo. The error was: ${e}`, id);
                        subscriptionManager.completeRequest({
                            errors: [graphqlError],
                            callbackUrl,
                            id,
                            verifier,
                        });
                        return;
                    }
                    if ('errors' in subscription) {
                        logger?.error(`graphql-js subscription unsuccessful: [\n\t${subscription.errors
                            ?.map((e) => e.message)
                            .join(',\n\t')}\n]`, id);
                        try {
                            subscriptionManager.completeRequest({
                                errors: subscription.errors,
                                callbackUrl,
                                id,
                                verifier,
                            });
                        }
                        catch (e) {
                            logger?.error(`\`complete\` request failed: ${e}`, id);
                        }
                    }
                    else if (isAsyncIterable(subscription)) {
                        logger?.debug('graphql-js subscription successful', id);
                        subscriptionManager.startConsumingSubscription({
                            subscription,
                            callbackUrl,
                            id,
                            verifier,
                        });
                    }
                    logger?.debug(`Responding to original subscription request`, id);
                },
            };
        },
        async serverWillStart() {
            return {
                async drainServer() {
                    logger?.debug('Server is shutting down. Cleaning up outstanding subscriptions and heartbeat intervals');
                    await subscriptionManager.cleanup();
                    logger?.debug('Successfully cleaned up outstanding subscriptions and heartbeat intervals.');
                },
            };
        },
    };
}
exports.ApolloServerPluginSubscriptionCallback = ApolloServerPluginSubscriptionCallback;
function isAsyncIterable(value) {
    return value && typeof value[Symbol.asyncIterator] === 'function';
}
class SubscriptionManager {
    constructor(options) {
        this.requestsInFlight = new Set();
        this.subscriptionInfoByCallbackUrl = new Map();
        this.maxConsecutiveHeartbeatFailures =
            options.maxConsecutiveHeartbeatFailures ?? 5;
        this.retryConfig = {
            retries: 5,
            minTimeout: 100,
            maxTimeout: 1000,
            ...options.retry,
        };
        this.logger = options.logger
            ? prefixedLogger(options.logger, 'SubscriptionManager')
            : undefined;
    }
    async retryFetch({ url, action, id, verifier, payload, errors, headers, }) {
        let response;
        try {
            const maybeWithErrors = errors?.length ? ` with errors` : '';
            this.logger?.debug(`Sending \`${action}\` request to router` + maybeWithErrors, id);
            return (0, async_retry_1.default)(async (bail) => {
                response = (0, node_fetch_1.default)(url, {
                    method: 'POST',
                    headers: {
                        'content-type': 'application/json',
                        ...headers,
                    },
                    body: JSON.stringify({
                        kind: 'subscription',
                        action,
                        id,
                        verifier,
                        ...(payload && { payload }),
                        ...(errors?.length && { errors }),
                    }),
                });
                this.requestsInFlight.add(response);
                const result = await response;
                if (!result.ok) {
                    if (result.status >= 500) {
                        throw new Error(`\`${action}\` request failed with unexpected status code: ${result.status}`);
                    }
                    else {
                        if (result.status === 404) {
                            this.logger?.debug(`\`${action}\` request received 404, terminating subscription`, id);
                        }
                        else {
                            const errMsg = `\`${action}\` request failed with unexpected status code: ${result.status}, terminating subscription`;
                            this.logger?.debug(errMsg, id);
                            bail(new Error(errMsg));
                        }
                        this.terminateSubscription(id, url);
                        return result;
                    }
                }
                this.logger?.debug(`\`${action}\` request successful`, id);
                return result;
            }, {
                ...this.retryConfig,
                onRetry: (e, attempt) => {
                    this.requestsInFlight.delete(response);
                    this.logger?.warn(`Retrying \`${action}\` request (attempt ${attempt}) due to error: ${e.message}`, id);
                    this.retryConfig?.onRetry?.(e, attempt);
                },
            });
        }
        finally {
            this.requestsInFlight.delete(response);
        }
    }
    async checkRequest({ callbackUrl, id, verifier, }) {
        return this.retryFetch({
            url: callbackUrl,
            action: 'check',
            id,
            verifier,
            headers: { 'subscription-protocol': 'callback/1.0' },
        });
    }
    initHeartbeat({ callbackUrl, id, verifier, heartbeatIntervalMs, }) {
        if (!this.subscriptionInfoByCallbackUrl.has(callbackUrl)) {
            this.subscriptionInfoByCallbackUrl.set(callbackUrl, {});
        }
        if (heartbeatIntervalMs === 0) {
            this.logger?.debug(`Heartbeat disabled for ${callbackUrl}`, id);
            return;
        }
        this.logger?.debug(`Starting new heartbeat interval for ${callbackUrl}`, id);
        let consecutiveHeartbeatFailureCount = 0;
        const heartbeatInterval = setInterval(async () => {
            let heartbeatRequest;
            let resolveHeartbeatPromise;
            const heartbeatPromise = new Promise((r) => {
                resolveHeartbeatPromise = r;
            });
            const existingSubscriptionInfo = this.subscriptionInfoByCallbackUrl.get(callbackUrl);
            if (!existingSubscriptionInfo?.heartbeat) {
                clearInterval(heartbeatInterval);
                this.logger?.error(`Programming error: Heartbeat interval unexpectedly missing for ${callbackUrl}. This is probably a bug in Apollo Server.`);
                return;
            }
            const existingHeartbeat = existingSubscriptionInfo.heartbeat;
            const { queue } = existingHeartbeat;
            queue.push(heartbeatPromise);
            if (queue.length > 1) {
                const requestBeforeMe = queue[existingHeartbeat?.queue.length - 2];
                await requestBeforeMe;
            }
            try {
                this.logger?.debug(`Sending \`check\` request to ${callbackUrl} for ID: ${id}`);
                heartbeatRequest = (0, node_fetch_1.default)(callbackUrl, {
                    method: 'POST',
                    body: JSON.stringify({
                        kind: 'subscription',
                        action: 'check',
                        id,
                        verifier,
                    }),
                    headers: {
                        'content-type': 'application/json',
                        'subscription-protocol': 'callback/1.0',
                    },
                });
                this.requestsInFlight.add(heartbeatRequest);
                const result = await heartbeatRequest;
                this.logger?.debug(`Heartbeat received response for ID: ${id}`);
                if (result.ok) {
                    this.logger?.debug(`Heartbeat request successful, ID: ${id}`);
                }
                else if (result.status === 400) {
                    this.logger?.debug(`Heartbeat request received invalid ID: ${id}`);
                    this.terminateSubscription(id, callbackUrl);
                }
                else if (result.status === 404) {
                    this.logger?.debug(`Heartbeat request received invalid ID: ${id}`);
                    this.terminateSubscription(id, callbackUrl);
                }
                else {
                    throw new Error(`Unexpected status code: ${result.status}`);
                }
                consecutiveHeartbeatFailureCount = 0;
            }
            catch (e) {
                const err = (0, errorNormalize_js_1.ensureError)(e);
                this.logger?.error(`Heartbeat request failed (${++consecutiveHeartbeatFailureCount} consecutive): ${err.message}`, existingHeartbeat.id);
                if (consecutiveHeartbeatFailureCount >=
                    this.maxConsecutiveHeartbeatFailures) {
                    this.logger?.error(`Heartbeat request failed ${consecutiveHeartbeatFailureCount} times, terminating subscriptions and heartbeat interval: ${err.message}`, existingHeartbeat.id);
                    this.terminateSubscription(id, callbackUrl);
                }
                return;
            }
            finally {
                if (heartbeatRequest) {
                    this.requestsInFlight.delete(heartbeatRequest);
                }
                existingHeartbeat?.queue.shift();
                resolveHeartbeatPromise();
            }
        }, heartbeatIntervalMs);
        const subscriptionInfo = this.subscriptionInfoByCallbackUrl.get(callbackUrl);
        subscriptionInfo.heartbeat = {
            interval: heartbeatInterval,
            id,
            verifier,
            queue: [],
        };
    }
    terminateSubscription(id, callbackUrl) {
        this.logger?.debug(`Terminating subscriptions for ID: ${id}`);
        const subscriptionInfo = this.subscriptionInfoByCallbackUrl.get(callbackUrl);
        if (!subscriptionInfo) {
            this.logger?.error(`No subscriptions found for ${callbackUrl}, skipping termination`);
            return;
        }
        const { subscription, heartbeat } = subscriptionInfo;
        if (subscription) {
            subscription.cancelled = true;
            subscription.asyncIter?.return();
        }
        if (heartbeat) {
            this.logger?.debug(`Terminating heartbeat interval for ${callbackUrl}`);
            clearInterval(heartbeat.interval);
        }
        this.subscriptionInfoByCallbackUrl.delete(callbackUrl);
    }
    startConsumingSubscription({ subscription, callbackUrl, id, verifier, }) {
        const self = this;
        const subscriptionObject = {
            asyncIter: subscription,
            cancelled: false,
            async startConsumingSubscription() {
                self.logger?.debug(`Listening to graphql-js subscription`, id);
                try {
                    for await (const payload of subscription) {
                        if (this.cancelled) {
                            self.logger?.debug(`Subscription already cancelled, ignoring current and future payloads`, id);
                            return;
                        }
                        try {
                            await self.retryFetch({
                                url: callbackUrl,
                                action: 'next',
                                id,
                                verifier,
                                payload,
                            });
                        }
                        catch (e) {
                            const originalError = (0, errorNormalize_js_1.ensureError)(e);
                            self.logger?.error(`\`next\` request failed, terminating subscription: ${originalError.message}`, id);
                            self.terminateSubscription(id, callbackUrl);
                        }
                    }
                    self.logger?.debug(`Subscription completed without errors`, id);
                    await this.completeSubscription();
                }
                catch (e) {
                    const error = (0, errorNormalize_js_1.ensureGraphQLError)(e);
                    self.logger?.error(`Generator threw an error, terminating subscription: ${error.message}`, id);
                    this.completeSubscription([error]);
                }
            },
            async completeSubscription(errors) {
                if (this.cancelled)
                    return;
                this.cancelled = true;
                try {
                    await self.completeRequest({
                        callbackUrl,
                        id,
                        verifier,
                        ...(errors && { errors }),
                    });
                }
                catch (e) {
                    const error = (0, errorNormalize_js_1.ensureError)(e);
                    self.logger?.error(`\`complete\` request failed: ${error.message}`, id);
                }
                finally {
                    self.terminateSubscription(id, callbackUrl);
                }
            },
        };
        subscriptionObject.startConsumingSubscription();
        const subscriptionInfo = this.subscriptionInfoByCallbackUrl.get(callbackUrl);
        if (!subscriptionInfo) {
            this.logger?.error(`No existing heartbeat found for ${callbackUrl}, skipping subscription`);
        }
        else {
            subscriptionInfo.subscription = subscriptionObject;
        }
    }
    async completeRequest({ errors, callbackUrl, id, verifier, }) {
        return this.retryFetch({
            url: callbackUrl,
            action: 'complete',
            id,
            verifier,
            errors,
        });
    }
    collectAllSubscriptions() {
        return Array.from(this.subscriptionInfoByCallbackUrl.values()).reduce((subscriptions, { subscription }) => {
            if (subscription) {
                subscriptions.push(subscription);
            }
            return subscriptions;
        }, []);
    }
    async cleanup() {
        await Promise.allSettled(Array.from(this.subscriptionInfoByCallbackUrl.values()).map(async ({ heartbeat }) => {
            clearInterval(heartbeat?.interval);
            await heartbeat?.queue[heartbeat.queue.length - 1];
        }));
        await Promise.allSettled(this.collectAllSubscriptions()
            .filter((s) => !s.cancelled)
            .map((s) => s.completeSubscription()));
        await Promise.allSettled(this.requestsInFlight.values());
    }
}
function prefixedLogger(logger, prefix) {
    function log(level) {
        return function (message, id) {
            logger[level](`${prefix}${id ? `[${id}]` : ''}: ${message}`);
        };
    }
    return {
        debug: log('debug'),
        error: log('error'),
        info: log('info'),
        warn: log('warn'),
    };
}
//# sourceMappingURL=index.js.map