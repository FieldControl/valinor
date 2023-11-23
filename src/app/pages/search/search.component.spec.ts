import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing'
import { SearchComponent } from './search.component';
import { FormsModule } from '@angular/forms';

describe('SearchComponent', () => {
  
  let component: SearchComponent;
  let fixture: ComponentFixture<SearchComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SearchComponent],
      imports:  [HttpClientTestingModule, FormsModule]
    });
    fixture = TestBed.createComponent(SearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    //component.  acessa todas as propriedades/métodos dentro do meu componente
    
    expect(component).toBeTruthy();
  });

});
