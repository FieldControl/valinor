import { FormGroup } from '@angular/forms';


export class FormUtil {
  static touchForm(formGroup: FormGroup) {
    for (const key in formGroup.controls) {
      if (formGroup.controls.hasOwnProperty(key)) {
        const control = formGroup.get(key);
        control.markAsTouched();
        if (control instanceof FormGroup) {
          this.touchForm(control);
        }
      }
    }
  }
}
