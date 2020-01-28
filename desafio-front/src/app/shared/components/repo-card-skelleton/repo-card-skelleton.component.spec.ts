import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LoadingSpinnerComponent } from '../loading-spinner/loading-spinner.component';
import { RepoCardSkelletonComponent } from './repo-card-skelleton.component';


describe('RepoCardSkelletonComponent', () => {
  let component: RepoCardSkelletonComponent;
  let fixture: ComponentFixture<RepoCardSkelletonComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        LoadingSpinnerComponent,
        RepoCardSkelletonComponent,
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RepoCardSkelletonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
