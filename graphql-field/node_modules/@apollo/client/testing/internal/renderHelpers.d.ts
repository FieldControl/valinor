import * as React from "react";
import type { ReactElement } from "react";
import type { Queries, RenderOptions, queries } from "@testing-library/react";
import type { ApolloClient } from "../../core/index.js";
import type { MockedProviderProps } from "../react/MockedProvider.js";
export interface RenderWithClientOptions<Q extends Queries = typeof queries, Container extends Element | DocumentFragment = HTMLElement, BaseElement extends Element | DocumentFragment = Container> extends RenderOptions<Q, Container, BaseElement> {
    client: ApolloClient<any>;
}
export declare function createClientWrapper(client: ApolloClient<any>, Wrapper?: React.JSXElementConstructor<{
    children: React.ReactNode;
}>): React.JSXElementConstructor<{
    children: React.ReactNode;
}>;
export declare function renderWithClient<Q extends Queries = typeof queries, Container extends Element | DocumentFragment = HTMLElement, BaseElement extends Element | DocumentFragment = Container>(ui: ReactElement, { client, wrapper, ...renderOptions }: RenderWithClientOptions<Q, Container, BaseElement>): import("@testing-library/react").RenderResult<Q, Container, BaseElement>;
export interface RenderWithMocksOptions<Q extends Queries = typeof queries, Container extends Element | DocumentFragment = HTMLElement, BaseElement extends Element | DocumentFragment = Container> extends RenderOptions<Q, Container, BaseElement>, MockedProviderProps<any> {
}
export declare function createMockWrapper(renderOptions: MockedProviderProps<any>, Wrapper?: React.JSXElementConstructor<{
    children: React.ReactNode;
}>): React.JSXElementConstructor<{
    children: React.ReactNode;
}>;
export declare function renderWithMocks<Q extends Queries = typeof queries, Container extends Element | DocumentFragment = HTMLElement, BaseElement extends Element | DocumentFragment = Container>(ui: ReactElement, { wrapper, ...renderOptions }: RenderWithMocksOptions<Q, Container, BaseElement>): import("@testing-library/react").RenderResult<Q, Container, BaseElement>;
//# sourceMappingURL=renderHelpers.d.ts.map