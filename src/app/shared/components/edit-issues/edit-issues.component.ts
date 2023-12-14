import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { iResponseListarIssue } from '../../interfaces/issue.interface';
import { iReponseRepor } from '../../interfaces/repor.interface';
import { iResponseUser } from '../../interfaces/user.interface';
import { IssuesService } from '../../services/issues.service';

@Component({
  selector: 'app-edit-issues',
  templateUrl: './edit-issues.component.html',
  styleUrls: ['./edit-issues.component.scss'],
})
export class EditIssuesComponent implements OnInit {
  @Input() issues!: iResponseListarIssue | any;
  @Input() issueEdit!: number;
  @Input() users!: string;
  @Input() repositorie!: iReponseRepor | any;
  @Input() issueTitulo!: string;
  @Input() issueText!: string;
  @Output() issuesReloadEdit: EventEmitter<boolean> = new EventEmitter();

  formEditIssue!: FormGroup;

  constructor(private form: FormBuilder, private issueService: IssuesService) {}

  ngOnInit(): void {
    this.formEditIssue = this.form.group({
      issueTitle: [this.issueTitulo],
      issueBody: [this.issueText],
    });
  }

  patchIssue(issue: number, issueTitle: string, issueBody: string) {
    let request = {
      owner: this.users,
      repo: this.repositorie,
      title: issueTitle,
      body: issueBody,
    };

    this.issueService
      .patchIssues(this.users, this.repositorie, issue, request)
      .subscribe({
        next: (res: any) => {
          this.issueEdit = 0;
          this.issuesReloadEdit.emit(true);
        },
        error: (error) => {
          Swal.fire({
            title: 'Erro',
            icon: 'error',
            text: 'Não foi possível atualizar issue.',
          });
        },
      });
  }
}
