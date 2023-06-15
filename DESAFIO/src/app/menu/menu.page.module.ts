import { CoreModule } from '../../shared/coreShared/core.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { MenuPageComponent } from './menu.page.component';

import { MenuPageRoutingModule } from './menu.page.routing.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    CoreModule,
    IonicModule,
    MenuPageRoutingModule,
  ],
  declarations: [MenuPageComponent],
})
export class MenuPageModule {}
