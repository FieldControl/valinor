import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ToastyListComponent } from './toasty-list.component';

describe('ToastyListComponent', () => {
  let component: ToastyListComponent;
  let fixture: ComponentFixture<ToastyListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ BrowserAnimationsModule ],
      declarations: [ ToastyListComponent ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ToastyListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
