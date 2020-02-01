import { SharedHttpService } from './shared-http/shared-http.service';

/**
 * Variável utilizada para importar os services em um só lugar
 */
export const sharedServices: any = [
    SharedHttpService
]

/**
 * @description exportar todas as pastas neste arquivo
 * @example export * from './auth/auth.service';
 * @example export * from './pax/pax.pipe';
 * @example export * from './navbar/navbar.component';
 */

export * from './shared-http/shared-http.service';
