import { CoreHttpService } from './core-http/core-http.service';
import { DynamicComponentCreatorService } from './dynamic-component-creator/dynamic-component-creator.service';

/**
 * Variável utilizada para importar as paginas em um só lugar
 */
export const coreServices: any = [
    CoreHttpService,
    DynamicComponentCreatorService
];


/**
 * @description exportar todas as pastas neste arquivo
 * @example export * from './auth/auth.service';
 * @example export * from './pax/pax.pipe';
 * @example export * from './navbar/navbar.component';
 */

export * from './core-http/core-http.service';
export * from './dynamic-component-creator/dynamic-component-creator.service';
