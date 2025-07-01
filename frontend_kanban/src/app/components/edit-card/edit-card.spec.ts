import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditCard } from './edit-card';

describe('EditCard', () => {
  let component: EditCard;
  let fixture: ComponentFixture<EditCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditCard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditCard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
