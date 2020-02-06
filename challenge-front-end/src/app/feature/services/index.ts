import { ResolverService } from './resolver.service';
import { FeatureHttpService } from './feature-http.service';

/**
 * Variável utilizada para importar os serviços em um só lugar
 */
export const featureServices: any = [
    FeatureHttpService,
    ResolverService
];

/**
 * @description exportar todas as pastas neste arquivo
 * @example export * from './auth/auth.service';
 * @example export * from './pax/pax.pipe';
 * @example export * from './navbar/navbar.component';
 */

 export * from './resolver.service';
 export * from './feature-http.service';
