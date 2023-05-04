import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { PanelComponent } from './panel.component';
import { MatIconModule } from '@angular/material/icon';
import { ReactiveFormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { SharedModule } from 'src/app/shared/shared.module';
import { GithubService } from 'src/app/services/github.service';

describe('PanelComponent', () => {
  let component: PanelComponent;
  let fixture: ComponentFixture<PanelComponent>;
  let gitServiceSpy: jasmine.SpyObj<GithubService>;

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('GithubService', ['getRepositories']);
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, MatIconModule, ReactiveFormsModule,SharedModule],
      declarations: [PanelComponent],
      providers: [{ provide: GithubService, useValue: spy }],
    }).compileComponents();

    fixture = TestBed.createComponent(PanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    gitServiceSpy = TestBed.inject(
      GithubService
    ) as jasmine.SpyObj<GithubService>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  // it('should display "Não existe repositórios!" message when there is no reporesult', () => {
  //   component.reporesult = null;
  //   fixture.detectChanges();
  //   const message = fixture.nativeElement.querySelector('.nohaveresult h3');
  //   expect(message.textContent).toContain('Não existe repositórios!');
  // });

  // it('should call requestByType method with "repositories" argument when "Repositories" menu item is clicked', () => {
  //   spyOn(component, 'requestByType');
  //   const button = fixture.nativeElement.querySelector(
  //     '.menu li:nth-child(1) a'
  //   );
  //   button.click();
  //   expect(component.requestByType).toHaveBeenCalledWith('repositories');
  // });

  // it('should call requestByType method with "issues" argument when "Issues" menu item is clicked', () => {
  //   spyOn(component, 'requestByType');
  //   const button = fixture.nativeElement.querySelector(
  //     '.menu li:nth-child(2) a'
  //   );
  //   button.click();
  //   expect(component.requestByType).toHaveBeenCalledWith('issues');
  // });
});
