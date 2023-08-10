import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HeaderComponent } from './header.component';
import { MatToolbar, MatToolbarRow } from '@angular/material/toolbar';
import { MatIcon } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;

  beforeEach(() => {
    let configureTesting = TestBed.configureTestingModule({
      declarations: [MatIcon, MatToolbar, MatToolbarRow, HeaderComponent],
      imports:[ MatToolbarModule ]
    });
    
    configureTesting.compileComponents();
    
    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
  });

  it('Verificar se está construindo o componente', () => {
    expect(component).toBeTruthy();
  });
});
