import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import * as moment from 'moment';
import { ApiGithubService } from 'src/app/services/api-github.service';

@Component({
  selector: 'app-lista-issues',
  templateUrl: './lista-issues.component.html',
  styleUrls: ['./lista-issues.component.css']
})
export class ListaIssuesComponent implements OnInit {

  nomeRepositorio = ''
  issues = [] as any
  exibirPaginacao = false
  totalIssues = 0
  loader = false
  page = 1
  exibirMensagemDeErro = false
  constructor(
    private activatedRoute: ActivatedRoute,
    private serviceGit: ApiGithubService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.activatedRoute.params.subscribe(params => {
      this.nomeRepositorio =  params['full_name'];
      this.listarIssues()
    })
  }

  listarIssues(){
    this.loader = true
    this.resetarVariaveisAoListar()
    const params = this.parametros(this.page);
    this.serviceGit.listaIssues(this.nomeRepositorio, params).subscribe((resp:any) => {
      const { items, total_count } = resp
      this.loader = false
      this.issues = items
      this.totalIssues = total_count
      if (total_count > 0) {
        this.exibirPaginacao = true
      }
    }, err => {
      this.exibirPaginacao = false
      this.loader = false
      this.exibirMensagemDeErro = true
    })
  }

  parametros(page: number): any {
    let params: any = {};

    if (page) {
      params[`page`] = page;
    }

    return params;
  }

  mudarPagina(event: number): void {
    this.page = event;
    this.listarIssues();
  }

  calcularDiferenca(dataPassada: any) {
    moment.locale('pt-br')
    const dataFormatada = moment(dataPassada).format('YYYYMMDD')
    return moment(dataFormatada, "YYYYMMDD").fromNow()
  }

  resetarVariaveisAoListar() {
    this.exibirMensagemDeErro = false
    this.exibirPaginacao = false
    this.loader = true
    this.issues = []
    this.totalIssues = 0
  }

  voltar(){
    this.router.navigate(['/'])
  }

}
