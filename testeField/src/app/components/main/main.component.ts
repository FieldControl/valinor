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

  repositorys!: gitRepositoryModel[];
  searchParamter!: FormGroup;

  constructor(private gitRepoService: GitRepositoryService) { }

  ngOnInit(): void {
    this.searchParamter = new FormGroup({
      parameter: new FormControl('', [Validators.required])
    });
  }

  createHandler(event: any) {}

  get parameter() {
    return this.searchParamter.get('parameter')?.value;
  }

  submit() {
    if (this.searchParamter.invalid)
      return;
    
    this.listarRepos(this.parameter);
  }

  listarRepos(parameter: string) {
    this.gitRepoService.listarRepos(parameter).subscribe(({ items }) => {
      this.repositorys = items;
    }, err => {
      console.log('No repository found!', err);
    })
  }

}
