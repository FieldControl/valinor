import { TestBed } from '@angular/core/testing';

import { ThemeService } from './theme.service';
import { Theme } from '@core/enums/theme.enum';

describe('ThemeService', () => {
  let service: ThemeService;
  let htmlTag: HTMLHtmlElement;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ThemeService);
  });

  beforeEach(() => {
    htmlTag = document.querySelector('html')!;

    service.currentTheme = Theme.light;
    htmlTag.classList.remove(Theme.dark);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should be light theme', () => {
    expect(service.currentTheme).toBe(Theme.light);
    expect(service.isDarkTheme()).toBeFalse();
  });

  it('should toggle from light to dark theme', () => {
    service.toggleTheme();
    expect(service.currentTheme).toBe(Theme.dark);
    expect(htmlTag?.classList.contains('dark')).toBeTrue();
  });
});
