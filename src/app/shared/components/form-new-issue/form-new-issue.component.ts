import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import {
  iResponseCreateIssue,
  iResponseListarIssue,
} from '../../interfaces/issue.interface';
import { iReponseRepor } from '../../interfaces/repor.interface';
import { iResponseUser } from '../../interfaces/user.interface';
import { IssuesService } from '../../services/issues.service';

@Component({
  selector: 'app-form-new-issue',
  templateUrl: './form-new-issue.component.html',
  styleUrls: ['./form-new-issue.component.scss'],
})
export class FormNewIssueComponent implements OnInit {
  visible: boolean = false;
  @Input() users!: string;
  @Input() repositorie!: iReponseRepor | any;
  @Output() issuesReload: EventEmitter<boolean> = new EventEmitter();

  formIssue!: FormGroup;

  constructor(private issueService: IssuesService, private form: FormBuilder) {}

  ngOnInit(): void {
    this.formIssue = this.form.group({
      issueTitle: ['', Validators.required],
      issueBody: ['', Validators.required],
    });
  }

  openForm() {
    this.visible = !this.visible;
  }

  addIssue(issueTitle: string, issueBody: string) {
    let request = {
      owner: this.users,
      repo: this.repositorie,
      title: issueTitle,
      body: issueBody,
    };

    this.issueService
      .createIssues(this.users, this.repositorie, request)
      .subscribe({
        next: (res: iResponseCreateIssue) => {
          this.issuesReload.emit(true);
        },
        error: (error) => {
          Swal.fire({
            title: 'Erro',
            icon: 'error',
            text: 'Não foi possível criar issue.',
          });
        },
      });
  }
}
