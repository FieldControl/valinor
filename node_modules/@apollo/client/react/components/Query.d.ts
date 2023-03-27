/// <reference types="react" />
import * as PropTypes from 'prop-types';
import { OperationVariables } from '../../core';
import { QueryComponentOptions } from './types';
export declare function Query<TData = any, TVariables extends OperationVariables = OperationVariables>(props: QueryComponentOptions<TData, TVariables>): JSX.Element | null;
export declare namespace Query {
    var propTypes: PropTypes.InferProps<QueryComponentOptions<any, any>>;
}
export interface Query<TData, TVariables extends OperationVariables> {
    propTypes: PropTypes.InferProps<QueryComponentOptions<TData, TVariables>>;
}
//# sourceMappingURL=Query.d.ts.map