import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { SearchBarComponent } from './search-bar.component';
import { SearchResultComponent } from '../search-result/search-result.component';
import { RepositoryDetailsComponent } from '../repository-details/repository-details.component';

describe('SearchBarComponent', () => {
  let searchBarComponent: SearchBarComponent;
  let searchBarFixture: ComponentFixture<SearchBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SearchBarComponent, SearchResultComponent, RepositoryDetailsComponent],
      imports: [HttpClientTestingModule, FormsModule],
    }).compileComponents();
  });

  beforeEach(() => {
    searchBarFixture = TestBed.createComponent(SearchBarComponent);
    searchBarComponent = searchBarFixture.componentInstance;
    searchBarFixture.detectChanges();
  });

  it('should create the SearchBarComponent', () => {
    expect(searchBarComponent).toBeTruthy();
  });

  it('should call onSearchClick() when search button is clicked', () => {
    const onSearchClickSpy = spyOn(searchBarComponent, 'onSearchClick');
    const searchButton = searchBarFixture.debugElement.query(By.css('.icon-container'));
    searchButton.triggerEventHandler('click', null);
    expect(onSearchClickSpy).toHaveBeenCalled();
  });

  it('should call searchRepositories() with correct parameters when onSearchClick() is called', () => {
    const searchQuery = 'example';
    searchBarComponent.searchQuery = searchQuery;
    const searchRepositoriesSpy = spyOn(searchBarComponent, 'searchRepositories');

    searchBarComponent.onSearchClick();

    expect(searchRepositoriesSpy).toHaveBeenCalledWith(searchQuery);
  });

  it('should display search results when searchResults is true', () => {
    searchBarComponent.searchResults = true;
    searchBarFixture.detectChanges();

    const searchResultsElement = searchBarFixture.debugElement.query(By.css('.search-input'));
    expect(searchResultsElement).toBeTruthy();
  });
});
