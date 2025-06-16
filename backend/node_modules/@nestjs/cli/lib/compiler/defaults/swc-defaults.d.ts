import * as ts from 'typescript';
import { Configuration } from '../../configuration';
export declare const swcDefaultsFactory: (tsOptions?: ts.CompilerOptions, configuration?: Configuration) => {
    swcOptions: {
        sourceMaps: string | boolean | undefined;
        module: {
            type: string;
        };
        jsc: {
            target: string;
            parser: {
                syntax: string;
                decorators: boolean;
                dynamicImport: boolean;
            };
            transform: {
                legacyDecorator: boolean;
                decoratorMetadata: boolean;
                useDefineForClassFields: boolean;
            };
            keepClassNames: boolean;
            baseUrl: string | undefined;
            paths: ts.MapLike<string[]> | undefined;
        };
        minify: boolean;
        swcrc: boolean;
    };
    cliOptions: {
        outDir: string;
        filenames: string[];
        sync: boolean;
        extensions: string[];
        copyFiles: boolean;
        includeDotfiles: boolean;
        quiet: boolean;
        watch: boolean;
        stripLeadingPaths: boolean;
    } | {
        swcrcPath?: string;
        outDir: string;
        filenames: string[];
        sync: boolean;
        extensions: string[];
        copyFiles: boolean;
        includeDotfiles: boolean;
        quiet: boolean;
        watch: boolean;
        stripLeadingPaths: boolean;
    } | {
        configPath?: string;
        outDir: string;
        filenames: string[];
        sync: boolean;
        extensions: string[];
        copyFiles: boolean;
        includeDotfiles: boolean;
        quiet: boolean;
        watch: boolean;
        stripLeadingPaths: boolean;
    };
};
