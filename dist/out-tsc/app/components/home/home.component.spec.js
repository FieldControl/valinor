import { TestBed } from '@angular/core/testing';
import { HomeComponent } from './home.component';
describe('HomeComponent', () => {
    let component;
    let fixture;
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [HomeComponent]
        })
            .compileComponents();
        fixture = TestBed.createComponent(HomeComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });
    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
