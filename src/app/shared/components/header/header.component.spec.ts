import {
  ComponentFixture,
  ComponentFixtureAutoDetect,
  TestBed,
} from '@angular/core/testing';

import { HeaderComponent } from './header.component';
import { ThemeService } from '@core/services/theme.service';
import { SharedModule } from '@shared/shared.module';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;
  let themeServiceStub: Partial<ThemeService>;

  beforeEach(async () => {
    themeServiceStub = {};

    await TestBed.configureTestingModule({
      declarations: [HeaderComponent],
      providers: [
        { provide: ComponentFixtureAutoDetect, useValue: true },
        { provide: ThemeService, useValue: themeServiceStub },
      ],
      imports: [SharedModule],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have a nav tag', () => {
    var navElement = (fixture.nativeElement as HTMLElement)
      .getElementsByTagName('nav')
      .item(0);
    expect(navElement).toBeTruthy();
  });
});
