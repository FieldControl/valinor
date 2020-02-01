import { ToLowerCasePipe } from './to-lower-case/to-lower-case.pipe';

/**
 * Variável utilizada para importar os pipes em um só lugar
 */
export const sharedPipes: any = [
    ToLowerCasePipe
];

/**
 * @description exportar todas as pastas neste arquivo
 * @example export * from './auth/auth.service';
 * @example export * from './pax/pax.pipe';
 * @example export * from './navbar/navbar.component';
 */

export * from './to-lower-case/to-lower-case.pipe';
