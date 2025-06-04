import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KanbanBoard } from './kanban-board';

describe('KanbanBoard', () => {
  let component: KanbanBoard;
  let fixture: ComponentFixture<KanbanBoard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KanbanBoard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KanbanBoard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
