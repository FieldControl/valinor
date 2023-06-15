import { IonicModule } from '@ionic/angular';
import { NavBarComponent } from './../navbar/navbar.component';
import { CoreModule } from '../../../shared/coreShared/core.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NavigationComponent } from './navigation.component';
import { FooterComponent } from '../footer/footer.component';

@NgModule({
  declarations: [NavigationComponent, NavBarComponent, FooterComponent],
  exports: [NavigationComponent],
  imports: [
    CommonModule,

    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    CoreModule,
  ],
})
export class NavigationModule {}
