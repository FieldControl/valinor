import { Component, inject } from '@angular/core';
import { HeaderComponent } from '../../components/header/header.component';
import { DialogRegisterComponent } from '../../components/dialog/dialog-register/dialog-register.component';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { FormsModule, NgForm } from '@angular/forms';
import { UserService } from '../../service/user.service';

@Component({
  selector: 'app-home',
  imports: [HeaderComponent, CommonModule, MatDialogModule, FormsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  public serviceUser = new UserService
  constructor( ) {
    
  }
  #dialog = inject(MatDialog);
  public openDialog() {
    this.#dialog.open(DialogRegisterComponent);
  }

  login(form: NgForm){
    this.serviceUser.login(form) 
  }
  
}
