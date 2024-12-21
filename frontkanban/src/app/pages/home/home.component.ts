import { Component } from '@angular/core';
import { HeaderComponent } from '../../components/header/header.component';
import { BtnComponent } from '../../components/btn/btn.component';
import { LoginComponent } from '../../components/login/login.component';
import { RegisterComponent } from "../../components/register/register.component";


@Component({
  selector: 'app-home',
  imports: [HeaderComponent, BtnComponent, RegisterComponent],
  standalone: true,
  providers: [],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
registerComponent: any;

}
