import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalAddTaskComponent } from './modal-add-task.component';

describe('ModalAddTaskComponent', () => {
  let component: ModalAddTaskComponent;
  let fixture: ComponentFixture<ModalAddTaskComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalAddTaskComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalAddTaskComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
