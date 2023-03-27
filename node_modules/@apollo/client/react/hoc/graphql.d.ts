/// <reference types="react" />
import { DocumentNode } from 'graphql';
import { OperationOption, DataProps, MutateProps } from './types';
import { OperationVariables } from '../../core';
export declare function graphql<TProps extends TGraphQLVariables | {} = {}, TData extends object = {}, TGraphQLVariables extends OperationVariables = {}, TChildProps extends object = Partial<DataProps<TData, TGraphQLVariables>> & Partial<MutateProps<TData, TGraphQLVariables>>>(document: DocumentNode, operationOptions?: OperationOption<TProps, TData, TGraphQLVariables, TChildProps>): (WrappedComponent: React.ComponentType<TProps & TChildProps>) => React.ComponentClass<TProps>;
//# sourceMappingURL=graphql.d.ts.map