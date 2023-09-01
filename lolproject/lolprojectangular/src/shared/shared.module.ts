import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonAccessComponent } from './Components/button-access-login/button-access-login.component';
import { ReactiveFormsModule, FormControl, FormsModule } from '@angular/forms';
import { TextInputComponent } from './Components/input-text/input-text.component';
import { ButtonNavbar } from './Components/button-navbar/button-navbar.component';
import { LabelText } from './Components/label-text/label-text.component';
import { BaseComponent } from './Components/base-component/base-component.component';
import { InputTextNewRegister } from './Components/input-text-new-register/input-text-new-register';
import { ButtonSave } from './Components/button-save/button-save.component';


@NgModule({
  declarations: [
    ButtonAccessComponent,
    TextInputComponent,
    ButtonNavbar,
    BaseComponent,
    LabelText,
    InputTextNewRegister,
    ButtonSave,

  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule
  ],
  exports: [
    ButtonAccessComponent,
    TextInputComponent,
    ButtonNavbar,
    BaseComponent,
    LabelText,
    InputTextNewRegister,
    ButtonSave,

  ]
})
export class SharedModule {
}
