import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KanbansComponent } from './kanbans.component';

describe('KanbansComponent', () => {
  let component: KanbansComponent;
  let fixture: ComponentFixture<KanbansComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [KanbansComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(KanbansComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
