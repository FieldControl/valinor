import { InjectionToken } from '@angular/core';
export interface IConfig {
    suffix: string;
    prefix: string;
    thousandSeparator: string;
    decimalMarker: '.' | ',';
    clearIfNotMatch: boolean;
    showTemplate: boolean;
    showMaskTyped: boolean;
    placeHolderCharacter: string;
    shownMaskExpression: string;
    dropSpecialCharacters: boolean | string[];
    specialCharacters: string[];
    hiddenInput: boolean | undefined;
    validation: boolean;
    separatorLimit: string;
    allowNegativeNumbers: boolean;
    leadZeroDateTime: boolean;
    patterns: {
        [character: string]: {
            pattern: RegExp;
            optional?: boolean;
            symbol?: string;
        };
    };
}
export declare type optionsConfig = Partial<IConfig>;
export declare const config: InjectionToken<IConfig>;
export declare const NEW_CONFIG: InjectionToken<IConfig>;
export declare const INITIAL_CONFIG: InjectionToken<IConfig>;
export declare const initialConfig: IConfig;
export declare const timeMasks: string[];
export declare const withoutValidation: string[];
