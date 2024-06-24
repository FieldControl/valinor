"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApolloServerPluginInlineTrace = void 0;
const usage_reporting_protobuf_1 = require("@apollo/usage-reporting-protobuf");
const traceTreeBuilder_js_1 = require("../traceTreeBuilder.js");
const internalPlugin_js_1 = require("../../internalPlugin.js");
const schemaIsSubgraph_js_1 = require("../schemaIsSubgraph.js");
function ApolloServerPluginInlineTrace(options = Object.create(null)) {
    let enabled = options.__onlyIfSchemaIsSubgraph ? null : true;
    return (0, internalPlugin_js_1.internalPlugin)({
        __internal_plugin_id__: 'InlineTrace',
        __is_disabled_plugin__: false,
        async serverWillStart({ schema, logger }) {
            if (enabled === null) {
                enabled = (0, schemaIsSubgraph_js_1.schemaIsSubgraph)(schema);
                if (enabled) {
                    logger.info('Enabling inline tracing for this subgraph. To disable, use ' +
                        'ApolloServerPluginInlineTraceDisabled.');
                }
            }
        },
        async requestDidStart({ request: { http }, metrics }) {
            if (!enabled) {
                return;
            }
            const treeBuilder = new traceTreeBuilder_js_1.TraceTreeBuilder({
                maskedBy: 'ApolloServerPluginInlineTrace',
                sendErrors: options.includeErrors,
            });
            if (http?.headers.get('apollo-federation-include-trace') !== 'ftv1') {
                return;
            }
            if (metrics.captureTraces === false) {
                return;
            }
            metrics.captureTraces = true;
            treeBuilder.startTiming();
            return {
                async executionDidStart() {
                    return {
                        willResolveField({ info }) {
                            return treeBuilder.willResolveField(info);
                        },
                    };
                },
                async didEncounterErrors({ errors }) {
                    treeBuilder.didEncounterErrors(errors);
                },
                async willSendResponse({ response }) {
                    treeBuilder.stopTiming();
                    if (response.body.kind === 'incremental') {
                        return;
                    }
                    if (metrics.queryPlanTrace) {
                        treeBuilder.trace.queryPlan = metrics.queryPlanTrace;
                    }
                    const encodedUint8Array = usage_reporting_protobuf_1.Trace.encode(treeBuilder.trace).finish();
                    const encodedBuffer = Buffer.from(encodedUint8Array, encodedUint8Array.byteOffset, encodedUint8Array.byteLength);
                    const extensions = response.body.singleResult.extensions ||
                        (response.body.singleResult.extensions = Object.create(null));
                    if (typeof extensions.ftv1 !== 'undefined') {
                        throw new Error('The `ftv1` extension was already present.');
                    }
                    extensions.ftv1 = encodedBuffer.toString('base64');
                },
            };
        },
    });
}
exports.ApolloServerPluginInlineTrace = ApolloServerPluginInlineTrace;
//# sourceMappingURL=index.js.map