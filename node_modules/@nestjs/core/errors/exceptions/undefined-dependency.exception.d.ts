import { InjectorDependencyContext } from '../../injector/injector';
import { Module } from '../../injector/module';
import { RuntimeException } from './runtime.exception';
export declare class UndefinedDependencyException extends RuntimeException {
    constructor(type: string, undefinedDependencyContext: InjectorDependencyContext, moduleRef?: Module);
}
