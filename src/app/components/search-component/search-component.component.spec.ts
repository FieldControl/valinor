import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SearchComponentComponent } from './search-component.component';
import { FormsModule } from '@angular/forms';

describe('SearchComponentComponent', () => {
  let component: SearchComponentComponent;
  let fixture: ComponentFixture<SearchComponentComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule],
      declarations: [SearchComponentComponent]
    });
    fixture = TestBed.createComponent(SearchComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('Mudar nome do repositório', () => {
    component.nome_repositorio = 'teste'
    spyOn(component, 'enviar_nome_repositorio').and.callThrough()
    spyOn(component.mudar_nome_repositorio, 'emit')

    component.enviar_nome_repositorio()

    expect(component.enviar_nome_repositorio).toHaveBeenCalled()
    expect(component.mudar_nome_repositorio.emit).toHaveBeenCalled()
    expect(component.mudar_nome_repositorio.emit).toHaveBeenCalledWith(component.nome_repositorio)
  })
});
