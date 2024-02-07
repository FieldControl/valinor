import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SoftwareComponent } from './software.component';

describe('SoftwareComponent', () => {
  let component: SoftwareComponent;
  let fixture: ComponentFixture<SoftwareComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SoftwareComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SoftwareComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
