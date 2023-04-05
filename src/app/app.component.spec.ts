import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
/* angular material */
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';

describe('AppComponent', () => {
  // Configura o módulo de teste e cria uma instância do componente antes de cada teste
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AppComponent],
      imports: [MatToolbarModule, MatIconModule],
    }).compileComponents();
  });

  // Testa se o componente é criado corretamente
  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

});
