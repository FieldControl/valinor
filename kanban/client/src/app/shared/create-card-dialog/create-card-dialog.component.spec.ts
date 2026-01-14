import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateCardDialogComponent } from './create-card-dialog.component';

describe('CreateCardDialogComponent', () => {
  let component: CreateCardDialogComponent;
  let fixture: ComponentFixture<CreateCardDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateCardDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateCardDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
