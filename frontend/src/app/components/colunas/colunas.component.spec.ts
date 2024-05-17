import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ColunasComponent } from './colunas.component';

describe('ColunasComponent', () => {
  let component: ColunasComponent;
  let fixture: ComponentFixture<ColunasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ColunasComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ColunasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
