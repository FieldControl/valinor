import { ApolloLink } from "../../../core/index.js";
import type { TypedDocumentNode } from "../../../core/index.js";
import type { MaskedDocumentNode } from "../../../masking/index.js";
import type { MockedResponse } from "../../core/index.js";
export interface SimpleCaseData {
    greeting: string;
}
export declare function setupSimpleCase(): {
    query: TypedDocumentNode<SimpleCaseData, Record<string, never>>;
    mocks: MockedResponse<SimpleCaseData, Record<string, any>>[];
};
export interface VariablesCaseData {
    character: {
        __typename: "Character";
        id: string;
        name: string;
    };
}
export interface VariablesCaseVariables {
    id: string;
}
export declare function setupVariablesCase(): {
    mocks: MockedResponse<VariablesCaseData, Record<string, any>>[];
    query: TypedDocumentNode<VariablesCaseData, VariablesCaseVariables>;
};
export type MaskedVariablesCaseFragment = {
    __typename: "Character";
    name: string;
} & {
    " $fragmentName"?: "MaskedVariablesCaseFragment";
};
export interface MaskedVariablesCaseData {
    character: {
        __typename: "Character";
        id: string;
    } & {
        " $fragmentRefs"?: {
            MaskedVariablesCaseFragment: MaskedVariablesCaseFragment;
        };
    };
}
export interface UnmaskedVariablesCaseData {
    character: {
        __typename: "Character";
        id: string;
        name: string;
    };
}
export declare function setupMaskedVariablesCase(): {
    mocks: MockedResponse<MaskedVariablesCaseData, Record<string, any>>[];
    query: MaskedDocumentNode<MaskedVariablesCaseData, VariablesCaseVariables>;
    unmaskedQuery: TypedDocumentNode<MaskedVariablesCaseData, VariablesCaseVariables>;
};
export declare function addDelayToMocks<T extends MockedResponse<unknown>[]>(mocks: T, delay?: number, override?: boolean): {
    delay: number;
    request: import("../../../core/index.js").GraphQLRequest<Record<string, any>>;
    maxUsageCount?: number;
    result?: import("../../../core/index.js").FetchResult<unknown> | import("../../core/index.js").ResultFunction<import("../../../core/index.js").FetchResult<unknown>, Record<string, any>> | undefined;
    error?: Error;
    variableMatcher?: import("../../core/mocking/mockLink.js").VariableMatcher<Record<string, any>> | undefined;
    newData?: import("../../core/index.js").ResultFunction<import("../../../core/index.js").FetchResult<unknown>, Record<string, any>> | undefined;
}[];
interface Letter {
    __typename: "Letter";
    letter: string;
    position: number;
}
export interface PaginatedCaseData {
    letters: Letter[];
}
export interface PaginatedCaseVariables {
    limit?: number;
    offset?: number;
}
export declare function setupPaginatedCase(): {
    query: TypedDocumentNode<PaginatedCaseData, PaginatedCaseVariables>;
    link: ApolloLink;
    data: {
        __typename: string;
        letter: string;
        position: number;
    }[];
};
export {};
//# sourceMappingURL=index.d.ts.map