import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RepoCardComponent } from './repo-card.component';
import { ShortNumberPipe } from 'src/app/pipes/short-number/short-number.pipe';
import { GithubDatePipe } from 'src/app/pipes/github-date/github-date.pipe';

describe('RepoCardComponent', () => {
  let component: RepoCardComponent;
  let fixture: ComponentFixture<RepoCardComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RepoCardComponent, ShortNumberPipe, GithubDatePipe]
    });
    fixture = TestBed.createComponent(RepoCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
