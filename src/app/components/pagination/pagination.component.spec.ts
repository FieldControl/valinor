import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PaginationComponent } from './pagination.component';
import { MatPaginator } from '@angular/material/paginator';
import { MatTooltip  } from '@angular/material/tooltip';
import { MatMenu } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';

describe('PaginationComponent', () => {
  let component: PaginationComponent;
  let fixture: ComponentFixture<PaginationComponent>;

  beforeEach(() => {
    let configureTesting = TestBed.configureTestingModule({
      declarations: [ MatMenu, MatTooltip, MatPaginator, PaginationComponent ],
      imports: [MatTooltipModule] 
    });

    configureTesting.compileComponents();

    fixture = TestBed.createComponent(PaginationComponent);
    component = fixture.componentInstance;
  });

  it('Verificar se está construindo o componente', () => {
    expect(component).toBeTruthy();
  });
});
