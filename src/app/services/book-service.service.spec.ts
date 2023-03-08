import { TestBed, ComponentFixture, getTestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { BookServiceService } from './book-service.service';
import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';

describe('BookServiceService', () => {
  let service: BookServiceService;
  let httpMock: HttpTestingController;
  let httpClient: HttpClient;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [BookServiceService],
    });
    service = TestBed.inject(BookServiceService);
    httpMock = TestBed.inject(HttpTestingController);
    httpClient = TestBed.inject(HttpClient);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
