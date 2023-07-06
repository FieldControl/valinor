import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { ApiGithubService } from 'src/app/services/api-github.service';
import * as moment from 'moment';
import { FormatarNumerosService } from 'src/app/services/formatar-numeros.service';

@Component({
  selector: 'app-lista-repositorios',
  templateUrl: './lista-repositorios.component.html',
  styleUrls: ['./lista-repositorios.component.css']
})
export class ListaRepositoriosComponent implements OnInit {

  repositorios = [] as any
  form: FormGroup
  loader = false;
  totalRepositorios = 0
  page = 1
  exibirMensagemDeErro = false
  exibirPaginacao = false
  exibirIssues = false
  issues = ''
  constructor(
    private serviceGit: ApiGithubService,
    private fb: FormBuilder,
    private formataNumeroService: FormatarNumerosService
  ) {
    this.form = fb.group({
      repositorio: new FormControl('', [Validators.required, Validators.pattern(/^\S.*\S$/)])
    })
  }

  ngOnInit(): void {
  }

  listaRepositorios() {
    this.resetarVariaveisAoListar()
    const params = this.parametros(this.page);
    this.serviceGit.listaRepositorios(this.form.get('repositorio')?.value, params).subscribe((resp: any) => {
      this.loader = false
      const { items, total_count } = resp
      if (total_count > 0) {
        this.exibirPaginacao = true
      }
      this.totalRepositorios = total_count
      this.repositorios = items
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
    this.listaRepositorios();
  }

  codificaNomeRepositorio(nomeERepositorio: string) {
    return encodeURIComponent(nomeERepositorio)
  }

  formataNumero(numero: number): string {
    return this.formataNumeroService.formataNumero(numero)
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
    this.repositorios = []
    this.totalRepositorios = 0
  }
}
