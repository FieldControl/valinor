import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RepoCardComponent } from './repo-card.component';

describe('RepoCardComponent', () => {
  let component: RepoCardComponent;
  let fixture: ComponentFixture<RepoCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RepoCardComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RepoCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  beforeEach(() => {
    const mockDate = new Date(2023, 4, 1, 3, 0, 0, 0);
    jasmine.clock().install();
    jasmine.clock().mockDate(mockDate);
  });

  afterEach(() => {
    jasmine.clock().uninstall();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should return a formatted valid number (starsAmount<= 1.000)', () => {
    component.repository = { starsAmount: 571 } as any;

    const spy = spyOnProperty(component, 'starsCount').and.callThrough();
    expect(component.starsCount).toBe('571');
    expect(spy).toHaveBeenCalled();
  });

  it('should return a formatted valid number (starsAmount <= 10.000)', () => {
    component.repository = { starsAmount: 8200 } as any;

    const spy = spyOnProperty(component, 'starsCount').and.callThrough();
    expect(component.starsCount).toBe('8.2k');
    expect(spy).toHaveBeenCalled();
  });

  it('should return a formatted valid number (starsAmount <= 100.000)', () => {
    component.repository = { starsAmount: 78400 } as any;

    const spy = spyOnProperty(component, 'starsCount').and.callThrough();
    expect(component.starsCount).toBe('78.4k');
    expect(spy).toHaveBeenCalled();
  });

  it('should return a formatted valid number (starsAmount <= 1.000.000)', () => {
    component.repository = { starsAmount: 187520 } as any;

    const spy = spyOnProperty(component, 'starsCount').and.callThrough();
    expect(component.starsCount).toBe('187.5k');
    expect(spy).toHaveBeenCalled();
  });

  it('should return a fixed date', function () {
    var date = new Date();
    expect(date.toISOString()).toBe('2023-05-01T06:00:00.000Z');
  });

  it(`should return the message 'on DD/MM/YYYY, HH:MM:SS'`, () => {
    component.repository = {
      pushedAt: '2023-05-07T00:50:00Z',
    } as any;

    const spy = spyOnProperty(component, 'updatedAgo').and.callThrough();
    expect(component.updatedAgo).toBe('on 06/05/2023, 21:50:00');
    expect(spy).toHaveBeenCalled();
  });

  it(`should return the message 'yesterday'`, () => {
    component.repository = {
      pushedAt: '2023-05-02T18:20:22Z',
    } as any;

    const spy = spyOnProperty(component, 'updatedAgo').and.callThrough();
    expect(component.updatedAgo).toBe('yesterday');
    expect(spy).toHaveBeenCalled();
  });

  it(`should return the message '[...] hours ago'`, () => {
    component.repository = {
      pushedAt: '2023-05-01T10:30:00Z',
    } as any;

    const spy = spyOnProperty(component, 'updatedAgo').and.callThrough();
    expect(component.updatedAgo).toBe('4 hours ago');
    expect(spy).toHaveBeenCalled();
  });

  it(`should return the message '[...] minutes ago'`, () => {
    component.repository = {
      pushedAt: '2023-05-01T06:30:00Z',
    } as any;

    const spy = spyOnProperty(component, 'updatedAgo').and.callThrough();
    expect(component.updatedAgo).toBe('30 minutes ago');
    expect(spy).toHaveBeenCalled();
  });

  it(`should return the message '[...] seconds ago'`, () => {
    component.repository = {
      pushedAt: '2023-05-01T06:00:45Z',
    } as any;

    const spy = spyOnProperty(component, 'updatedAgo').and.callThrough();
    expect(component.updatedAgo).toBe('45 seconds ago');
    expect(spy).toHaveBeenCalled();
  });
});
