/**
 * The API surface of this module has been heavily inspired by the "type-graphql" library (https://github.com/MichalLytek/type-graphql), originally designed & released by Michal Lytek.
 * In the v6 major release of NestJS, we introduced the code-first approach as a compatibility layer between this package and the `@nestjs/graphql` module.
 * Eventually, our team decided to reimplement all the features from scratch due to a lack of flexibility.
 * To avoid numerous breaking changes, the public API is backward-compatible and may resemble "type-graphql".
 */
/**
 * Interface defining options that can be passed to `@InputType()` decorator.
 */
export interface InputTypeOptions {
    /**
     * Description of the input type.
     */
    description?: string;
    /**
     * If `true`, type will not be registered in the schema.
     */
    isAbstract?: boolean;
}
/**
 * Decorator that marks a class as a GraphQL input type.
 */
export declare function InputType(): ClassDecorator;
/**
 * Decorator that marks a class as a GraphQL input type.
 */
export declare function InputType(options: InputTypeOptions): ClassDecorator;
/**
 * Decorator that marks a class as a GraphQL input type.
 */
export declare function InputType(name: string, options?: InputTypeOptions): ClassDecorator;
//# sourceMappingURL=input-type.decorator.d.ts.map