import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AutenticarService } from '../../../compartilhado/servicos/autenticar.service'; 

@Component({
  selector: 'app-cabecalho',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './cabecalho.component.html',
  styleUrl: './cabecalho.component.scss',
})
export class CabecalhoComponent {
  private readonly autenticarService = inject(AutenticarService);
  private readonly router = inject(Router);

  get logado() {
    return this.autenticarService.token;
  }

  sair() {
    this.autenticarService.token = '';
    this.router.navigateByUrl('/login');
  }
}
