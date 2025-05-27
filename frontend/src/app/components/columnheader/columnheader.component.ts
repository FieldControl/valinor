import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-columnheader',
  imports: [FormsModule],
  templateUrl: './columnheader.component.html',
  styleUrl: './columnheader.component.css'
})
export class ColumnheaderComponent {
  @Input() column: any;
  @Input() isEditing: boolean = false;
  @Input() editedName: string = '';
  
  @Output() editStart = new EventEmitter<void>();
  @Output() save = new EventEmitter<string>();
  @Output() cancel = new EventEmitter<void>();
  @Output() delete = new EventEmitter<void>();

  onSave() {
    if (this.editedName.trim()) {
      this.save.emit(this.editedName);
    }
  }
}
