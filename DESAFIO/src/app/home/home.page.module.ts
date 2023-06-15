import { CoreModule } from '../../shared/coreShared/core.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { HomePageComponent } from './home.page.component';

import { HomePageRoutingModule } from './home.page.routing.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    CoreModule,
    IonicModule,
    HomePageRoutingModule
  ],
  declarations: [HomePageComponent]
})
export class HomePageModule {}
