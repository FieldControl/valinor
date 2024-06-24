import { Trace } from '@apollo/usage-reporting-protobuf';
import { TraceTreeBuilder } from '../traceTreeBuilder.js';
import { internalPlugin } from '../../internalPlugin.js';
import { schemaIsSubgraph } from '../schemaIsSubgraph.js';
export function ApolloServerPluginInlineTrace(options = Object.create(null)) {
    let enabled = options.__onlyIfSchemaIsSubgraph ? null : true;
    return internalPlugin({
        __internal_plugin_id__: 'InlineTrace',
        __is_disabled_plugin__: false,
        async serverWillStart({ schema, logger }) {
            if (enabled === null) {
                enabled = schemaIsSubgraph(schema);
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
            const treeBuilder = new TraceTreeBuilder({
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
                    const encodedUint8Array = Trace.encode(treeBuilder.trace).finish();
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
//# sourceMappingURL=index.js.map