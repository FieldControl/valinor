import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RepoCardComponent } from './repo-card.component';


describe('RepoCardComponent', () => {
  let component: RepoCardComponent;
  let fixture: ComponentFixture<RepoCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RepoCardComponent ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RepoCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
