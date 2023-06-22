import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Pipe({
  name: 'base64Image',
})
export class Base64ImagePipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

  transform(base64Image: string): SafeResourceUrl {
    if (base64Image) {
      return this.sanitizer.bypassSecurityTrustResourceUrl(
        `data:image/png;${base64Image}`
      );
    }
    return '';
  }
}
