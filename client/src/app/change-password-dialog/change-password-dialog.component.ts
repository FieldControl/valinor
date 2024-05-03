import { Component, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { ProfileService } from '../profile.service';

@Component({
  selector: 'app-change-password-dialog',
  templateUrl: './change-password-dialog.component.html',
  styleUrls: ['./change-password-dialog.component.css']
})
export class ChangePasswordDialogComponent {
  @ViewChild('passwordForm') passwordForm!: NgForm;
  currentPassword = '';
  newPassword = '';
  confirmNewPassword = '';
  profileService: ProfileService;

  constructor(public dialogRef: MatDialogRef<ChangePasswordDialogComponent>, profileService: ProfileService) {
    this.profileService = profileService;
  }

  changePassword() {
    if (this.passwordForm.valid) {
      this.profileService.updatedUser(this.newPassword).subscribe({
        next: () => {
          console.log('Dados alterados com sucesso!');
        },
        error: err => console.error('Erro ao atualizar usuário:', err)
      });

      console.log('Senha alterada para:', this.newPassword);
      this.dialogRef.close();
    }
  }
}
