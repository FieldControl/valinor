import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExcluirComponent } from './excluir.component';

describe('ExcluirComponent', () => {
  let component: ExcluirComponent;
  let fixture: ComponentFixture<ExcluirComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExcluirComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExcluirComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
