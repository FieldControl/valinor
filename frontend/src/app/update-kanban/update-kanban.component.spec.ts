import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateKanbanComponent } from './update-kanban.component';

describe('UpdateKanbanComponent', () => {
  let component: UpdateKanbanComponent;
  let fixture: ComponentFixture<UpdateKanbanComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UpdateKanbanComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UpdateKanbanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
