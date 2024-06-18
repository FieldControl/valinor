import 'reflect-metadata';
export type ResolverTypeFn = (of?: void) => Function;
/**
 * Interface defining options that can be passed to `@Resolve()` decorator
 */
export interface ResolverOptions {
    /**
     * If `true`, type will not be registered in the schema.
     */
    isAbstract?: boolean;
}
/**
 * Object resolver decorator.
 */
export declare function Resolver(): MethodDecorator & ClassDecorator;
/**
 * Object resolver decorator.
 */
export declare function Resolver(name: string): MethodDecorator & ClassDecorator;
/**
 * Object resolver decorator.
 */
export declare function Resolver(options: ResolverOptions): MethodDecorator & ClassDecorator;
/**
 * Object resolver decorator.
 */
export declare function Resolver(classType: Function, options?: ResolverOptions): MethodDecorator & ClassDecorator;
/**
 * Object resolver decorator.
 */
export declare function Resolver(typeFunc: ResolverTypeFn, options?: ResolverOptions): MethodDecorator & ClassDecorator;
//# sourceMappingURL=resolver.decorator.d.ts.map