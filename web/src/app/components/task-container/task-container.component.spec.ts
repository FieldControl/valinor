import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskContainerComponent } from './task-container.component';

describe('TaskContainerComponent', () => {
  let component: TaskContainerComponent;
  let fixture: ComponentFixture<TaskContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TaskContainerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TaskContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
