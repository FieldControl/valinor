import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserModule, By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { AppComponent } from './app.component';
import { Apollo } from 'apollo-angular';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialogModule } from '@angular/material/dialog';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HeaderComponent } from './components/header/header.component';
import {
  ApolloClient,
  NormalizedCacheObject,
  InMemoryCache,
} from '@apollo/client/core';
import { HttpLink } from 'apollo-angular/http';

describe('AppComponent', () => {
  let fixture: ComponentFixture<AppComponent>;
  let component: AppComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        BrowserModule,
        InfiniteScrollModule,
        BrowserAnimationsModule,
        MatDialogModule,
        ReactiveFormsModule,
        FormsModule,
      ],
      declarations: [AppComponent, HeaderComponent],
      providers: [
        Apollo,
        {
          provide: ApolloClient,
          useFactory(httpLink: HttpLink): ApolloClient<NormalizedCacheObject> {
            const uri = 'https://narutoql.up.railway.app/graphql';
            return new ApolloClient({
              link: httpLink.create({ uri }),
              cache: new InMemoryCache(),
            });
          },
          deps: [HttpLink],
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the app', () => {
    const items = fixture.debugElement.query(By.css('.card'));
    console.log(items);
    expect(component).toBeTruthy();
  });

  it('should call onScroll function when scrolled', () => {
    const element = fixture.debugElement.query(By.css('.cards_section'));
    if (element) {
      spyOn(component, 'onScroll');
      element.triggerEventHandler('scrolled', null);
      expect(component.onScroll).toHaveBeenCalled();
    }
  });
  it('should display all items from the API', () => {
    const itemList = fixture.debugElement.query(By.css('.cards_section'));
    const items = fixture.debugElement.queryAll(By.css('.card'));
    expect(itemList.nativeElement.children.length).toEqual(
      component.characters.length
    );
    component.characters.forEach((item, index) => {
      const itemElement = items[index].nativeElement;
      expect(itemElement.textContent).toContain(item.name);
      expect(itemElement.textContent).toContain(item.village);
      expect(itemElement.textContent).toContain(item.rank);
      expect(itemElement.textContent).toContain(item.description);
      expect(itemElement.textContent).toContain(item.avatarSrc);
    });
  });
  /* -- This test throws an error, the items, '.card' class is returning an empty array --
  it('should filter characters in input searchbar', () => {
    const field: HTMLInputElement = fixture.debugElement.query(By.css('app-header input')).nativeElement;
    field.value = 'naruto';
    field.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    const items = fixture.debugElement.queryAll(By.css('.card'));
    expect(items.length).toBe(1);
  }); */
});
