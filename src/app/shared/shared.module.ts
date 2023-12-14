import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { RepositoriesComponent } from './components/repositories/repositories/repositories.component';
import { FormNewIssueComponent } from './components/form-new-issue/form-new-issue.component';
import { EditIssuesComponent } from './components/edit-issues/edit-issues.component';

@NgModule({
  bootstrap: [],
  declarations: [RepositoriesComponent, FormNewIssueComponent, EditIssuesComponent],
  imports: [
    CommonModule,
    NgbModule,
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
  ],
  exports: [RepositoriesComponent],
})
export class SharedModule {}
