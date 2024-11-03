import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function dateTodayOrAfterValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const selectedDate = new Date(control.value);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set the time to midnight to compare only the date part

    if (selectedDate < today) {
      return { dateInvalid: true };
    }
    return null;
  };
}
