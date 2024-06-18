import os from 'os';
import { internalPlugin } from '../../internalPlugin.js';
import { v4 as uuidv4 } from 'uuid';
import { printSchema, validateSchema, buildSchema } from 'graphql';
import { SchemaReporter } from './schemaReporter.js';
import { schemaIsSubgraph } from '../schemaIsSubgraph.js';
import { packageVersion } from '../../generated/packageVersion.js';
import { computeCoreSchemaHash } from '../../utils/computeCoreSchemaHash.js';
export function ApolloServerPluginSchemaReporting({ initialDelayMaxMs, overrideReportedSchema, endpointUrl, fetcher, } = Object.create(null)) {
    const bootId = uuidv4();
    return internalPlugin({
        __internal_plugin_id__: 'SchemaReporting',
        __is_disabled_plugin__: false,
        async serverWillStart({ apollo, schema, logger }) {
            const { key, graphRef } = apollo;
            if (!key) {
                throw Error('To use ApolloServerPluginSchemaReporting, you must provide an Apollo API ' +
                    'key, via the APOLLO_KEY environment variable or via `new ApolloServer({apollo: {key})`');
            }
            if (!graphRef) {
                throw Error('To use ApolloServerPluginSchemaReporting, you must provide your graph ref (eg, ' +
                    "'my-graph-id@my-graph-variant'). Try setting the APOLLO_GRAPH_REF environment " +
                    'variable or passing `new ApolloServer({apollo: {graphRef}})`.');
            }
            if (overrideReportedSchema) {
                try {
                    const validationErrors = validateSchema(buildSchema(overrideReportedSchema, { noLocation: true }));
                    if (validationErrors.length) {
                        throw new Error(validationErrors.map((error) => error.message).join('\n'));
                    }
                }
                catch (err) {
                    throw new Error('The schema provided to overrideReportedSchema failed to parse or ' +
                        `validate: ${err.message}`);
                }
            }
            if (schemaIsSubgraph(schema)) {
                throw Error([
                    'Schema reporting is not yet compatible with Apollo Federation subgraphs.',
                    "If you're interested in using schema reporting with subgraphs,",
                    'please contact Apollo support. To set up managed federation, see',
                    'https://go.apollo.dev/s/managed-federation',
                ].join(' '));
            }
            if (endpointUrl !== undefined) {
                logger.info(`Apollo schema reporting: schema reporting URL override: ${endpointUrl}`);
            }
            const baseSchemaReport = {
                bootId,
                graphRef,
                platform: process.env.APOLLO_SERVER_PLATFORM || 'local',
                runtimeVersion: `node ${process.version}`,
                userVersion: process.env.APOLLO_SERVER_USER_VERSION,
                serverId: process.env.APOLLO_SERVER_ID || process.env.HOSTNAME || os.hostname(),
                libraryVersion: `@apollo/server@${packageVersion}`,
            };
            let currentSchemaReporter;
            return {
                schemaDidLoadOrUpdate({ apiSchema, coreSupergraphSdl }) {
                    if (overrideReportedSchema !== undefined) {
                        if (currentSchemaReporter) {
                            return;
                        }
                        else {
                            logger.info('Apollo schema reporting: schema to report has been overridden');
                        }
                    }
                    const coreSchema = overrideReportedSchema ??
                        coreSupergraphSdl ??
                        printSchema(apiSchema);
                    const coreSchemaHash = computeCoreSchemaHash(coreSchema);
                    const schemaReport = {
                        ...baseSchemaReport,
                        coreSchemaHash,
                    };
                    currentSchemaReporter?.stop();
                    currentSchemaReporter = new SchemaReporter({
                        schemaReport,
                        coreSchema,
                        apiKey: key,
                        endpointUrl,
                        logger,
                        initialReportingDelayInMs: Math.floor(Math.random() * (initialDelayMaxMs ?? 10000)),
                        fallbackReportingDelayInMs: 20000,
                        fetcher,
                    });
                    currentSchemaReporter.start();
                    logger.info('Apollo schema reporting: reporting a new schema to Studio! See your graph at ' +
                        `https://studio.apollographql.com/graph/${encodeURI(graphRef)}/ with server info ${JSON.stringify(schemaReport)}`);
                },
                async serverWillStop() {
                    currentSchemaReporter?.stop();
                },
            };
        },
    });
}
//# sourceMappingURL=index.js.map