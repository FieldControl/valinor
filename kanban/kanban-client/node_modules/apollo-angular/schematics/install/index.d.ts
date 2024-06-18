import { Rule } from '@angular-devkit/schematics';
import { Schema } from './schema';
export declare function factory(options: Schema): Rule;
export declare function createDependenciesMap(options: Schema): Record<string, string>;
