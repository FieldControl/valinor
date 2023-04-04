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

  // Testa se o título da página é igual a 'Marvel'
  it(`should have as title 'marvel'`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.title).toEqual('Marvel');
  });

  /* Verifica se a imagem está sendo carregada */
  it('should load the logo image correctly', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const logoImg =
      fixture.debugElement.nativeElement.querySelector('#imgLogo');
    expect(logoImg).toBeTruthy();
    expect(logoImg.src).toContain('assets/img/logo/android-chrome-384x192.png');
  });

  /* Verifica se o h1 "Marvel" da página não sumiu */
  it('should render title', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('#h1Title')?.textContent).toContain('Marvel');
  });

  /* verifica se o botão DarkMode está com o fundo transparente */
  it('should have transparent background on buttonDarkMode', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const buttonDarkMode =
      fixture.debugElement.nativeElement.querySelector('#buttonDarkMode');
    const backgroundColor = getComputedStyle(buttonDarkMode).backgroundColor;
    expect(backgroundColor).toEqual('rgba(0, 0, 0, 0)');
  });

  /* Verifica se a variável DarkTheme é alternada quando o método toggleTheme é chamado */
  it('should toggle DarkTheme variable when toggleTheme is called', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.DarkTheme).toBeFalse();
    app.toggleTheme();
    expect(app.DarkTheme).toBeTrue();
    app.toggleTheme();
    expect(app.DarkTheme).toBeFalse();
  });

  /* Verifica se a classe dark-theme é adicionada ao corpo quando DarkTheme é verdadeiro */
  it('should add dark-theme class to body when DarkTheme is true', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    app.DarkTheme = true;
    app.applyTheme();
    expect(document.body.classList.contains('dark-theme')).toBeTrue();
    expect(document.body.classList.contains('light-theme')).toBeFalse();
  });

  /* Verifica se a classe light-theme é adicionada ao corpo quando DarkTheme é falso */
  it('should add light-theme class to body when DarkTheme is false', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    app.DarkTheme = false;
    app.applyTheme();
    expect(document.body.classList.contains('light-theme')).toBeTrue();
    expect(document.body.classList.contains('dark-theme')).toBeFalse();
  });

});
