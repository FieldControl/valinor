import { DynamicComponent } from './dynamic/dynamic.component';
import { ModalComponent } from './modal/modal.component';

/**
* Variável utilizada para importar os componentes em um só lugar
*/
export const sharedComponents: any = [
    DynamicComponent,
    ModalComponent
];


export const sharedEntryComponents: any = [
    DynamicComponent,
    ModalComponent
];

/**
 * @description exportar todas as pastas neste arquivo
 * @example export * from './auth/auth.service';
 * @example export * from './pax/pax.pipe';
 * @example export * from './navbar/navbar.component';
 */

export * from './dynamic/dynamic.component';
export * from './modal/modal.component';
