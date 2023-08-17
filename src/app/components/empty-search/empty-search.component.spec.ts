import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EmptySearchComponent } from './empty-search.component';

describe('EmptySearchComponent', () => {
  let component: EmptySearchComponent;
  let fixture: ComponentFixture<EmptySearchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EmptySearchComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EmptySearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the correct message', () => {
    const compiled = fixture.nativeElement;
    const messageElement = compiled.querySelector('.font-bold.text-3xl');
    expect(messageElement.textContent).toContain(
      'Your search did not match any repositories'
    );
  });

  it('should display the octocat image', () => {
    const compiled = fixture.nativeElement;
    const imgElement = compiled.querySelector('img');
    expect(imgElement).toBeTruthy();
    expect(imgElement.getAttribute('src')).toContain(
      'assets/images/octocat.png'
    );
  });
});
