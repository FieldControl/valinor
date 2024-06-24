import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateColumnsComponent } from './create-columns.component';

describe('CreateColumnsComponent', () => {
  let component: CreateColumnsComponent;
  let fixture: ComponentFixture<CreateColumnsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CreateColumnsComponent]
    });
    fixture = TestBed.createComponent(CreateColumnsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
