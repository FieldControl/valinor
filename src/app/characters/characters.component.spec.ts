import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CharactersComponent } from './characters.component';
import { RouterTestingModule } from '@angular/router/testing';
import { CharactersApiService } from 'src/app/service/characters-api.service';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { of } from 'rxjs';

describe('CharactersComponent', () => {
  let component: CharactersComponent;
  let fixture: ComponentFixture<CharactersComponent>;
  let charactersApiService: CharactersApiService;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      declarations: [CharactersComponent],
      imports: [RouterTestingModule, HttpClientModule],
      providers: [CharactersApiService],
    }).compileComponents();

    fixture = TestBed.createComponent(CharactersComponent);
    component = fixture.componentInstance;
    charactersApiService = TestBed.inject(CharactersApiService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('calculateTotalPages should correctly calculate total pages', () => {
    spyOn(charactersApiService, 'getCharacters').and.returnValue(of([]));

    component.totalCharacters = 100;
    component.itemsPerPage = 8;

    component.calculateTotalPages();

    expect(component.totalPages).toBe(13);
  });

  it('nextPage should increment currentPage if not on the last page', () => {
    spyOn(charactersApiService, 'getCharacters').and.returnValue(of([]));

    component.currentPage = 1;

    component.totalPages = 5;

    component.nextPage();

    expect(component.currentPage).toBe(2);
  });

  it('nextPage should not increment currentPage on the last page', () => {
    spyOn(charactersApiService, 'getCharacters').and.returnValue(of([]));

    component.currentPage = 5;

    component.totalPages = 5;

    component.nextPage();

    expect(component.currentPage).toBe(5);
  });
  it('prevPage should decrement currentPage if not on the first page', () => {
    spyOn(charactersApiService, 'getCharacters').and.returnValue(of([]));

    component.currentPage = 2;

    component.prevPage();

    expect(component.currentPage).toBe(1);
  });

  it('prevPage should not decrement currentPage on the first page', () => {
    spyOn(charactersApiService, 'getCharacters').and.returnValue(of([]));

    component.currentPage = 1;

    component.prevPage();

    expect(component.currentPage).toBe(1);
  });

  it('getPageArray should return an array of page numbers up to totalPages', () => {
    component.totalPages = 3;

    const pageArray = component.getPageArray();

    expect(pageArray).toEqual([1, 2, 3]);
  });

  it('goToPage should set currentPage and call getCharacters', () => {
    spyOn(charactersApiService, 'getCharacters').and.returnValue(of([]));

    component.currentPage = 2;

    component.goToPage(3);

    expect(component.currentPage).toBe(3);

    expect(charactersApiService.getCharacters).toHaveBeenCalledWith(3, component.itemsPerPage);
  });

});
