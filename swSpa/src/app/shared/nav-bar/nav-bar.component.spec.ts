import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NavBarComponent } from './nav-bar.component';
import { HttpClientModule } from '@angular/common/http';
import { By } from '@angular/platform-browser';

describe('NavBarComponent', () => {
  let component: NavBarComponent;
  let fixture: ComponentFixture<NavBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NavBarComponent ],
      imports: [ HttpClientModule ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NavBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should emit the search text when searchedText() is called', () => {
    const searchText = 'Test Search Text';
    const emitSpy = spyOn(component.searchText, 'emit');
    component.searchedText(searchText);
    expect(emitSpy).toHaveBeenCalledWith(searchText);
  });

  it('should reload the page when the title is clicked', () => {
    const homeNavSpy = spyOn(component, 'homeNav');

    const titleElement = fixture.debugElement.query(By.css('.app-title'));
    
    titleElement.triggerEventHandler('click', null);

    expect(homeNavSpy).toHaveBeenCalled();
  })
});
