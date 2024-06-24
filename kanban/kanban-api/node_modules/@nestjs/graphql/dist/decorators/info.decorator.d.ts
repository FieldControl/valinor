import { PipeTransform, Type } from '@nestjs/common';
import 'reflect-metadata';
/**
 * Resolver method parameter decorator. Extracts the `Info`
 * object from the underlying platform and populates the decorated
 * parameter with the value of `Info`.
 */
export declare function Info(...pipes: (Type<PipeTransform> | PipeTransform)[]): ParameterDecorator;
//# sourceMappingURL=info.decorator.d.ts.map