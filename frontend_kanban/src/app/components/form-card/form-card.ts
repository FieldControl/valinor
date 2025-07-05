import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms'; 
import { KanbanService } from '../kanban/kanban.service';
import { CardModel } from '../../models/kanban.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-form-card',
  standalone: true, 
  imports: [ReactiveFormsModule, CommonModule], 
  templateUrl: './form-card.html',
  styleUrl: './form-card.css'
})

export class FormCard implements OnInit {
  @Input() initialColumnId!: string;
  @Output() cardCreated = new EventEmitter<void>();
  @Output() formCancelled = new EventEmitter<void>();

  cardForm: FormGroup;

  constructor(private kanbanService: KanbanService) {
    this.cardForm = new FormGroup({
      title: new FormControl('', Validators.required),
      description: new FormControl(''),
      columnId: new FormControl(null, Validators.required)
    });
  }

  ngOnInit(): void {
    if (this.initialColumnId !== null) {
      this.cardForm.get('columnId')?.setValue(this.initialColumnId);
    }
  }

  onSubmit(): void {
    if (this.cardForm.valid) {
      const newCardData: Omit<CardModel, 'id'> = this.cardForm.value;

      this.kanbanService.createCard(newCardData).subscribe({
        next: (response) => {
          console.log('Success card created:');
          this.cardCreated.emit();
          this.cardForm.reset();
        },
        error: (error) => {
          console.error('Error to create', error)
        }
      });

      } else {
        console.warn('Write in all necessaires fields');
        this.cardForm.markAllAsTouched();
      }
    }

  onCancel(): void {
    this.formCancelled.emit();
    this.cardForm.reset();
  }
}