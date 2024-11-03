import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalEditTaskComponent } from './modal-edit-task.component';

describe('ModalEditTaskComponent', () => {
  let component: ModalEditTaskComponent;
  let fixture: ComponentFixture<ModalEditTaskComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalEditTaskComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalEditTaskComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
