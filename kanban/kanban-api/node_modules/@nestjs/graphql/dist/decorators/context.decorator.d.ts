import { PipeTransform, Type } from '@nestjs/common';
import 'reflect-metadata';
/**
 * Resolver method parameter decorator. Extracts the `Context`
 * object from the underlying platform and populates the decorated
 * parameter with the value of `Context`.
 */
export declare function Context(): ParameterDecorator;
/**
 * Resolver method parameter decorator. Extracts the `Context`
 * object from the underlying platform and populates the decorated
 * parameter with the value of `Context`.
 */
export declare function Context(...pipes: (Type<PipeTransform> | PipeTransform)[]): ParameterDecorator;
/**
 * Resolver method parameter decorator. Extracts the `Context`
 * object from the underlying platform and populates the decorated
 * parameter with the value of `Context`.
 */
export declare function Context(property: string, ...pipes: (Type<PipeTransform> | PipeTransform)[]): ParameterDecorator;
//# sourceMappingURL=context.decorator.d.ts.map