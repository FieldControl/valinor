import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeaderComponent } from './header.component';
import { HttpClientModule } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';

describe('HeaderComponent', () => {
  let headerComponent: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderComponent, HttpClientModule, RouterModule.forRoot([])],
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(HeaderComponent);
    headerComponent = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(headerComponent).toBeTruthy();
  });

  it('should logout and redirect to root', () => {
    const routerSpy = spyOn(TestBed.inject(Router), 'navigateByUrl');
    localStorage.setItem('acess_token', 'test_token');

    headerComponent.logout();

    expect(localStorage.getItem('acess_token')).toBeNull();
    expect(routerSpy).toHaveBeenCalledWith('/');
  });
});
