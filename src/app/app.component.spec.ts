import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from './services/auth.service';
import { of } from 'rxjs';
import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let dialog: jasmine.SpyObj<MatDialog>;
  let authService: AuthService;

  beforeEach(async () => {
    const dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
    dialogSpy.open.and.returnValue({ afterClosed: () => of(null) });

    await TestBed.configureTestingModule({
      imports: [
        BrowserAnimationsModule,
        DragDropModule,
        AppComponent
      ],
      providers: [
        { provide: MatDialog, useValue: dialogSpy },
        AuthService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    dialog = TestBed.inject(MatDialog) as jasmine.SpyObj<MatDialog>;
    authService = TestBed.inject(AuthService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty columns', () => {
    expect(component.columns.length).toBe(3);
    component.columns.forEach(column => {
      expect(column.tasks.length).toBe(0);
    });
  });

  it('should return connected list IDs', () => {
    const connectedLists = component.getConnectedList();
    expect(connectedLists).toEqual(['todo', 'inProgress', 'done']);
  });

  it('should open task dialog for new task', () => {
    component.openTaskDialog();
    expect(dialog.open).toHaveBeenCalled();
  });

  it('should delete task when requested', () => {
    const task = { id: 1, title: 'Test Task', description: 'Test Description' };
    component.columns[0].tasks.push(task);
    
    component.deleteTask(1);
    
    component.columns.forEach(column => {
      expect(column.tasks.find(t => t.id === 1)).toBeUndefined();
    });
  });

  it('should clear tasks on logout', () => {
    const task = { id: 1, title: 'Test Task', description: 'Test Description' };
    component.columns[0].tasks.push(task);
    
    component.logout();
    
    component.columns.forEach(column => {
      expect(column.tasks.length).toBe(0);
    });
  });
});