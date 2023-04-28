import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PipesPageComponent } from './pipes-page.component';

describe('PipesPageComponent', () => {
  let component: PipesPageComponent;
  let fixture: ComponentFixture<PipesPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ BrowserAnimationsModule ],
      declarations: [ PipesPageComponent ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PipesPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
