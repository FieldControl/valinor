import { AuthGuard } from './../../shared/services/guard.service';
import { CoreModule } from '../../shared/coreShared/core.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { LoginPageComponent } from './login.page.component';

import { LoginPageRoutingModule } from './login.page.routing.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    CoreModule,
    IonicModule,
    LoginPageRoutingModule,
  ],
  declarations: [LoginPageComponent],
})
export class LoginPageModule {}
