import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Column } from './column';
import { KanbanService } from '../../../services/kanban.service';
import { of } from 'rxjs';
import { vi } from 'vitest';

describe('Column', () => {
  let component!: Column;
  let fixture!: ComponentFixture<Column>;

  const kanbanServiceMock = {
    getColumnsWithCards: vi.fn().mockReturnValue(of([])),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Column],
      providers: [{ provide: KanbanService, useValue: kanbanServiceMock }],
    }).compileComponents();

    fixture = TestBed.createComponent(Column);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
