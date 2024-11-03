import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalLaneComponentComponent } from './modal-lane.component';

describe('ModalLaneComponentComponent', () => {
  let component: ModalLaneComponentComponent;
  let fixture: ComponentFixture<ModalLaneComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalLaneComponentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalLaneComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
