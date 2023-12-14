import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GitsmartComponent } from './gitsmart.component';

describe('GitsmartComponent', () => {
  let component: GitsmartComponent;
  let fixture: ComponentFixture<GitsmartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GitsmartComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GitsmartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
