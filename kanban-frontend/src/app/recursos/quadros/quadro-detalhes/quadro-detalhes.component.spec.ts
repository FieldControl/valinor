import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuadroDetalhesComponent } from './quadro-detalhes.component';

describe('QuadroDetalhesComponent', () => {
  let component: QuadroDetalhesComponent;
  let fixture: ComponentFixture<QuadroDetalhesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuadroDetalhesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(QuadroDetalhesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
