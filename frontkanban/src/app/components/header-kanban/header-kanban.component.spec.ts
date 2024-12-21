import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeaderKanbanComponent } from './header-kanban.component';

describe('HeaderKanbanComponent', () => {
  let component: HeaderKanbanComponent;
  let fixture: ComponentFixture<HeaderKanbanComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderKanbanComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HeaderKanbanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
