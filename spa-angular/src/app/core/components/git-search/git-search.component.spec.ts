import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatInputModule } from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatIconModule } from '@angular/material/icon';
import { filter, fromEvent } from 'rxjs';

import { GitSearchComponent } from './git-search.component';
import { MatSnackBarModule } from '@angular/material/snack-bar';

describe('GitSearchComponent', () => {
  let component: GitSearchComponent;
  let fixture: ComponentFixture<GitSearchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        MatPaginatorModule,
        MatFormFieldModule,
        MatButtonModule,
        FormsModule,
        HttpClientModule,
        HttpClientTestingModule,
        MatInputModule,
        BrowserAnimationsModule,
        MatIconModule,
        MatSnackBarModule
      ],
      declarations: [GitSearchComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GitSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should update page number and page size when paginator page event is triggered', () => {
    const pageEvent: PageEvent = {
      pageIndex: 2,
      pageSize: 25,
      length: 100,
    };

    spyOn(component, 'getSearchRepo');

    component.onPageChange(pageEvent);

    expect(component.pageNumber).toBe(3);
    expect(component.pageSize).toBe(25);
    expect(component.getSearchRepo).toHaveBeenCalledWith(component.repoName, component.pageNumber, component.pageSize);
  });
});
