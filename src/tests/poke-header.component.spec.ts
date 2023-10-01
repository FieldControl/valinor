import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PokeHeaderComponent } from '../app/shared/poke-header/poke-header.component';

describe('PokeHeaderComponent', () => {
  let component: PokeHeaderComponent;
  let fixture: ComponentFixture<PokeHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PokeHeaderComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PokeHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});