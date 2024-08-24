import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccessAppComponent } from './access-app.component';

describe('AccessAppComponent', () => {
  let component: AccessAppComponent;
  let fixture: ComponentFixture<AccessAppComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AccessAppComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AccessAppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
