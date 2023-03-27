import { InvariantError } from '../../utilities/globals';
export type ClientParseError = InvariantError & {
    parseError: Error;
};
export declare const serializeFetchParameter: (p: any, label: string) => string;
//# sourceMappingURL=serializeFetchParameter.d.ts.map