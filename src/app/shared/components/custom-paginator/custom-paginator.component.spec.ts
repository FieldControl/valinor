import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomPaginatorComponent } from './custom-paginator.component';
import { NgxPaginationModule } from 'ngx-pagination';

describe('CustomPaginatorComponent', () => {
  let component: CustomPaginatorComponent;
  let fixture: ComponentFixture<CustomPaginatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CustomPaginatorComponent],
      imports: [NgxPaginationModule],
    }).compileComponents();

    fixture = TestBed.createComponent(CustomPaginatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
