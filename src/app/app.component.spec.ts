import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AppComponent } from './app.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { HeaderComponent } from './shared/header/header.component';
import { CardComponent } from './components/card/card.component';
import { PaginationComponent } from './components/pagination/pagination.component';
import { MatIcon } from '@angular/material/icon';
import { MatToolbar, MatToolbarRow } from '@angular/material/toolbar';
import { MatPaginator } from '@angular/material/paginator';
 
describe('AppComponent', async () => {
  beforeEach(() => {
    let configureTesting = TestBed.configureTestingModule({
    imports: [HttpClientTestingModule, RouterTestingModule],
    declarations: [MatIcon, MatToolbar, MatToolbarRow, PaginationComponent, MatPaginator, AppComponent, CardComponent, HeaderComponent]
  });

  configureTesting.compileComponents();

  });

  it('Verificar se está construindo o componente', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });
});
