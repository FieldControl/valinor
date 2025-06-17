import type { queries, Queries } from "@testing-library/dom";
import type { RenderHookOptions, RenderHookResult } from "@testing-library/react";
import type * as ReactDOMClient from "react-dom/client";
type RendererableContainer = ReactDOMClient.Container;
type HydrateableContainer = Parameters<(typeof ReactDOMClient)["hydrateRoot"]>[0];
export declare function renderHookAsync<Result, Props, Q extends Queries = typeof queries, Container extends RendererableContainer | HydrateableContainer = HTMLElement, BaseElement extends RendererableContainer | HydrateableContainer = Container>(renderCallback: (initialProps: Props) => Result, options?: RenderHookOptions<Props, Q, Container, BaseElement> | undefined): Promise<RenderHookResult<Result, Props>>;
export {};
//# sourceMappingURL=renderHookAsync.d.ts.map