// import { ComponentFixture, TestBed } from '@angular/core/testing';
// import { HeaderComponent } from 'src/app/shared/components/header/header.component';

// import { HomeComponent } from './home.component';

// describe('HomeComponent', () => {
//   let component: HomeComponent;
//   let fixture: ComponentFixture<HomeComponent>;

//   beforeEach(async () => {
//     await TestBed.configureTestingModule({
//       declarations: [ HomeComponent, HeaderComponent ]
//     })
//     .compileComponents();

//     fixture = TestBed.createComponent(HomeComponent);
//     component = fixture.componentInstance;
//     fixture.detectChanges();
//   });

//   it('should create', () => {
//     expect(component).toBeTruthy();
//   });
// });


import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HomeComponent } from './home.component';
import { HeroesService } from 'src/app/shared/services/heroes.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';
import { HeaderComponent } from 'src/app/shared/components/header/header.component';
import { HeroesListComponent } from 'src/app/components/heroes-list/heroes-list.component';
import { MatPaginatorModule } from '@angular/material/paginator';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HomeComponent, HeaderComponent, HeroesListComponent ],
      providers: [ HeroesService,
        {
          provide: ActivatedRoute,
          useValue: { params: of({ id: 1 }) }
        }
      ],
      imports: [ HttpClientTestingModule, FormsModule, RouterTestingModule, MatPaginatorModule ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });
});
