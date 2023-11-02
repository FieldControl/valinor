import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AppComponent } from './app.component';
import { LogoFieldComponent } from './components/logo-field/logo-field.component';
import { PesquisaComponent } from './components/pesquisa/pesquisa.component';
import { ToastrModule } from 'ngx-toastr';
import { RepositorioListaComponent } from './components/repositorio-lista/repositorio-lista.component';
import { IconsModule } from './icons/icons.module';
import { FormsModule } from '@angular/forms';

describe('AppComponent', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        IconsModule,
        ToastrModule.forRoot(),
        FormsModule,
      ],
      declarations: [
        AppComponent,
        LogoFieldComponent,
        PesquisaComponent,
        RepositorioListaComponent,
      ],
    })
  );

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`deve ter o titulo: 'Pesquisa de Repositorios'`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.title).toEqual('Pesquisa de Repositorios');
  });
});
