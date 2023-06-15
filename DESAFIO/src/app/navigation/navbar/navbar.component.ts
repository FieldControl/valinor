import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-nav-bar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavBarComponent implements OnInit {
  currentRoute: string = '';

  constructor(
    private router: Router,
    private loadingController: LoadingController
  ) {}

  ngOnInit(): void {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.currentRoute = event.url;
        console.log(event.url);
      }
    });
  }

  async logout() {
    const loading = await this.showLoading();

    setTimeout(() => {
      loading.dismiss();
      // Código para mudar de rota
      localStorage.removeItem('token');
      this.router.navigate(['']);
    }, 2000);
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

  navigateToHome() {
    this.router.navigate(['home']);
  }
}
