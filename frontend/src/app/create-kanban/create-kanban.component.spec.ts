import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateKanbanComponent } from './create-kanban.component';

describe('CreateKanbanComponent', () => {
  let component: CreateKanbanComponent;
  let fixture: ComponentFixture<CreateKanbanComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CreateKanbanComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CreateKanbanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
