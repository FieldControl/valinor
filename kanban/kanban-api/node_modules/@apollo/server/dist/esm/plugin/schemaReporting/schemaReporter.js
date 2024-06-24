import fetch from 'node-fetch';
import { packageVersion } from '../../generated/packageVersion.js';
export const schemaReportGql = `#graphql
  mutation SchemaReport($report: SchemaReport!, $coreSchema: String) {
    reportSchema(report: $report, coreSchema: $coreSchema) {
      __typename
      ... on ReportSchemaError {
        message
        code
      }
      ... on ReportSchemaResponse {
        inSeconds
        withCoreSchema
      }
    }
  }
`;
export class SchemaReporter {
    constructor(options) {
        this.headers = {
            'Content-Type': 'application/json',
            'x-api-key': options.apiKey,
            'apollographql-client-name': 'ApolloServerPluginSchemaReporting',
            'apollographql-client-version': packageVersion,
        };
        this.endpointUrl =
            options.endpointUrl ||
                'https://schema-reporting.api.apollographql.com/api/graphql';
        this.schemaReport = options.schemaReport;
        this.coreSchema = options.coreSchema;
        this.isStopped = false;
        this.logger = options.logger;
        this.initialReportingDelayInMs = options.initialReportingDelayInMs;
        this.fallbackReportingDelayInMs = options.fallbackReportingDelayInMs;
        this.fetcher = options.fetcher ?? fetch;
    }
    stopped() {
        return this.isStopped;
    }
    start() {
        this.pollTimer = setTimeout(() => this.sendOneReportAndScheduleNext(false), this.initialReportingDelayInMs);
    }
    stop() {
        this.isStopped = true;
        if (this.pollTimer) {
            clearTimeout(this.pollTimer);
            this.pollTimer = undefined;
        }
    }
    async sendOneReportAndScheduleNext(sendNextWithCoreSchema) {
        this.pollTimer = undefined;
        if (this.stopped())
            return;
        try {
            const result = await this.reportSchema(sendNextWithCoreSchema);
            if (!result) {
                return;
            }
            if (!this.stopped()) {
                this.pollTimer = setTimeout(() => this.sendOneReportAndScheduleNext(result.withCoreSchema), result.inSeconds * 1000);
            }
            return;
        }
        catch (error) {
            this.logger.error(`Error reporting server info to Apollo during schema reporting: ${error}`);
            if (!this.stopped()) {
                this.pollTimer = setTimeout(() => this.sendOneReportAndScheduleNext(false), this.fallbackReportingDelayInMs);
            }
        }
    }
    async reportSchema(withCoreSchema) {
        const { data, errors } = await this.apolloQuery({
            report: this.schemaReport,
            coreSchema: withCoreSchema ? this.coreSchema : null,
        });
        if (errors) {
            throw new Error(errors.map((x) => x.message).join('\n'));
        }
        function msgForUnexpectedResponse(data) {
            return [
                'Unexpected response shape from Apollo when',
                'reporting schema. If this continues, please reach',
                'out to support@apollographql.com.',
                'Received response:',
                JSON.stringify(data),
            ].join(' ');
        }
        if (!data || !data.reportSchema) {
            throw new Error(msgForUnexpectedResponse(data));
        }
        if (data.reportSchema.__typename === 'ReportSchemaResponse') {
            return data.reportSchema;
        }
        else if (data.reportSchema.__typename === 'ReportSchemaError') {
            this.logger.error([
                'Received input validation error from Apollo:',
                data.reportSchema.message,
                'Stopping reporting. Please fix the input errors.',
            ].join(' '));
            this.stop();
            return null;
        }
        throw new Error(msgForUnexpectedResponse(data));
    }
    async apolloQuery(variables) {
        const request = {
            query: schemaReportGql,
            variables,
        };
        const httpResponse = await this.fetcher(this.endpointUrl, {
            method: 'POST',
            headers: this.headers,
            body: JSON.stringify(request),
        });
        if (!httpResponse.ok) {
            throw new Error([
                `An unexpected HTTP status code (${httpResponse.status}) was`,
                'encountered during schema reporting.',
            ].join(' '));
        }
        try {
            return await httpResponse.json();
        }
        catch (error) {
            throw new Error([
                "Couldn't report schema to Apollo.",
                'Parsing response as JSON failed.',
                'If this continues please reach out to support@apollographql.com',
                error,
            ].join(' '));
        }
    }
}
//# sourceMappingURL=schemaReporter.js.map