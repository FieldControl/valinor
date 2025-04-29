import { TestBed } from '@angular/core/testing';
import { HeaderComponent } from './header.component';
describe('HeaderComponent', () => {
    let component;
    let fixture;
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [HeaderComponent]
        })
            .compileComponents();
        fixture = TestBed.createComponent(HeaderComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });
    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
