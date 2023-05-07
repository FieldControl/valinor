import {
  ComponentFixture,
  ComponentFixtureAutoDetect,
  TestBed,
} from '@angular/core/testing';
import { AppComponent } from './app.component';
import { SharedModule } from '@shared/shared.module';
import { AppRoutingModule } from './app-routing.module';

describe('AppComponent', () => {
  let nativeElement: HTMLElement;
  let fixture: ComponentFixture<AppComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AppComponent],
      providers: [{ provide: ComponentFixtureAutoDetect, useValue: true }],
      imports: [SharedModule, AppRoutingModule],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AppComponent);
    nativeElement = fixture.nativeElement as HTMLElement;
  });

  it('should create the app', () => {
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should have a <main></main> tag', () => {
    var mainTag = nativeElement.querySelector('main');
    expect(mainTag).toBeTruthy();
  });

  it('should have a <app-header></app-header> tag', () => {
    var appHeaderTag = nativeElement.querySelector('app-header');
    expect(appHeaderTag).toBeTruthy();
  });

  it('should have a <router-outlet></router-outlet> tag', () => {
    var routerOutletTag = nativeElement.querySelector('router-outlet');
    expect(routerOutletTag).toBeTruthy();
  });

  it('should have a <app-message-dialog></app-message-dialog> tag', () => {
    var appMessageDialogTag = nativeElement.querySelector('app-message-dialog');
    expect(appMessageDialogTag).toBeTruthy();
  });
});
