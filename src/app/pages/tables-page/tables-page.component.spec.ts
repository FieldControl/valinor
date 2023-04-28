import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TablesPageComponent } from './tables-page.component';

describe('TablesPageComponent', () => {
  let component: TablesPageComponent;
  let fixture: ComponentFixture<TablesPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ 
        BrowserAnimationsModule,
        HttpClientTestingModule
      ],
      declarations: [ TablesPageComponent ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TablesPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
