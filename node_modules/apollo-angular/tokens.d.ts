import { InjectionToken } from '@angular/core';
import type { ApolloClientOptions } from '@apollo/client/core';
import type { NamedOptions, Flags } from './types';
export declare const APOLLO_FLAGS: InjectionToken<Flags>;
export declare const APOLLO_OPTIONS: InjectionToken<ApolloClientOptions<any>>;
export declare const APOLLO_NAMED_OPTIONS: InjectionToken<NamedOptions>;
