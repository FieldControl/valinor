import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateModalProjectComponent } from './update-modal-project.component';

describe('UpdateModalProjectComponent', () => {
  let component: UpdateModalProjectComponent;
  let fixture: ComponentFixture<UpdateModalProjectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpdateModalProjectComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UpdateModalProjectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
