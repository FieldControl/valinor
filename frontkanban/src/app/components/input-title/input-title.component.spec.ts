import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InputTitleComponent } from './input-title.component';

describe('InputTitleComponent', () => {
  let component: InputTitleComponent;
  let fixture: ComponentFixture<InputTitleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InputTitleComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InputTitleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
