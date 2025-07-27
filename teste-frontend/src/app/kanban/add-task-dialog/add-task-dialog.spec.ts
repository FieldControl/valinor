import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AddTaskDialog } from './add-task-dialog';
import { MatDialogRef } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';

describe('AddTaskDialog', () => {
  let component: AddTaskDialog;
  let fixture: ComponentFixture<AddTaskDialog>;
  let dialogRefSpy: jasmine.SpyObj<MatDialogRef<AddTaskDialog>>;

  beforeEach(async () => {
    dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);

    await TestBed.configureTestingModule({
      imports: [
        AddTaskDialog,
        FormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatButtonModule,
        NoopAnimationsModule,
      ],
      providers: [{ provide: MatDialogRef, useValue: dialogRefSpy }],
    }).compileComponents();

    fixture = TestBed.createComponent(AddTaskDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have empty form initially', () => {
    expect(component.name).toBe('');
    expect(component.desc).toBe('');
    expect(component.step).toBe(0);
  });

  it('should call dialogRef.close with no args on cancel', () => {
    component.onCancel();
    expect(dialogRefSpy.close).toHaveBeenCalledWith();
  });

  it('should call dialogRef.close with form data on add', () => {
    component.name = 'Task name';
    component.desc = 'Task desc';
    component.step = 1;

    component.onAdd();

    expect(dialogRefSpy.close).toHaveBeenCalledWith({
      name: 'Task name',
      desc: 'Task desc',
      step: 1,
    });
  });
});
