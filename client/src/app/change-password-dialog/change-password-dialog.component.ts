import { Component, ViewChild } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-change-password-dialog',
  templateUrl: './change-password-dialog.component.html',
  styleUrls: ['./change-password-dialog.component.css']
})
export class ChangePasswordDialogComponent {
  @ViewChild('passwordForm') passwordForm!: NgForm;
  currentPassword = '';
  newPassword = '';
  confirmNewPassword = ';'

  constructor(public dialogRef: MatDialogRef<ChangePasswordDialogComponent>) { }

  changePassword() {
    if (this.passwordForm.valid) {
      // Implemente a lógica para alterar a senha aqui
      // Por exemplo, se você estiver usando o serviço de autenticação do Angular:
      // this.authService.changePassword(this.newPassword);

      console.log('Senha alterada para:', this.newPassword);
      this.dialogRef.close();
    }
  }
}