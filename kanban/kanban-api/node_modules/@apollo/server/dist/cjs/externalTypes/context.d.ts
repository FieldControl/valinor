export type BaseContext = {};
export type ContextFunction<TIntegrationSpecificArgs extends any[], TContext extends BaseContext = BaseContext> = (...integrationContext: TIntegrationSpecificArgs) => Promise<TContext>;
export type ContextThunk<TContext extends BaseContext = BaseContext> = () => Promise<TContext>;
//# sourceMappingURL=context.d.ts.map