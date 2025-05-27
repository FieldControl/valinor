import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Task } from '../../models/task.model';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-task',
  imports: [FormsModule],
  standalone: true,
  templateUrl: './task.component.html',
  styleUrls: ['./task.component.css']
})
export class TaskComponent {
  @Input() task!: Task;
  @Input() isEditing!: boolean;
  @Input() editedName!: string;
  
  @Output() edit = new EventEmitter<void>();
  @Output() save = new EventEmitter<string>();
  @Output() cancel = new EventEmitter<void>();
  @Output() delete = new EventEmitter<void>();

  onSave() {
    this.save.emit(this.editedName);
  }
}