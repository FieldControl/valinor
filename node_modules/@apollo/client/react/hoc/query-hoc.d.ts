import * as React from 'react';
import { DocumentNode } from 'graphql';
import { OperationOption, DataProps } from './types';
export declare function withQuery<TProps extends TGraphQLVariables | Record<string, any> = Record<string, any>, TData extends object = {}, TGraphQLVariables extends object = {}, TChildProps extends object = DataProps<TData, TGraphQLVariables>>(document: DocumentNode, operationOptions?: OperationOption<TProps, TData, TGraphQLVariables, TChildProps>): (WrappedComponent: React.ComponentType<TProps & TChildProps>) => React.ComponentClass<TProps>;
//# sourceMappingURL=query-hoc.d.ts.map