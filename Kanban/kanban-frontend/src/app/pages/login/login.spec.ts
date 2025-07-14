import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { LoginComponent } from './login.component';
import { AuthService } from '../../services/auth';

/**
 * 'describe' agrupa todos os testes relacionados ao LoginComponent.
 */
describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;

  /**
   * 'beforeEach' é executado antes de cada teste. É aqui que configuramos
   * o nosso módulo de teste e criamos uma instância do componente.
   */
  beforeEach(async () => {
    // TestBed.configureTestingModule cria um módulo de teste "falso" do Angular.
    await TestBed.configureTestingModule({
      // 'imports' é usado para componentes "standalone" como o nosso.
      // - LoginComponent: O próprio componente que estamos a testar.
      // - ReactiveFormsModule: Necessário porque o nosso componente usa formulários reativos.
      // - HttpClientTestingModule: Simula o HttpClient para o nosso AuthService.
      // - RouterTestingModule: Simula o sistema de rotas para que o Router possa ser injetado.
      imports: [LoginComponent, ReactiveFormsModule, HttpClientTestingModule, RouterTestingModule],
      
      // 'providers' é onde podemos fornecer serviços. Aqui, providenciamos o AuthService real,
      // pois ele será "simulado" pelo HttpClientTestingModule.
      providers: [AuthService]
    })
    .compileComponents(); // Compila o template e os estilos do componente.

    // 'TestBed.createComponent' cria uma instância do nosso componente.
    fixture = TestBed.createComponent(LoginComponent);
    // 'component' é a instância da classe do nosso componente (o .ts).
    component = fixture.componentInstance;
    // 'fixture.detectChanges()' dispara o ciclo de vida do Angular (como o ngOnInit)
    // e renderiza o HTML inicial.
    fixture.detectChanges();
  });

  /**
   * O teste básico: verifica se a instância do componente foi criada com sucesso.
   */
  it('should create', () => {
    expect(component).toBeTruthy();
  });
});