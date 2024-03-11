import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateCardComponent } from './update-card.component';

describe('UpdateCardComponent', () => {
  let component: UpdateCardComponent;
  let fixture: ComponentFixture<UpdateCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UpdateCardComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UpdateCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
