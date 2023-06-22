import { TestBed, ComponentFixture } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { By } from '@angular/platform-browser';
import { SearchComponentComponent } from './components/search-component/search-component.component';
import { RepositoriosComponentComponent } from './components/repositorios-component/repositorios-component.component';
import { PaginasComponentComponent } from './components/paginas-component/paginas-component.component';
import { MensagemErroComponentComponent } from './components/mensagem-erro-component/mensagem-erro-component.component';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

describe('AppComponent', () => {
  let appcomponent: AppComponent
  let fixture: ComponentFixture<AppComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
    declarations: [
      AppComponent,
      SearchComponentComponent,
      RepositoriosComponentComponent,
      PaginasComponentComponent,
      MensagemErroComponentComponent
      
    ],
    imports: [
      BrowserModule,
      FormsModule,
      HttpClientModule
    ],
    providers: []
  }).compileComponents()

  fixture = TestBed.createComponent(AppComponent);
  appcomponent = fixture.componentInstance;
  fixture.detectChanges();
  
})

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('Repositorios existe', () => {
    appcomponent.repositorios = {'total_count': 100}
    
    fixture.detectChanges()

    expect(fixture.debugElement.query(By.directive(RepositoriosComponentComponent))).toBeTruthy();
  })

  it('Repositorios não existe', () => {
    appcomponent.repositorios = {'total_count': 0}
    
    fixture.detectChanges()

    expect(fixture.debugElement.query(By.directive(RepositoriosComponentComponent))).not.toBeTruthy();
  })

  it('Alerta de erro existe', () => {
    appcomponent.mensagem_erro = 'erro'
    
    fixture.detectChanges()

    expect(fixture.debugElement.query(By.directive(MensagemErroComponentComponent))).toBeTruthy();
  })

  it('Alerta de erro não existe', () => {
    appcomponent.mensagem_erro = ''
    
    fixture.detectChanges()

    expect(fixture.debugElement.query(By.directive(MensagemErroComponentComponent))).not.toBeTruthy()
  })

  it('Verifica se mensagem reseta', () => {
    spyOn(appcomponent, 'resetar_mensagem_erro').and.callThrough()
    appcomponent.mensagem_erro = 'Erro'
    fixture.detectChanges()

    const mensagemErroComponent = fixture.debugElement.query(By.directive(MensagemErroComponentComponent))
    expect(mensagemErroComponent).toBeTruthy()
    
    mensagemErroComponent.componentInstance.resetar_mensagem()
    
    expect(appcomponent.resetar_mensagem_erro).toHaveBeenCalled()
    expect(appcomponent.mensagem_erro).toEqual('')
  })

  it('Verifica se repositórios aparecem', () => {
    appcomponent.repositorios = {"total_count": 3, "items":[{'name': 'teste1'}, {'name': 'teste2'}, {'name': 'teste3'}]}
    fixture.detectChanges()

    const repositoriosComponent = fixture.debugElement.query(By.directive(RepositoriosComponentComponent))
    expect(repositoriosComponent).toBeTruthy()
       
    expect(repositoriosComponent.componentInstance.repositorios.items[0].name).toEqual('teste1')
  })

});
