import { IssuesService } from './../../shared/services/issues.service';
import { RepositoriesService } from './../../shared/services/repositories.service';
import { iResponseUser } from '../../shared/interfaces/user.interface';
import { iReponseRepor } from '../../shared/interfaces/repor.interface';
import { UsersService } from './../../shared/services/users.service';
import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { iResponseListarIssue } from 'src/app/shared/interfaces/issue.interface';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-gitsmart',
  templateUrl: './gitsmart.component.html',
  styleUrls: ['./gitsmart.component.scss'],
})
export class GitsmartComponent implements OnInit {
  formUser!: FormGroup;

  repositories!: iReponseRepor | any;

  issues?: iResponseListarIssue;

  users!: string;

  repositorie!: any;

  foto: string =
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTXjaeoLrxQxqc3US06hi8YnqR9u5laX9VG9-z3Nij047Xs18wyJjvLgi5AqJKNYUek_pk&usqp=CAU';

  constructor(
    private userService: UsersService,
    private form: FormBuilder,
    private reporsitoriesService: RepositoriesService,
    private issueService: IssuesService
  ) { }

  ngOnInit(): void {
    this.formUser = this.form.group({
      user: ['', Validators.required],
    });
  }

  searchUser(text: string) {
    this.userService.searchUser(text).subscribe({
      next: (res: iResponseUser) => {
        this.users = res.login;
        this.foto = res.avatar_url;
        this.searchRepor(text);
      },
      error: (error) => {
        Swal.fire({
          title: 'Erro',
          icon: 'error',
          text: 'Indisponível.',
        });
      },
    });
  }

  searchRepor(user: string) {
    this.reporsitoriesService.getRepositories(user).subscribe({
      next: (res: iReponseRepor) => {
        this.repositories = res;
      },
      error: (error) => {
        Swal.fire({
          title: 'Erro',
          icon: 'error',
          text: 'Não foi possível mostrar repositórios.',
        });
      },
    });
  }
}
