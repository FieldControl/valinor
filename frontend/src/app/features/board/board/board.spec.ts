import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { Board } from './board';
import { KanbanService } from '../../../services/kanban.service';

describe('BoardComponent', () => {
  let component!: Board;
  let fixture!: ComponentFixture<Board>;

  const kanbanServiceMock = {
    getColumnsWithCards: vi.fn().mockReturnValue(of([])),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Board],
      providers: [{ provide: KanbanService, useValue: kanbanServiceMock }],
    }).compileComponents();

    fixture = TestBed.createComponent(Board);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
