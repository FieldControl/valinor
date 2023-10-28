import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardComponent } from './card.component';
import { By } from '@angular/platform-browser';

describe('CardComponent', () => {
  let component: CardComponent;
  let fixture: ComponentFixture<CardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CardComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize shouldOpenModa as false', () => {
    expect(component.shouldOpenModal).toBeFalse();
  });

  it('should call openModal function when the button more is clicked', () => {
    const openModalSpy = spyOn(component, 'openModal')
    const openModalElement = fixture.debugElement.query(By.css('button[mat-raised-button]'));

    expect(openModalElement).toBeTruthy();
    
    openModalElement.nativeElement.click();

    expect(openModalSpy).toHaveBeenCalled();
  });

  it('should set title via @Input()', () => {
    const title = 'title';

    component.title = title;

    fixture.detectChanges();

    const titleElement = fixture.debugElement.query(By.css('mat-card-title'));

    expect(titleElement.nativeElement.textContent).toContain(title);
  });

  it('should set subtitle via @Input()', () =>{
    const subtitle = 'test';

    component.subtitle = subtitle;

    fixture.detectChanges();

    const subtitleElement = fixture.debugElement.query(By.css('mat-card-subtitle'));

    expect(subtitleElement.nativeElement.textContent).toContain(subtitle);
  })

  it('should set height via @Input()', () => {
    const height = '9999';

    component.height = height;

    fixture.detectChanges();

   const heightElement = fixture.debugElement.query(By.css('.height'))

    expect(heightElement.nativeElement.textContent).toContain(height); 
  });
  it('should set mass via @Input()', () => {
    const mass = '999';
  
    component.mass = mass;
  
    fixture.detectChanges();
  
    const massElement = fixture.debugElement.query(By.css('.weight'));
  
    expect(massElement.nativeElement.textContent).toContain(mass);
  });
  
  it('should set hairColor via @Input()', () => {
    const hairColor = 'test';
  
    component.hairColor = hairColor;
  
    fixture.detectChanges();
  
    const hairColorElement = fixture.debugElement.query(By.css('.hairColor'));
  
    expect(hairColorElement.nativeElement.textContent).toContain(hairColor);
  });
  
  it('should set eyeColor via @Input()', () => {
    const eyeColor = 'Green';
  
    component.eyeColor = eyeColor;
  
    fixture.detectChanges();
  
    const eyeColorElement = fixture.debugElement.query(By.css('.eyeColor'));
  
    expect(eyeColorElement.nativeElement.textContent).toContain(eyeColor);
  });
  
  it('should set gender via @Input()', () => {
    const gender = 'Female';
  
    component.gender = gender;
  
    fixture.detectChanges();
  
    const genderElement = fixture.debugElement.query(By.css('.gender'));
  
    expect(genderElement.nativeElement.textContent).toContain(gender);
  });

});
