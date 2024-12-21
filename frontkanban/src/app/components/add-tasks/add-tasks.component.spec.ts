import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddTasksComponent } from './add-tasks.component';

describe('AddTasksComponent', () => {
  let component: AddTasksComponent;
  let fixture: ComponentFixture<AddTasksComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddTasksComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddTasksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
