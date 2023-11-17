import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SearchComponent } from './search.component';
import { GetDataApiGitHub } from '../../services/get-service';
import { of } from 'rxjs';

describe('SearchComponent', () => {
  let component: SearchComponent;
  let fixture: ComponentFixture<SearchComponent>;
  let service: GetDataApiGitHub;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SearchComponent]
    });
    fixture = TestBed.createComponent(SearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call search method', () => {
    spyOn(service, 'getDataByTerm').and.returnValue(of({}));
    component.search();
    expect(service.getDataByTerm).toHaveBeenCalled();
  });
});
