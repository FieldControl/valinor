import { ModuleWithProviders } from '@angular/core';
import { optionsConfig } from './config';
import * as ɵngcc0 from '@angular/core';
import * as ɵngcc1 from './mask.directive';
import * as ɵngcc2 from './mask.pipe';
export declare class NgxMaskModule {
    static forRoot(configValue?: optionsConfig | (() => optionsConfig)): ModuleWithProviders<NgxMaskModule>;
    static forChild(): ModuleWithProviders<NgxMaskModule>;
    static ɵfac: ɵngcc0.ɵɵFactoryDeclaration<NgxMaskModule, never>;
    static ɵmod: ɵngcc0.ɵɵNgModuleDeclaration<NgxMaskModule, [typeof ɵngcc1.MaskDirective, typeof ɵngcc2.MaskPipe], never, [typeof ɵngcc1.MaskDirective, typeof ɵngcc2.MaskPipe]>;
    static ɵinj: ɵngcc0.ɵɵInjectorDeclaration<NgxMaskModule>;
}
/**
 * @internal
 */
export declare function _configFactory(initConfig: optionsConfig, configValue: optionsConfig | (() => optionsConfig)): optionsConfig;

//# sourceMappingURL=ngx-mask.module.d.ts.map