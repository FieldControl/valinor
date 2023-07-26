import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeaderComponent } from './header.component';
import { FormsModule } from '@angular/forms';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [HeaderComponent],
      imports: [FormsModule]
    });
    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit search event when pressing Enter in the input', () => {
    spyOn(component.searchService, 'search');
    component.searchRepo('fieldcontrol');

    const inputElement = fixture.nativeElement.querySelector('input');
    inputElement.dispatchEvent(new KeyboardEvent('keyup', { key: 'Enter' }));

    expect(component.searchService.search).toHaveBeenCalledWith('fieldcontrol', 1);
  });

  it('should not call searchService.search when searchRepo is called with a whitespace search term', () => {
    spyOn(component.searchService, 'search');
    component.searchRepo('');
    expect(component.searchService.search).not.toHaveBeenCalled();
  });
});
