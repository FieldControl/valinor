import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeveloperComponent } from './developer.component';

describe('DeveloperComponent', () => {
  let component: DeveloperComponent;
  let fixture: ComponentFixture<DeveloperComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DeveloperComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeveloperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
