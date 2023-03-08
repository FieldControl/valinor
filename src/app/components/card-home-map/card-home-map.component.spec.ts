import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardHomeMapComponent } from './card-home-map.component';

describe('CardHomeMapComponent', () => {
  let component: CardHomeMapComponent;
  let fixture: ComponentFixture<CardHomeMapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CardHomeMapComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CardHomeMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
