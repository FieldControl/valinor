import { TestBed } from '@angular/core/testing';
import { FooterComponent } from './footer.component';
describe('FooterComponent', () => {
    let component;
    let fixture;
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [FooterComponent]
        })
            .compileComponents();
        fixture = TestBed.createComponent(FooterComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });
    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
