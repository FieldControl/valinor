import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HeaderComponent } from './header.component';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HeaderComponent],
      imports: [RouterTestingModule]
    })
      .compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('should have as title "Github Search', () => {
    const titulo = fixture.nativeElement.querySelector('h1');
    expect(titulo.textContent).toContain('GitHub Search');
  });

  it('should have a link to the page "list"', () => {
    const link = fixture.nativeElement.querySelector('a');
    expect(link.getAttribute('ng-reflect-router-link')).toBe('/list');
  });

});
