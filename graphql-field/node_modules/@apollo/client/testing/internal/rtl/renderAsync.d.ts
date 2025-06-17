import type { queries, Queries } from "@testing-library/dom";
import type { RenderOptions, RenderResult } from "@testing-library/react";
import type * as ReactDOMClient from "react-dom/client";
type RendererableContainer = ReactDOMClient.Container;
type HydrateableContainer = Parameters<(typeof ReactDOMClient)["hydrateRoot"]>[0];
export declare function renderAsync<Q extends Queries = typeof queries, Container extends RendererableContainer | HydrateableContainer = HTMLElement, BaseElement extends RendererableContainer | HydrateableContainer = Container>(ui: React.ReactNode, options: RenderOptions<Q, Container, BaseElement>): Promise<RenderResult<Q, Container, BaseElement>>;
export declare function renderAsync(ui: React.ReactNode, options?: Omit<RenderOptions, "queries"> | undefined): Promise<RenderResult>;
export {};
//# sourceMappingURL=renderAsync.d.ts.map