import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AuthRoutingModule } from './Routing/auth-routing.module';
import { AuthLoginComponent } from './Components/auth-login/auth-login.component'
import { SharedModule } from 'src/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthGuard } from 'src/shared/Utils/auth-guard/auth-guard.service';




@NgModule({
  declarations: [
    AuthLoginComponent
  ],
  imports: [
    CommonModule,
    AuthRoutingModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule


  ],
  exports: [AuthLoginComponent]
})
export class AuthModule { }
