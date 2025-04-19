import { Component } from '@angular/core';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UserService } from '../../../service/user.service';

@Component({
  selector: 'app-dialog-register',
  templateUrl: './dialog-register.component.html',
  styleUrl: './dialog-register.component.scss',
  imports:[
    CommonModule,
    FormsModule,          
    MatDialogModule
  ],
})
export class DialogRegisterComponent {
  public serviceUser = new UserService
  

  constructor(private _dialogRef: MatDialogRef<DialogRegisterComponent>) {
   
  }

  async register(form: NgForm) {
    this.serviceUser.register(form)
    
  }
  close() {
    this._dialogRef.close();
  }
}
