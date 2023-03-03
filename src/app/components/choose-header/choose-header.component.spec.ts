import { HttpClient, HttpHandler } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChooseComponent } from '../choose/choose.component';
import { MainPageComponent } from '../main-page/main-page.component';

import { ChooseHeaderComponent } from './choose-header.component';

describe('ChooserComponent', () => {
  let component: ChooseHeaderComponent;
  let fixture: ComponentFixture<ChooseHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ChooseHeaderComponent, ChooseComponent ],
      providers: [MainPageComponent, ChooseComponent, HttpClient, HttpHandler]
    })
      .compileComponents();

    fixture = TestBed.createComponent(ChooseHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
