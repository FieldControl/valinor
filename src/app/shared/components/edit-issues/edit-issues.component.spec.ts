import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditIssuesComponent } from './edit-issues.component';

describe('EditIssuesComponent', () => {
  let component: EditIssuesComponent;
  let fixture: ComponentFixture<EditIssuesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditIssuesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditIssuesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
