import { HttpClientModule } from '@angular/common/http';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { PaginationModule } from 'ngx-bootstrap/pagination';

import { FieldErrorComponent } from '../shared/components/fields/field-error/field-error.component';
import { InputFieldComponent } from '../shared/components/fields/input-field/input-field.component';
import { SelectFieldComponent } from '../shared/components/fields/select-field/select-field.component';
import { LoadingSpinnerComponent } from '../shared/components/loading-spinner/loading-spinner.component';
import { RepoCardSkelletonComponent } from '../shared/components/repo-card-skelleton/repo-card-skelleton.component';
import { RepoCardComponent } from '../shared/components/repo-card/repo-card.component';
import { SearchComponent } from './search.component';


describe('SearchComponent', () => {
  let component: SearchComponent;
  let fixture: ComponentFixture<SearchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        HttpClientModule,
        PaginationModule,
        ReactiveFormsModule,
      ],
      declarations: [
        FieldErrorComponent,
        InputFieldComponent,
        LoadingSpinnerComponent,
        RepoCardComponent,
        RepoCardSkelletonComponent,
        SearchComponent,
        SelectFieldComponent,
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
