import { Component, EventEmitter , Output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { KanbanService } from '../kanban/kanban.service';
import { ColumnModel } from '../../models/kanban.model';

@Component({
  selector: 'app-form-column',
  imports: [ReactiveFormsModule],
  templateUrl: './form-column.html',
  styleUrl: './form-column.css'
})
export class FormColumn {
  @Output() columnCreated = new EventEmitter<void>();
  @Output() formCancelled = new EventEmitter<void>();

  columnForm: FormGroup;

  constructor(private kanbanService: KanbanService){
    this.columnForm = new FormGroup({
      title: new FormControl('', Validators.required)
    })
  }

  onSubmit(): void{
    if (this.columnForm.valid){
      const  newColumnData: Omit<ColumnModel, 'id'> = this.columnForm.value;
      this.kanbanService.createColumn(newColumnData).subscribe({
        next: (response) => {
          console.log('Success column created:');
          this.columnCreated.emit();
          this.columnForm.reset();
        }
      });
      } else {
        console.warn('Write in all necessaires fields');
        this.columnForm.markAllAsTouched();
      }
    }
    onCancel(): void {
      this.formCancelled.emit();
      this.columnForm.reset();
  }
}