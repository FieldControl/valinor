import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { HeaderComponent } from './header.component';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;
  let cookieServiceSpy: jasmine.SpyObj<CookieService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('CookieService', ['delete']);
    const routerSpyObj = jasmine.createSpyObj('Router', ['navigate']);
    await TestBed.configureTestingModule({
      declarations: [HeaderComponent],
      providers: [
        { provide: CookieService, useValue: spy },
        { provide: Router, useValue: routerSpyObj },
      ],
    }).compileComponents();
    cookieServiceSpy = TestBed.inject(
      CookieService
    ) as jasmine.SpyObj<CookieService>;
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should logout', () => {
    component.logout();
    expect(cookieServiceSpy.delete).toHaveBeenCalledWith('token');
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/']);
  });
});
