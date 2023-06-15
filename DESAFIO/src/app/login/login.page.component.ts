import { Router } from '@angular/router';
import { Component } from '@angular/core';
import { LoadingController } from '@ionic/angular';

declare function loadCardContent(): any;

@Component({
  selector: 'app-login',
  templateUrl: 'login.page.component.html',
  styleUrls: ['login.page.component.scss'],
})
export class LoginPageComponent {
  username: string = '';
  password: string = '';
  token: string = '';

  constructor(
    private router: Router,
    private loadingController: LoadingController
  ) {}

  ngOnInit(): void {
    loadCardContent();
  }

  async login() {
    // Aqui você pode realizar a validação dos campos e executar a lógica de login
    // Podendo realizar o login para se autenticar em API, depende da lógica
    // Exemplo de validação simples
    if (this.username === 'field' && this.password === 'control') {
      // Login bem-sucedido
      alert('Logado com Sucesso');
      localStorage.setItem('token', generateRandomKey(25));
      const loading = await this.showLoading();

      setTimeout(() => {
        loading.dismiss();
        // Código para mudar de rota
        this.router.navigate(['home']);
      }, 2000);
    } else {
      // Login inválido
      alert('Credenciais inválidas');
      this.username = '';
      this.password = '';
    }

    function generateRandomKey(length: number): string {
      const charset = 'FieldMeACeitaS2';
      const randomValues = new Uint8Array(length);
      crypto.getRandomValues(randomValues);

      let result = '';
      for (let i = 0; i < randomValues.length; i++) {
        const randomIndex = randomValues[i] % charset.length;
        result += charset[randomIndex];
      }
      return result;
    }
  }

  async showLoading() {
    const loading = await this.loadingController.create({
      message: 'Carregando...',
      spinner: 'dots',
      translucent: true,
      cssClass: 'custom-loading',
    });

    await loading.present();
    return loading;
  }

  usuarioAutenticado() {
    if (localStorage.getItem('token') != null) {
      return true;
    } else {
      return false;
    }
  }
}
