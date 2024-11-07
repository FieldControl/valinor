import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditColumnModalComponent } from './edit-column-modal.component';

describe('EditColumnModalComponent', () => {
  let component: EditColumnModalComponent;
  let fixture: ComponentFixture<EditColumnModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditColumnModalComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EditColumnModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
