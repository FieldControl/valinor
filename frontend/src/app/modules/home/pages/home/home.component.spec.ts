import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';

import { HomeComponent } from './home.component';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { GithubService } from 'src/app/core/services/github.service';
import { of } from 'rxjs';
import { ResultListComponent } from '../../components/result-list/result-list.component';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let githubServiceSpy: jasmine.SpyObj<GithubService>;

  beforeEach(async () => {
    githubServiceSpy = jasmine.createSpyObj('GithubService', ['searchRepository']);

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, NgxPaginationModule],
      declarations: [ HomeComponent, ResultListComponent ],
      providers: [
        FormBuilder, {
          provide: GithubService, useValue: githubServiceSpy
        }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;

    githubServiceSpy = TestBed.inject(GithubService) as jasmine.SpyObj<GithubService>;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the form', () => {
    component.initForm();
    expect(component.form.invalid).toBeTruthy();
  });

  it('should show error message when form is invalid', () => {
    spyOnProperty(component.form, 'invalid').and.returnValue(true);
    component.onSearchRepo(1);
    expect(component.errorMessage).toBe('Field is required!');
  });

  it('should call searchRepository and update totalItems when form is valid', fakeAsync(() => {
    const search = 'next';
    const page = 1;
    const repos = [
      { id: 1, name: 'repo1' },
      { id: 2, name: 'repo2' }
    ];

    spyOnProperty(component.form, 'invalid').and.returnValue(false);

    component.form.controls['search'].setValue(search);
    spyOn(component, 'initForm');
    component.ngOnInit();

    githubServiceSpy.searchRepository.and.returnValue(
      of({
        total_count: 2,
        items: repos
      })
    );

    const searchButton = fixture.debugElement.nativeElement.querySelector('button');
    searchButton.click();
    fixture.detectChanges();
    tick();

    expect(component.initForm).toHaveBeenCalled();
    expect(githubServiceSpy.searchRepository).toHaveBeenCalledWith(search, page);
    expect(component.totalItems).toBe(2);

    component.repos$.toPromise().then((response: any) => {
      expect(response).toEqual(repos);
    });
  }));

  it('should show "Not found!" error message when search result is empty', fakeAsync(() => {
    const search = '=';

    spyOnProperty(component.form, 'invalid').and.returnValue(false);
    component.form.patchValue({ search: search });

    githubServiceSpy.searchRepository.and.returnValues(
    of({
      incomplete_results: false,
      items: [],
      total_count: 0,
    }))

    const searchButton = fixture.debugElement.nativeElement.querySelector('button');
    searchButton.click();
    fixture.detectChanges();
    tick();

    expect(githubServiceSpy.searchRepository).toHaveBeenCalledWith(search, 1);

    expect(component.errorMessage).toBe('Not found!');
  }));

  it('should show "Field is required!" error message when search input is empty', () => {
    spyOnProperty(component.form, 'invalid').and.returnValue(true);
    component.form.patchValue({ search: '' });
    component.onSearchRepo(1);

    expect(githubServiceSpy.searchRepository).not.toHaveBeenCalled();
    expect(component.errorMessage).toBe('Field is required!');
  });

  it('should search repositories when button is clicked', () => {
    const search = 'angular';
    const page = 1;

    spyOnProperty(component.form, 'invalid').and.returnValue(false);

    const button = fixture.nativeElement.querySelector('button');
    const input = fixture.nativeElement.querySelector('input');

    input.value = search;
    input.dispatchEvent(new Event('input'));

    fixture.detectChanges();

    button.click();

    expect(githubServiceSpy.searchRepository).toHaveBeenCalledWith(search, page);
  });
})
