import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SideNavbarComponent } from './side-navbar.component';

describe('SideNavbarComponent', () => {
  let component: SideNavbarComponent;
  let fixture: ComponentFixture<SideNavbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SideNavbarComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SideNavbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
