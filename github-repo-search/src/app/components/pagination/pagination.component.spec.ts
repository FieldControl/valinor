import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PaginationComponent } from './pagination.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { GithubRepositoriesService } from 'src/app/services/repositoriesService/github-repositories.service';

describe('PaginationComponent', () => {
  let component: PaginationComponent;
  let fixture: ComponentFixture<PaginationComponent>;

  beforeEach(() => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 60000;
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PaginationComponent],
      imports: [HttpClientTestingModule],
      providers: [GithubRepositoriesService],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PaginationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('pages', () => {
    it('should return an array with one page number when there is only one page', () => {
      component.currentPage = 1;
      component.totalPages = 1;
      expect(component.pages).toEqual([1]);
    });

    it('should return an array of page numbers when there are multiple pages', () => {
      component.currentPage = 5;
      component.totalPages = 10;
      expect(component.pages).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    });

    it('should return an array of 10 page numbers when there are more than 10 pages', () => {
      component.currentPage = 5;
      component.totalPages = 20;
      expect(component.pages).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    });

    it('should return an array of page numbers with the current page in the middle', () => {
      component.currentPage = 5;
      component.totalPages = 15;
      expect(component.pages).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    });

    it('should return an array of page numbers with the current page at the beginning', () => {
      component.currentPage = 1;
      component.totalPages = 15;
      expect(component.pages).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    });

    it('should return an array of page numbers with the current page at the end', () => {
      component.currentPage = 15;
      component.totalPages = 15;
      expect(component.pages).toEqual([6, 7, 8, 9, 10, 11, 12, 13, 14, 15]);
    });
  });
});
