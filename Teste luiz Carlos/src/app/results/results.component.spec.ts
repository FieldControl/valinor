import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResultsComponent } from './results.component';

describe('ResultsComponent', () => {
  let component: ResultsComponent;
  let fixture: ComponentFixture<ResultsComponent>;
  let sortDirection: any = {}

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ResultsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ResultsComponent);
    component = fixture.componentInstance;
    component.currentPage = 2
    component.items = []
    component.numOfPages = 4

    sortDirection["login"] = true
    sortDirection["type"] = true
    component.sortDirection = sortDirection
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set number of pages', () => {
    expect(component.pages.length).toEqual(4)
  })

  it('should emit next event', () => {
    spyOn(component.page, 'next');
    component.onNext()
    expect(component.page.next).toHaveBeenCalledWith(3);
  })

  it('should emit prev event', () => {
    spyOn(component.page, 'next');
    component.onPrev()
    expect(component.page.next).toHaveBeenCalledWith(1);
  })

  it('should emit page event', () => {
    spyOn(component.page, 'next');
    component.onPage(3)
    expect(component.page.next).toHaveBeenCalledWith(3);
  })

  it('should emit sort event', () => {
    spyOn(component.sort, 'next');
    const column = 'login'
    component.onSort(column)
    expect(component.sort.next).toHaveBeenCalledWith({ column: column, direction: sortDirection[column]});
  })

  it('should get sort direction', () => {
    const column = 'login';
    expect(component.getSortDirection(column)).toEqual(sortDirection[column])
  })

  
});
