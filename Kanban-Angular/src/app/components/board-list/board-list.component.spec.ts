import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BoardListComponent } from './board-list.component';
import { HeaderComponent } from '../shared/header/header.component';

describe('BoardListComponent', () => {
  let component: BoardListComponent;
  let fixture: ComponentFixture<BoardListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BoardListComponent,HeaderComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BoardListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
