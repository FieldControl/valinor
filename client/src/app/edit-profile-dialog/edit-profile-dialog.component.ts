import { Component, Inject, Output, EventEmitter } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NgForm } from '@angular/forms';
import { ProfileService } from '../profile.service';

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
    private profileService: ProfileService
  ) {
    if (data && data.user) {
      this.user = { ...data.user };
    }
  }

  saveChanges(form: NgForm) {
    if (form.valid) {
      
      this.profileService.updatedUser(this.user).subscribe({
        next: () => {
          console.log('Dados alterados com sucesso!');
        },
        error: err => console.error('Erro ao atualizar usuário:', err)
      });

      this.profileService.updatedUser(this.user);
      this.userUpdated.emit(this.user);
      this.dialogRef.close(this.user);
    }
  }
}