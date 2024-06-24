import { Report, ReportHeader, Trace } from '@apollo/usage-reporting-protobuf';
import { usageReportingSignature, calculateReferencedFieldsByType, } from '@apollo/utils.usagereporting';
import retry from 'async-retry';
import { printSchema } from 'graphql';
import { AbortController } from 'node-abort-controller';
import fetch from 'node-fetch';
import os from 'os';
import { gzip } from 'zlib';
import { internalPlugin } from '../../internalPlugin.js';
import { dateToProtoTimestamp, TraceTreeBuilder } from '../traceTreeBuilder.js';
import { defaultSendOperationsAsTrace } from './defaultSendOperationsAsTrace.js';
import { createOperationDerivedDataCache, operationDerivedDataCacheKey, } from './operationDerivedDataCache.js';
import { OurReport } from './stats.js';
import { makeTraceDetails } from './traceDetails.js';
import { packageVersion } from '../../generated/packageVersion.js';
import { computeCoreSchemaHash } from '../../utils/computeCoreSchemaHash.js';
import { schemaIsSubgraph } from '../schemaIsSubgraph.js';
const reportHeaderDefaults = {
    hostname: os.hostname(),
    agentVersion: `@apollo/server@${packageVersion}`,
    runtimeVersion: `node ${process.version}`,
    uname: `${os.platform()}, ${os.type()}, ${os.release()}, ${os.arch()})`,
};
export function ApolloServerPluginUsageReporting(options = Object.create(null)) {
    const fieldLevelInstrumentationOption = options.fieldLevelInstrumentation;
    const fieldLevelInstrumentation = typeof fieldLevelInstrumentationOption === 'number'
        ? async () => Math.random() < fieldLevelInstrumentationOption
            ? 1 / fieldLevelInstrumentationOption
            : 0
        : fieldLevelInstrumentationOption
            ? fieldLevelInstrumentationOption
            : async () => true;
    let requestDidStartHandler = null;
    return internalPlugin({
        __internal_plugin_id__: 'UsageReporting',
        __is_disabled_plugin__: false,
        async requestDidStart(requestContext) {
            if (requestDidStartHandler) {
                return requestDidStartHandler(requestContext);
            }
            return {};
        },
        async serverWillStart({ logger: serverLogger, apollo, startedInBackground, schema, }) {
            const logger = options.logger ?? serverLogger;
            const { key, graphRef } = apollo;
            if (!(key && graphRef)) {
                throw new Error("You've enabled usage reporting via ApolloServerPluginUsageReporting, " +
                    'but you also need to provide your Apollo API key and graph ref, via ' +
                    'the APOLLO_KEY/APOLLO_GRAPH_REF environment ' +
                    'variables or via `new ApolloServer({apollo: {key, graphRef})`.');
            }
            if (schemaIsSubgraph(schema)) {
                if (options.__onlyIfSchemaIsNotSubgraph) {
                    logger.warn('You have specified an Apollo API key and graph ref but this server appears ' +
                        'to be a subgraph. Typically usage reports are sent to Apollo by your Router ' +
                        'or Gateway, not directly from your subgraph; usage reporting is disabled. To ' +
                        'enable usage reporting anyway, explicitly install `ApolloServerPluginUsageReporting`. ' +
                        'To disable this warning, install `ApolloServerPluginUsageReportingDisabled`.');
                    return {};
                }
                else {
                    logger.warn('You have installed `ApolloServerPluginUsageReporting` but this server appears to ' +
                        'be a subgraph. Typically usage reports are sent to Apollo by your Router ' +
                        'or Gateway, not directly from your subgraph. If this was unintentional, remove ' +
                        "`ApolloServerPluginUsageReporting` from your server's `plugins` array.");
                }
            }
            logger.info('Apollo usage reporting starting! See your graph at ' +
                `https://studio.apollographql.com/graph/${encodeURI(graphRef)}/`);
            const sendReportsImmediately = options.sendReportsImmediately ?? startedInBackground;
            let operationDerivedDataCache = null;
            const reportByExecutableSchemaId = new Map();
            const getReportWhichMustBeUsedImmediately = (executableSchemaId) => {
                const existing = reportByExecutableSchemaId.get(executableSchemaId);
                if (existing) {
                    return existing;
                }
                const report = new OurReport(new ReportHeader({
                    ...reportHeaderDefaults,
                    executableSchemaId,
                    graphRef,
                }));
                reportByExecutableSchemaId.set(executableSchemaId, report);
                return report;
            };
            const getAndDeleteReport = (executableSchemaId) => {
                const report = reportByExecutableSchemaId.get(executableSchemaId);
                if (report) {
                    reportByExecutableSchemaId.delete(executableSchemaId);
                    return report;
                }
                return null;
            };
            const overriddenExecutableSchemaId = options.overrideReportedSchema
                ? computeCoreSchemaHash(options.overrideReportedSchema)
                : undefined;
            let lastSeenExecutableSchemaToId;
            let reportTimer;
            if (!sendReportsImmediately) {
                reportTimer = setInterval(() => sendAllReportsAndReportErrors(), options.reportIntervalMs || 10 * 1000);
            }
            let sendTraces = options.sendTraces ?? true;
            const sendOperationAsTrace = options.experimental_sendOperationAsTrace ??
                defaultSendOperationsAsTrace();
            let stopped = false;
            function executableSchemaIdForSchema(schema) {
                if (lastSeenExecutableSchemaToId?.executableSchema === schema) {
                    return lastSeenExecutableSchemaToId.executableSchemaId;
                }
                const id = computeCoreSchemaHash(printSchema(schema));
                lastSeenExecutableSchemaToId = {
                    executableSchema: schema,
                    executableSchemaId: id,
                };
                return id;
            }
            async function sendAllReportsAndReportErrors() {
                await Promise.all([...reportByExecutableSchemaId.keys()].map((executableSchemaId) => sendReportAndReportErrors(executableSchemaId)));
            }
            async function sendReportAndReportErrors(executableSchemaId) {
                return sendReport(executableSchemaId).catch((err) => {
                    if (options.reportErrorFunction) {
                        options.reportErrorFunction(err);
                    }
                    else {
                        logger.error(err.message);
                    }
                });
            }
            const sendReport = async (executableSchemaId) => {
                let report = getAndDeleteReport(executableSchemaId);
                if (!report ||
                    (Object.keys(report.tracesPerQuery).length === 0 &&
                        report.operationCount === 0)) {
                    return;
                }
                report.endTime = dateToProtoTimestamp(new Date());
                report.ensureCountsAreIntegers();
                const protobufError = Report.verify(report);
                if (protobufError) {
                    throw new Error(`Error verifying report: ${protobufError}`);
                }
                let message = Report.encode(report).finish();
                report = null;
                if (options.debugPrintReports) {
                    const decodedReport = Report.decode(message);
                    logger.info(`Apollo usage report: ${JSON.stringify(decodedReport.toJSON())}`);
                }
                const compressed = await new Promise((resolve, reject) => {
                    gzip(message, (error, result) => {
                        error ? reject(error) : resolve(result);
                    });
                });
                message = null;
                const fetcher = options.fetcher ?? fetch;
                const response = await retry(async () => {
                    const controller = new AbortController();
                    const abortTimeout = setTimeout(() => {
                        controller.abort();
                    }, options.requestTimeoutMs ?? 30000);
                    let curResponse;
                    try {
                        curResponse = await fetcher((options.endpointUrl ||
                            'https://usage-reporting.api.apollographql.com') +
                            '/api/ingress/traces', {
                            method: 'POST',
                            headers: {
                                'user-agent': 'ApolloServerPluginUsageReporting',
                                'x-api-key': key,
                                'content-encoding': 'gzip',
                                accept: 'application/json',
                            },
                            body: compressed,
                            signal: controller.signal,
                        });
                    }
                    finally {
                        clearTimeout(abortTimeout);
                    }
                    if (curResponse.status >= 500 && curResponse.status < 600) {
                        throw new Error(`HTTP status ${curResponse.status}, ${(await curResponse.text()) || '(no body)'}`);
                    }
                    else {
                        return curResponse;
                    }
                }, {
                    retries: (options.maxAttempts || 5) - 1,
                    minTimeout: options.minimumRetryDelayMs || 100,
                    factor: 2,
                }).catch((err) => {
                    throw new Error(`Error sending report to Apollo servers: ${err.message}`);
                });
                if (response.status < 200 || response.status >= 300) {
                    throw new Error(`Error sending report to Apollo servers: HTTP status ${response.status}, ${(await response.text()) || '(no body)'}`);
                }
                if (sendTraces &&
                    response.status === 200 &&
                    response.headers
                        .get('content-type')
                        ?.match(/^\s*application\/json\s*(?:;|$)/i)) {
                    const body = await response.text();
                    let parsedBody;
                    try {
                        parsedBody = JSON.parse(body);
                    }
                    catch (e) {
                        throw new Error(`Error parsing response from Apollo servers: ${e}`);
                    }
                    if (parsedBody.tracesIgnored === true) {
                        logger.debug("This graph's organization does not have access to traces; sending all " +
                            'subsequent operations as stats.');
                        sendTraces = false;
                    }
                }
                if (options.debugPrintReports) {
                    logger.info(`Apollo usage report: status ${response.status}`);
                }
            };
            requestDidStartHandler = ({ metrics, schema, request: { http, variables }, }) => {
                const treeBuilder = new TraceTreeBuilder({
                    maskedBy: 'ApolloServerPluginUsageReporting',
                    sendErrors: options.sendErrors,
                });
                treeBuilder.startTiming();
                metrics.startHrTime = treeBuilder.startHrTime;
                let graphqlValidationFailure = false;
                let graphqlUnknownOperationName = false;
                let includeOperationInUsageReporting = null;
                if (http) {
                    treeBuilder.trace.http = new Trace.HTTP({
                        method: Trace.HTTP.Method[http.method] || Trace.HTTP.Method.UNKNOWN,
                    });
                    if (options.sendHeaders) {
                        makeHTTPRequestHeaders(treeBuilder.trace.http, http.headers, options.sendHeaders);
                    }
                }
                async function maybeCallIncludeRequestHook(requestContext) {
                    if (includeOperationInUsageReporting !== null)
                        return;
                    if (typeof options.includeRequest !== 'function') {
                        includeOperationInUsageReporting = true;
                        return;
                    }
                    includeOperationInUsageReporting =
                        await options.includeRequest(requestContext);
                    if (typeof includeOperationInUsageReporting !== 'boolean') {
                        logger.warn("The 'includeRequest' async predicate function must return a boolean value.");
                        includeOperationInUsageReporting = true;
                    }
                }
                let didResolveSource = false;
                return {
                    async didResolveSource(requestContext) {
                        didResolveSource = true;
                        if (metrics.persistedQueryHit) {
                            treeBuilder.trace.persistedQueryHit = true;
                        }
                        if (metrics.persistedQueryRegister) {
                            treeBuilder.trace.persistedQueryRegister = true;
                        }
                        if (variables) {
                            treeBuilder.trace.details = makeTraceDetails(variables, options.sendVariableValues, requestContext.source);
                        }
                        const clientInfo = (options.generateClientInfo || defaultGenerateClientInfo)(requestContext);
                        if (clientInfo) {
                            const { clientName, clientVersion } = clientInfo;
                            treeBuilder.trace.clientVersion = clientVersion || '';
                            treeBuilder.trace.clientName = clientName || '';
                        }
                    },
                    async validationDidStart() {
                        return async (validationErrors) => {
                            graphqlValidationFailure = validationErrors
                                ? validationErrors.length !== 0
                                : false;
                        };
                    },
                    async didResolveOperation(requestContext) {
                        graphqlUnknownOperationName =
                            requestContext.operation === undefined;
                        await maybeCallIncludeRequestHook(requestContext);
                        if (includeOperationInUsageReporting &&
                            !graphqlUnknownOperationName) {
                            if (metrics.captureTraces === undefined) {
                                const rawWeight = await fieldLevelInstrumentation(requestContext);
                                treeBuilder.trace.fieldExecutionWeight =
                                    typeof rawWeight === 'number' ? rawWeight : rawWeight ? 1 : 0;
                                metrics.captureTraces =
                                    !!treeBuilder.trace.fieldExecutionWeight;
                            }
                        }
                    },
                    async executionDidStart() {
                        if (!metrics.captureTraces)
                            return;
                        return {
                            willResolveField({ info }) {
                                return treeBuilder.willResolveField(info);
                            },
                        };
                    },
                    async didEncounterSubsequentErrors(_requestContext, errors) {
                        treeBuilder.didEncounterErrors(errors);
                    },
                    async willSendSubsequentPayload(requestContext, payload) {
                        if (!payload.hasNext) {
                            await operationFinished(requestContext);
                        }
                    },
                    async willSendResponse(requestContext) {
                        if (!didResolveSource)
                            return;
                        if (requestContext.errors) {
                            treeBuilder.didEncounterErrors(requestContext.errors);
                        }
                        if (requestContext.response.body.kind === 'single') {
                            await operationFinished(requestContext);
                        }
                    },
                };
                async function operationFinished(requestContext) {
                    const resolvedOperation = !!requestContext.operation;
                    await maybeCallIncludeRequestHook(requestContext);
                    treeBuilder.stopTiming();
                    const executableSchemaId = overriddenExecutableSchemaId ?? executableSchemaIdForSchema(schema);
                    if (includeOperationInUsageReporting === false) {
                        if (resolvedOperation) {
                            getReportWhichMustBeUsedImmediately(executableSchemaId)
                                .operationCount++;
                        }
                        return;
                    }
                    treeBuilder.trace.fullQueryCacheHit = !!metrics.responseCacheHit;
                    treeBuilder.trace.forbiddenOperation = !!metrics.forbiddenOperation;
                    treeBuilder.trace.registeredOperation = !!metrics.registeredOperation;
                    const policyIfCacheable = requestContext.overallCachePolicy.policyIfCacheable();
                    if (policyIfCacheable) {
                        treeBuilder.trace.cachePolicy = new Trace.CachePolicy({
                            scope: policyIfCacheable.scope === 'PRIVATE'
                                ? Trace.CachePolicy.Scope.PRIVATE
                                : policyIfCacheable.scope === 'PUBLIC'
                                    ? Trace.CachePolicy.Scope.PUBLIC
                                    : Trace.CachePolicy.Scope.UNKNOWN,
                            maxAgeNs: policyIfCacheable.maxAge * 1e9,
                        });
                    }
                    if (metrics.queryPlanTrace) {
                        treeBuilder.trace.queryPlan = metrics.queryPlanTrace;
                    }
                    addTrace().catch(logger.error);
                    async function addTrace() {
                        if (stopped) {
                            return;
                        }
                        await new Promise((res) => setImmediate(res));
                        const executableSchemaId = overriddenExecutableSchemaId ??
                            executableSchemaIdForSchema(schema);
                        const { trace } = treeBuilder;
                        let statsReportKey = undefined;
                        let referencedFieldsByType;
                        if (!requestContext.document) {
                            statsReportKey = `## GraphQLParseFailure\n`;
                        }
                        else if (graphqlValidationFailure) {
                            statsReportKey = `## GraphQLValidationFailure\n`;
                        }
                        else if (graphqlUnknownOperationName) {
                            statsReportKey = `## GraphQLUnknownOperationName\n`;
                        }
                        const isExecutable = statsReportKey === undefined;
                        if (statsReportKey) {
                            if (options.sendUnexecutableOperationDocuments) {
                                trace.unexecutedOperationBody = requestContext.source;
                                trace.unexecutedOperationName =
                                    requestContext.request.operationName || '';
                            }
                            referencedFieldsByType = Object.create(null);
                        }
                        else {
                            const operationDerivedData = getOperationDerivedData();
                            statsReportKey = `# ${requestContext.operationName || '-'}\n${operationDerivedData.signature}`;
                            referencedFieldsByType =
                                operationDerivedData.referencedFieldsByType;
                        }
                        const protobufError = Trace.verify(trace);
                        if (protobufError) {
                            throw new Error(`Error encoding trace: ${protobufError}`);
                        }
                        if (resolvedOperation) {
                            getReportWhichMustBeUsedImmediately(executableSchemaId)
                                .operationCount++;
                        }
                        getReportWhichMustBeUsedImmediately(executableSchemaId).addTrace({
                            statsReportKey,
                            trace,
                            asTrace: sendTraces &&
                                (!isExecutable || !!metrics.captureTraces) &&
                                !metrics.nonFtv1ErrorPaths?.length &&
                                sendOperationAsTrace(trace, statsReportKey),
                            referencedFieldsByType,
                            nonFtv1ErrorPaths: metrics.nonFtv1ErrorPaths ?? [],
                        });
                        if (sendReportsImmediately ||
                            getReportWhichMustBeUsedImmediately(executableSchemaId)
                                .sizeEstimator.bytes >=
                                (options.maxUncompressedReportSize || 4 * 1024 * 1024)) {
                            await sendReportAndReportErrors(executableSchemaId);
                        }
                    }
                    function getOperationDerivedData() {
                        if (!requestContext.document) {
                            throw new Error('No document?');
                        }
                        const cacheKey = operationDerivedDataCacheKey(requestContext.queryHash, requestContext.operationName || '');
                        if (!operationDerivedDataCache ||
                            operationDerivedDataCache.forSchema !== schema) {
                            operationDerivedDataCache = {
                                forSchema: schema,
                                cache: createOperationDerivedDataCache({ logger }),
                            };
                        }
                        const cachedOperationDerivedData = operationDerivedDataCache.cache.get(cacheKey);
                        if (cachedOperationDerivedData) {
                            return cachedOperationDerivedData;
                        }
                        const generatedSignature = (options.calculateSignature || usageReportingSignature)(requestContext.document, requestContext.operationName || '');
                        const generatedOperationDerivedData = {
                            signature: generatedSignature,
                            referencedFieldsByType: calculateReferencedFieldsByType({
                                document: requestContext.document,
                                schema,
                                resolvedOperationName: requestContext.operationName ?? null,
                            }),
                        };
                        operationDerivedDataCache.cache.set(cacheKey, generatedOperationDerivedData);
                        return generatedOperationDerivedData;
                    }
                }
            };
            return {
                async serverWillStop() {
                    if (reportTimer) {
                        clearInterval(reportTimer);
                        reportTimer = undefined;
                    }
                    stopped = true;
                    await sendAllReportsAndReportErrors();
                },
            };
        },
    });
}
export function makeHTTPRequestHeaders(http, headers, sendHeaders) {
    if (!sendHeaders ||
        ('none' in sendHeaders && sendHeaders.none) ||
        ('all' in sendHeaders && !sendHeaders.all)) {
        return;
    }
    for (const [key, value] of headers) {
        if (('exceptNames' in sendHeaders &&
            sendHeaders.exceptNames.some((exceptHeader) => {
                return exceptHeader.toLowerCase() === key;
            })) ||
            ('onlyNames' in sendHeaders &&
                !sendHeaders.onlyNames.some((header) => {
                    return header.toLowerCase() === key;
                }))) {
            continue;
        }
        switch (key) {
            case 'authorization':
            case 'cookie':
            case 'set-cookie':
                break;
            default:
                http.requestHeaders[key] = new Trace.HTTP.Values({
                    value: [value],
                });
        }
    }
}
function defaultGenerateClientInfo({ request, }) {
    const clientNameHeaderKey = 'apollographql-client-name';
    const clientVersionHeaderKey = 'apollographql-client-version';
    if (request.http?.headers?.get(clientNameHeaderKey) ||
        request.http?.headers?.get(clientVersionHeaderKey)) {
        return {
            clientName: request.http?.headers?.get(clientNameHeaderKey),
            clientVersion: request.http?.headers?.get(clientVersionHeaderKey),
        };
    }
    else if (request.extensions?.clientInfo) {
        return request.extensions.clientInfo;
    }
    else {
        return {};
    }
}
//# sourceMappingURL=plugin.js.map