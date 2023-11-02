import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { GithubService } from 'src/app/services/githubService/github-service.service';

@Component({
  selector: 'app-pesquisa',
  templateUrl: './pesquisa.component.html',
  styleUrls: ['./pesquisa.component.css'],
})
export class PesquisaComponent implements OnInit {
  constructor(private githubService: GithubService, private toastr: ToastrService) {}

  //Armazenar a consulta da pesquisa
  query: string = '';

  //Metodo para realizar pesquisas
  onSearch(): void {
    this.githubService
      .searchRepositorios(this.query)
      .catch((error) => this.toastr.error(error));
    this.githubService.page = 1;
  }

  ngOnInit(): void {}
}
