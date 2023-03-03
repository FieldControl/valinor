import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { apiService } from 'src/app/service.service';
import { ChooseHeaderComponent } from '../../choose-header/choose-header.component';
import { ChooseComponent } from '../../choose/choose.component';
import { MainPageComponent } from '../../main-page/main-page.component';

import { AgentListComponent } from './agent-list.component';

describe('AgentListComponent', () => {
  let component: AgentListComponent;
  let fixture: ComponentFixture<AgentListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AgentListComponent, ChooseHeaderComponent],
      imports: [HttpClientTestingModule, MatPaginatorModule],
      providers: [apiService, ChooseComponent, MainPageComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AgentListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
