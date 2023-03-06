import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardCharcacterComponent } from './card-charcacter.component';

describe('CardCharcacterComponent', () => {
  let component: CardCharcacterComponent;
  let fixture: ComponentFixture<CardCharcacterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CardCharcacterComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CardCharcacterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
