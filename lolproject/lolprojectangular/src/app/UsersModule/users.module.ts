import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';


import { SharedModule } from 'src/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthGuard } from 'src/shared/Utils/auth-guard/auth-guard.service';
import { UsersComponent } from './Components/users/users.component';
import { UsersRoutingModule } from './Routing/users-routing.module';




@NgModule({
  declarations: [
    UsersComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    UsersRoutingModule
  ],
  exports: [ UsersComponent]
})
export class UsersModule { }
