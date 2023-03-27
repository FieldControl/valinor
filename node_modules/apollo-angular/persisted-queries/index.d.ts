import { ApolloLink } from '@apollo/client/link/core';
import { createPersistedQueryLink as _createPersistedQueryLink } from '@apollo/client/link/persisted-queries';
export declare type Options = Parameters<typeof _createPersistedQueryLink>[0];
export declare const createPersistedQueryLink: (options?: Options) => ApolloLink;
