import { Component, Inject, Output, EventEmitter } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NgForm } from '@angular/forms';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-edit-profile-dialog',
  templateUrl: './edit-profile-dialog.component.html',
  styleUrls: ['./edit-profile-dialog.component.css']
})
export class EditProfileDialogComponent {
  user = { name: '', email: '' };
  @Output() userUpdated = new EventEmitter<any>();

  constructor(
    public dialogRef: MatDialogRef<EditProfileDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private authService: AuthService
  ) {
    if (data && data.user) {
      this.user = { ...data.user };
    }
  }

  saveChanges(form: NgForm) {
    if (form.valid) {
      // Implementar a lógica para salvar as alterações aqui

      this.authService.updatedUser(this.user);
      this.userUpdated.emit(this.user);
      this.dialogRef.close(this.user);
    }
  }
}