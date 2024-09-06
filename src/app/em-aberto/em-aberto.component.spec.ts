import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmAbertoComponent } from './em-aberto.component';

describe('EmAbertoComponent', () => {
  let component: EmAbertoComponent;
  let fixture: ComponentFixture<EmAbertoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmAbertoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmAbertoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
