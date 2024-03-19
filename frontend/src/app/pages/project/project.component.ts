import {
  ChangeDetectionStrategy,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../services/api.service';

interface IResponse {
  id: string;
  title: string;
  Column: {
    id: string;
    title: string;
    projectId: string;
    Task: {
      id: string;
      title: string;
      columnId: string;
      projectId: string;
      description: string;
      archived: boolean;
    };
    Archive: {
      id: string;
      title: string;
      columnId: string;
      projectId: string;
      description: string;
      archived: boolean;
    };
  };
}

@Component({
  selector: 'app-project',
  standalone: true,
  templateUrl: './project.component.html',
  styleUrl: './project.component.css',
  imports: [MatGridListModule, MatIconModule, ReactiveFormsModule, CommonModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.Default,
})
export class ProjectComponent implements OnInit {
  @ViewChild('myModal') myModal!: ElementRef;
  @ViewChild('myCardModal') myCardModal!: ElementRef;
  listForm: FormGroup = this.formBuilder.group({
    title: ['', [Validators.required]],
  });
  cardModalForm: FormGroup = this.formBuilder.group({
    titleCard: ['', [Validators.required]],
    description: ['', [Validators.required]],
    archived: ['false', [Validators.required]],
  });
  isSubmitting = false;
  projectId: string | null = null;
  columnId: string | null = null;
  dataColumn: IResponse['Column'] | any;
  dataTasks: { [columnId: string]: IResponse['Column']['Task'][] } = {};

  constructor(private route: ActivatedRoute, private formBuilder: FormBuilder, private api: ApiService) {}

  ngOnInit() {
    this.projectId = this.route.snapshot.paramMap.get('id');

    setInterval(() => this.getProjectById(), 3000);
  }

  getProjectById() {
    this.api.getProjectById(this.projectId).subscribe({
      next: (response: IResponse) => {
        this.dataColumn = response.Column;
        for (const column of this.dataColumn) {
          this.dataTasks[column.id] = [];
          for (const task of column.Task) {
            this.dataTasks[column.id].push(task);
          }
        }
      },
    });
  }

  selectColumn(id: string) {
    this.columnId = id;
  }

  createCard() {
    if (!this.listForm.valid) return;
    this.isSubmitting = true;
    const { ...rest } = this.listForm.value;
    const { archived } = this.listForm.value;
    console.log(this.columnId);

    if (archived === 'true') {
      rest.archived = true;
    } else {
      rest.archived = false;
    }

    this.api.createCard(rest, this.projectId as string, this.columnId as string).subscribe({
      next: (response) => {
        this.closeCardModal();
        this.isSubmitting = false;
      },
      error: () => {
        this.isSubmitting = false;
      },
    });
  }

  createColumn() {
    if (!this.listForm.valid) return;
    this.isSubmitting = true;
    const { ...rest } = this.listForm.value;

    this.api.column(rest, this.projectId as string).subscribe({
      next: (response) => {
        this.closeModal();
        this.isSubmitting = false;
      },
      error: () => {
        this.isSubmitting = false;
      },
    });
  }

  openCardModal() {
    this.myCardModal.nativeElement.style.display = 'block';
  }

  closeCardModal() {
    this.myCardModal.nativeElement.style.display = 'none';
  }

  openModal() {
    this.myModal.nativeElement.style.display = 'block';
  }

  closeModal() {
    this.myModal.nativeElement.style.display = 'none';
  }
}
