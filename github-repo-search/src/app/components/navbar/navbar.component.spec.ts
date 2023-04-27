import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NavbarComponent } from './navbar.component';
import { FormsModule } from '@angular/forms';

describe('NavbarComponent', () => {
  let component: NavbarComponent;
  let fixture: ComponentFixture<NavbarComponent>;

  beforeEach(() => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 60000;
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NavbarComponent],
      imports: [FormsModule],
    }).compileComponents();
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NavbarComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NavbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit searchChanged event on keypress', (done) => {
    const inputElement: HTMLInputElement =
      fixture.nativeElement.querySelector('input');
    const searchTerm = 'angular';
    component.searchChanged.subscribe((searchValue) => {
      expect(searchValue).toEqual(searchTerm);
      done();
    });
    inputElement.value = searchTerm;
    inputElement.dispatchEvent(new Event('keypress'));
  });

  it('should not emit searchChanged event if search is empty', () => {
    const inputElement: HTMLInputElement =
      fixture.nativeElement.querySelector('input');
    spyOn(component.searchChanged, 'emit');
    inputElement.dispatchEvent(new Event('keypress'));
    expect(component.searchChanged.emit).not.toHaveBeenCalled();
  });
});
