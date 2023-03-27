import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HeroesListComponent } from './heroes-list.component';
import { HeroesService } from 'src/app/shared/services/heroes.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatPaginatorModule } from '@angular/material/paginator';
import { FormsModule } from '@angular/forms';

describe('HeroesListComponent', () => {
  let component: HeroesListComponent;
  let fixture: ComponentFixture<HeroesListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HeroesListComponent ],
      providers: [ HeroesService ],
      imports: [ HttpClientTestingModule, MatPaginatorModule, FormsModule ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HeroesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });
});

