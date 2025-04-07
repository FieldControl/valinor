import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaginaPrincipalComponent } from './pagina-principal.component';



describe('PaginaPrincipalComponent', () => {
  let component: PaginaPrincipalComponent;
  let fixture: ComponentFixture<PaginaPrincipalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaginaPrincipalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaginaPrincipalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
