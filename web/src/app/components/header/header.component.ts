import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

import { ColumnsService } from '../../services/columns.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  formGroup!: FormGroup;

  constructor(
    private columnsService: ColumnsService,
    private formBuilder: FormBuilder
  ) {
    this.formGroup = this.formBuilder.group({
      title: '',
    });
  }

  createColumn() {
    this.columnsService.createColumn({
      title: this.formGroup.value.title,
    });

    this.formGroup.setValue({ title: '' });
  }
}
