import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccessComponent } from './access.component';

describe('AccessComponent', () => {
  let component: AccessComponent;
  let fixture: ComponentFixture<AccessComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AccessComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AccessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
