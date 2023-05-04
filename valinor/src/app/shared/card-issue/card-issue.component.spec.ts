import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { ReactiveFormsModule,FormsModule } from '@angular/forms';
import { CardIssueComponent } from './card-issue.component';
import { MatIconModule } from '@angular/material/icon';

describe('CardIssueComponent', () => {
  let component: CardIssueComponent;
  let fixture: ComponentFixture<CardIssueComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports:[HttpClientTestingModule,MatIconModule,ReactiveFormsModule,FormsModule],
      declarations: [ CardIssueComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CardIssueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
