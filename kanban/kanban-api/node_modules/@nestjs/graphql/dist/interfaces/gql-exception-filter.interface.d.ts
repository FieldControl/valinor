import { ArgumentsHost } from '@nestjs/common';
export interface GqlExceptionFilter<TInput = any, TOutput = any> {
    catch(exception: TInput, host: ArgumentsHost): TOutput;
}
//# sourceMappingURL=gql-exception-filter.interface.d.ts.map