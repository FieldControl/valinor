import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateColumnComponent } from './create-column.component';

describe('CreateColumnComponent', () => {
  let component: CreateColumnComponent;
  let fixture: ComponentFixture<CreateColumnComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateColumnComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateColumnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
