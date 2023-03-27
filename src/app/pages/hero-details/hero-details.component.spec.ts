import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HeroDetailsComponent } from './hero-details.component';
import { HeroesService } from 'src/app/shared/services/heroes.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';
import { HeaderComponent } from 'src/app/shared/components/header/header.component';

describe('HeroDetailsComponent', () => {
  let component: HeroDetailsComponent;
  let fixture: ComponentFixture<HeroDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HeroDetailsComponent, HeaderComponent ],
      providers: [ HeroesService,
        {
          provide: ActivatedRoute,
          useValue: { params: of({ id: 1 }) }
        }
      ],
      imports: [ HttpClientTestingModule, FormsModule, RouterTestingModule ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HeroDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });
});




