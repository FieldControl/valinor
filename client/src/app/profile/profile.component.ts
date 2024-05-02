import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from '../auth.service';
import { ChangePasswordDialogComponent } from '../change-password-dialog/change-password-dialog.component';
import { EditProfileDialogComponent } from '../edit-profile-dialog/edit-profile-dialog.component';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  user: any;

  constructor(public dialog: MatDialog, private authService: AuthService) { }

  ngOnInit() {
    this.user = this.authService.user;
  }

  openEditProfileDialog() {
    const dialogRef = this.dialog.open(EditProfileDialogComponent, {
      data: { user: this.user }
    });

    dialogRef.componentInstance.userUpdated.subscribe(updatedUser => {
      this.user = updatedUser;
    });
  }

  openChangePasswordDialog() {
    this.dialog.open(ChangePasswordDialogComponent);
  }
}