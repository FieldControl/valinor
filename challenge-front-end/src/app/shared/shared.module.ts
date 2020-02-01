import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { CustomHttpInterceptor } from 'app/interceptors/custom-http.interceptor';
import { sharedEntryComponents } from 'shared/components';
import { sharedServices } from 'shared/services';
import { sharedComponents } from 'shared/components';
import { sharedDirectives } from 'shared/directives';
import { sharedPipes } from 'shared/pipes';
import { sharedPages } from 'shared/pages';

/**
 * Variável utilizada para importar os módulos em um só lugar
 */
const defaultModules = [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule
];

@NgModule({
    declarations: [
        ...sharedComponents,
        ...sharedDirectives,
        ...sharedPipes,
        ...sharedPages
    ],
    imports: [
        ...defaultModules
    ],
    exports: [
        ...defaultModules,
        ...sharedComponents,
        ...sharedDirectives,
        ...sharedPipes,
        ...sharedPages
    ],
    entryComponents: [
        ...sharedEntryComponents
    ],
    providers: [
        ...sharedServices,
        { provide: HTTP_INTERCEPTORS, useClass: CustomHttpInterceptor, multi: true }
    ]
})
export class SharedModule { }
