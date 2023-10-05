import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FooterComponent } from './footer.component';


describe('HeaderComponent', () => {

      beforeEach(() => TestBed.configureTestingModule({
        imports: [HttpClientTestingModule], 
        providers: [FooterComponent]
      }));

       it('should be created', () => {
        const service: FooterComponent = TestBed.get(FooterComponent);
        expect(service).toBeTruthy();
       });
});
