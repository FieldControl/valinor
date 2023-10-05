import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { HeaderComponent } from './header.component';


describe('HeaderComponent', () => {

      beforeEach(() => TestBed.configureTestingModule({
        imports: [HttpClientTestingModule], 
        providers: [HeaderComponent]
      }));

       it('should be created', () => {
        const service: HeaderComponent = TestBed.get(HeaderComponent);
        expect(service).toBeTruthy();
       });
});

