import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ButtonsPageComponent } from './buttons-page.component';

describe('ButtonsPageComponent', () => {
  let component: ButtonsPageComponent;
  let fixture: ComponentFixture<ButtonsPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ BrowserAnimationsModule ],
      declarations: [ ButtonsPageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ButtonsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
