import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodigoTagComponent } from './TopicsTags.component';

describe('CodigoTagComponent', () => {
  let component: CodigoTagComponent;
  let fixture: ComponentFixture<CodigoTagComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CodigoTagComponent]
    });
    fixture = TestBed.createComponent(CodigoTagComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
