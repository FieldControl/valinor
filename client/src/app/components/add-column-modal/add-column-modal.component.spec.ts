import { TestBed, ComponentFixture } from '@angular/core/testing';
import { AddColumnModalComponent } from './add-column-modal.component';
import { ReactiveFormsModule } from '@angular/forms';
import { ColumnService } from '../../services/column.service';
import { Apollo } from 'apollo-angular';
import { of } from 'rxjs';

describe('AddColumnModalComponent', () => {
  let component: AddColumnModalComponent;
  let fixture: ComponentFixture<AddColumnModalComponent>;
  let mockColumnService: jasmine.SpyObj<ColumnService>;
  let mockApollo: jasmine.SpyObj<Apollo>;

  beforeEach(() => {
    mockColumnService = jasmine.createSpyObj('ColumnService', ['createColumn']);
    mockApollo = jasmine.createSpyObj('Apollo', ['mutate']);

    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, AddColumnModalComponent],
      providers: [
        { provide: ColumnService, useValue: mockColumnService },
        { provide: Apollo, useValue: mockApollo },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AddColumnModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });


  it('deve criar o componente', () => {
    expect(component).toBeTruthy();
  });

  it('deve emitir o evento closeAddColumnEvent ao fechar o modal', () => {
    spyOn(component.closeAddColumnEvent, 'emit');
    component.closeAddColumnModal();
    expect(component.closeAddColumnEvent.emit).toHaveBeenCalled();
  });

  it('deve invalidar o formulário quando os campos estiverem vazios', () => {
    component.columnForm.controls['columnName'].setValue('');
    component.columnForm.controls['color'].setValue('');
    expect(component.columnForm.valid).toBeFalse();
  });

  it('deve validar o formulário quando os campos estiverem preenchidos', () => {
    component.columnForm.controls['columnName'].setValue('Nova Coluna');
    component.columnForm.controls['color'].setValue('#ffaa00');
    expect(component.columnForm.valid).toBeTrue();
  });
});
