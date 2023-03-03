import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { apiService } from 'src/app/service.service';
import { ChooseHeaderComponent } from '../../choose-header/choose-header.component';
import { ChooseComponent } from '../../choose/choose.component';
import { MainPageComponent } from '../../main-page/main-page.component';

import { SkinListComponent } from './skin-list.component';

describe('SkinListComponent', () => {
  let component: SkinListComponent;
  let fixture: ComponentFixture<SkinListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SkinListComponent, ChooseHeaderComponent ],
      imports: [HttpClientTestingModule],
      providers: [apiService,  ChooseComponent, MainPageComponent],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SkinListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
