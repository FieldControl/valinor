import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ColumnModel } from '../../models/kanban.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-edit-column',
  imports: [CommonModule, FormsModule],
  templateUrl: './edit-column.html',
  styleUrl: './edit-column.css'
})
export class EditColumn implements OnInit{
  
  @Input() columnModel!: ColumnModel;
  @Output() columnUpdated = new EventEmitter<ColumnModel>();
  @Output() columnDeleted = new EventEmitter<string>();
  @Output() formClosed = new EventEmitter<void>();
  
  editedTitle: string = '';
  ngOnInit(): void {
    if (this.columnModel){
      this.editedTitle = this.columnModel.title;
    }
  }

  onSave(): void {
    if (this.columnModel.title !== this.editedTitle) {
      const updatedColumn: ColumnModel = {
        ...this.columnModel,
        title: this.editedTitle
      };
      this.columnUpdated.emit(updatedColumn);
    }
    this.formClosed.emit();
  }

  onDelete(): void {
    if (window.confirm('Are you sure?')) {
      this.columnDeleted.emit(this.columnModel.id);
      this.formClosed.emit();
    }
  }
}
