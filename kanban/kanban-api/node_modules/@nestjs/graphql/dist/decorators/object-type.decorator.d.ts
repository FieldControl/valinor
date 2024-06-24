/**
 * The API surface of this module has been heavily inspired by the "type-graphql" library (https://github.com/MichalLytek/type-graphql), originally designed & released by Michal Lytek.
 * In the v6 major release of NestJS, we introduced the code-first approach as a compatibility layer between this package and the `@nestjs/graphql` module.
 * Eventually, our team decided to reimplement all the features from scratch due to a lack of flexibility.
 * To avoid numerous breaking changes, the public API is backward-compatible and may resemble "type-graphql".
 */
/**
 * Interface defining options that can be passed to `@ObjectType()` decorator
 */
export interface ObjectTypeOptions {
    /**
     * Description of the input type.
     */
    description?: string;
    /**
     * If `true`, type will not be registered in the schema.
     */
    isAbstract?: boolean;
    /**
     * Interfaces implemented by this object type.
     */
    implements?: Function | Function[] | (() => Function | Function[]);
    /**
     * If `true`, direct descendant classes will inherit the parent's description if own description is not set.
     * Also works on classes marked with `isAbstract: true`.
     */
    inheritDescription?: boolean;
}
/**
 * Decorator that marks a class as a GraphQL type.
 */
export declare function ObjectType(): ClassDecorator;
/**
 * Decorator that marks a class as a GraphQL type.
 */
export declare function ObjectType(options: ObjectTypeOptions): ClassDecorator;
/**
 * Decorator that marks a class as a GraphQL type.
 */
export declare function ObjectType(name: string, options?: ObjectTypeOptions): ClassDecorator;
//# sourceMappingURL=object-type.decorator.d.ts.map