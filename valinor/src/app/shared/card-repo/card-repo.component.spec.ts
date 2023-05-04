import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';

import { MatIconModule } from '@angular/material/icon';

import { CardRepoComponent } from './card-repo.component';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';

describe('CardRepoComponent', () => {
  let component: CardRepoComponent;
  let fixture: ComponentFixture<CardRepoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        MatIconModule,
        ReactiveFormsModule,
        FormsModule,
      ],
      declarations: [CardRepoComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CardRepoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
