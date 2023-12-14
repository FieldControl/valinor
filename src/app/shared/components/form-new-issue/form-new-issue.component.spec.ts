import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormNewIssueComponent } from './form-new-issue.component';

describe('FormNewIssueComponent', () => {
  let component: FormNewIssueComponent;
  let fixture: ComponentFixture<FormNewIssueComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FormNewIssueComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormNewIssueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
