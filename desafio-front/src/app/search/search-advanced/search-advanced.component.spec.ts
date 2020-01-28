import { HttpClientModule } from '@angular/common/http';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { PaginationModule } from 'ngx-bootstrap/pagination';

import { CheckboxFieldComponent } from 'src/app/shared/components/fields/checkbox-field/checkbox-field.component';
import { CheckboxListComponent } from 'src/app/shared/components/fields/checkbox-list/checkbox-list.component';
import { DatepickerFieldComponent } from 'src/app/shared/components/fields/datepicker-field/datepicker-field.component';
import { FieldErrorComponent } from 'src/app/shared/components/fields/field-error/field-error.component';
import { InputFieldComponent } from 'src/app/shared/components/fields/input-field/input-field.component';
import { SelectFieldComponent } from 'src/app/shared/components/fields/select-field/select-field.component';
import { LoadingSpinnerComponent } from 'src/app/shared/components/loading-spinner/loading-spinner.component';
import { RepoCardSkelletonComponent } from 'src/app/shared/components/repo-card-skelleton/repo-card-skelleton.component';
import { RepoCardComponent } from 'src/app/shared/components/repo-card/repo-card.component';

import { SearchAdvancedComponent } from './search-advanced.component';


describe('SearchAdvancedComponent', () => {
  let component: SearchAdvancedComponent;
  let fixture: ComponentFixture<SearchAdvancedComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        BsDatepickerModule.forRoot(),
        FormsModule,
        HttpClientModule,
        PaginationModule,
        ReactiveFormsModule,
      ],
      declarations: [
        CheckboxFieldComponent,
        CheckboxListComponent,
        DatepickerFieldComponent,
        FieldErrorComponent,
        InputFieldComponent,
        LoadingSpinnerComponent,
        RepoCardComponent,
        RepoCardSkelletonComponent,
        SearchAdvancedComponent,
        SelectFieldComponent,
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchAdvancedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
