import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { MainPageComponent } from './main-page.component';
import { apiService } from 'src/app/service.service';
import { generate } from 'rxjs';

describe('MainPageComponent', () => {
  let component: MainPageComponent;
  let fixture: ComponentFixture<MainPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MainPageComponent],
      imports: [HttpClientTestingModule],
      providers: [apiService]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MainPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('should be main', ()=> {
    expect(component.active).toBe('main')
  })
  it('should be between 0-21', async () => {
    console.log(component.random)
    expect(component.random >= 0 && component.random <= 21).toBeTrue()
  })
})
