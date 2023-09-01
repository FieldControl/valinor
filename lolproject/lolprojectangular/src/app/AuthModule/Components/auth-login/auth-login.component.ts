import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import { AbstractControl, FormBuilder, FormControl } from '@angular/forms';
import { BaseComponent } from '../../../../shared/Components/base-component/base-component.component';
import { AuthService } from '../../Services/auth.service';
import { Router } from '@angular/router';
import { TokenGeneratorService } from 'src/shared/Utils/token-generator/token-generator.service';
import { NavigationComponent } from 'src/app/NavigationModule/Components/navigation/navigation.component';

@Component({
  selector: 'app-auth-login',
  templateUrl: './auth-login.component.html',
  styleUrls: ['./auth-login.component.scss'],
})
export class AuthLoginComponent extends BaseComponent implements AfterViewInit {
  @ViewChild('myVideoLogin') videoElement!: ElementRef;
  usernameControl: FormControl = new FormControl();
  passwordControl: FormControl = new FormControl();

  tokenSpect?: string = ''

  constructor(
    public formBuilder?: FormBuilder,
    public authService?: AuthService,
    public tokenGeneratorService?: TokenGeneratorService,
    public navigationCOmponent?: NavigationComponent,
    public router?: Router
  ) {
    super();

    this.formCreate = this.formBuilder?.group({
      username: this.usernameControl,
      password: this.passwordControl,
    });
  }

  ngAfterViewInit(): void {
    this.playVideo();
    localStorage.removeItem('token')
    this.navigationCOmponent?.verifyTokenInLocalStorage();
  }

  login() {
    this.authService?.login(this.formCreate?.value.username, this.formCreate?.value.password)

      .subscribe((user) => {
        if (user.length > 0) {
          alert('LOGADO COM SUCESSO !');
          var token = this.tokenGeneratorService?.generateRandomKey()
          this.tokenSpect = token
          localStorage.setItem('token',token!)
          this.navigationCOmponent?.verifyTokenInLocalStorage();
          this.router?.navigate(['home']);
        } else {
          alert('USUÁRIO OU SENHA ESTÃO INCORRETOS !');
        }
      });
  }

  userAutenticate(){
    if(localStorage.getItem('token') != null) {
      return true;
    }
    else {
      return false;
    }
  }

  playVideo() {
    const video: HTMLVideoElement = this.videoElement.nativeElement;
    if (video.paused) {
      video.play();
    }
  }
}
