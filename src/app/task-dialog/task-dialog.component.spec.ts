import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TaskDialogComponent } from './task-dialog.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatDialogModule} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field'; 

describe('Componente para criar e editar tarefa:', () => {

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TaskDialogComponent],
      imports: [MatDialogModule, MatFormFieldModule],
      providers: [
        { provide: MatDialogRef, useValue: {} },
        { provide: MAT_DIALOG_DATA, useValue: {} }
      ]
    })
    .compileComponents();
  });

  it('Criar componente de criar ou editar tarefa', () => {
    const fixture = TestBed.createComponent(TaskDialogComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });
});
