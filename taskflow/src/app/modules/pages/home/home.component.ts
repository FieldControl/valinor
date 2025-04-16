import { Component, inject } from '@angular/core';
import { HeaderComponent } from '../../components/header/header.component';
import { DialogRegisterComponent } from '../../components/dialog/dialog-register/dialog-register.component';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogModule } from "@angular/material/dialog"
import { GoogleBtnComponent } from "../../components/google-btn/google-btn.component";

@Component({
  selector: 'app-home',
  imports: [HeaderComponent, CommonModule, MatDialogModule, GoogleBtnComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  #dialog = inject(MatDialog);
  public openDialog(){
    this.#dialog.open(DialogRegisterComponent)
  }

  //item a se fazer
  clickGoogle(){

  }
}
