import { ButtonLinkMenuComponent } from './../buttons/button-link-menu/button.link.menu.component';
import { CardSimpleComponent } from './../cards/card-simple/card.simple.component';

import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';


import { IonicModule } from '@ionic/angular';


import { ButtonNavigateComponent } from '../buttons/button-navigate/button.navigate.component';
// Importe outros componentes básicos aqui

@NgModule({
  declarations: [
    ButtonNavigateComponent,
    ButtonLinkMenuComponent,

    CardSimpleComponent
    // Adicione outros componentes básicos aqui
  ],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule
    // Adicione outros módulos necessários aqui
  ],
  providers : [

  ],
  exports: [
    ButtonNavigateComponent,
    ButtonLinkMenuComponent,

    CardSimpleComponent,
    // Exporte os componentes básicos para que possam ser usados em outros módulos
  ]
})
export class CoreModule { }
