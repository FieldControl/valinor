import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmarComponent } from './confirmar.component';

describe('ConfirmarComponent', () => {
  let component: ConfirmarComponent;
  let fixture: ComponentFixture<ConfirmarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfirmarComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ConfirmarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
