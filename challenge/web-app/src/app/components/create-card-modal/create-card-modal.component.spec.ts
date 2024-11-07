import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateCardModalComponent } from './create-card-modal.component';

describe('CreateCardModalComponent', () => {
  let component: CreateCardModalComponent;
  let fixture: ComponentFixture<CreateCardModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateCardModalComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CreateCardModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
