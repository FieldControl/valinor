import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { gitRepositoryModel } from 'src/app/Interfaces/gitRepository.interface';
import { GitRepositoryService } from 'src/app/services/git-repository.service';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.sass']
})
export class MainComponent implements OnInit {

  //Declaração de váriavéis
  repositorys!: gitRepositoryModel[];
  searchParamter!: FormGroup;

  constructor(private gitRepoService: GitRepositoryService) { }

  ngOnInit(): void {
    //Responsável por fazer a validação do campo de formulário
    this.searchParamter = new FormGroup({
      parameter: new FormControl('', [Validators.required])
    });
  }

  createHandler(event: any) {}

  get parameter() {
    //Responsável por passar o valor digitado no campo para a váriavel
    return this.searchParamter.get('parameter')?.value;
  }

  //Método disparado ao realizar a busca.
  submit() {
    //Verificar se há algo digitado no campo, para evitar requests vazios.
    if (this.searchParamter.invalid)
      return;
    
    //Execução do método local
    this.listarRepos(this.parameter);
  }

  listarRepos(parameter: string) {
    //Acessando o Service e chamando o método para que o request seja realizao e retorne os dados
    this.gitRepoService.listarRepos(parameter).subscribe(({ items }) => {
      //Preenchimento da variável local com o retorno da API.
      this.repositorys = items;
    }, err => {
      console.log('No repository found!', err);
    })
  }

}
