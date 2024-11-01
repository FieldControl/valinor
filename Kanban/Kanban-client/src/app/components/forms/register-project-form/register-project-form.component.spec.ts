import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterProjectFormComponent } from './register-project-form.component';

describe('RegisterProjectFormComponent', () => {
  let component: RegisterProjectFormComponent;
  let fixture: ComponentFixture<RegisterProjectFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegisterProjectFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegisterProjectFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
