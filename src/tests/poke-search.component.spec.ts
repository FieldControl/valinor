import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { PokeSearchComponent } from '../app/shared/poke-search/poke-search.component';

describe('PokeSearchComponent', () => {
  let component: PokeSearchComponent;
  let fixture: ComponentFixture<PokeSearchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PokeSearchComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PokeSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit search value on button click', () => {
    spyOn(component.emmitSearch, 'emit');
    const button = fixture.debugElement.query(By.css('button')).nativeElement;
    const input = fixture.debugElement.query(By.css('input')).nativeElement;
    input.value = 'bulbasaur';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    button.click();
    expect(component.emmitSearch.emit).toHaveBeenCalledWith('bulbasaur');
  });
});