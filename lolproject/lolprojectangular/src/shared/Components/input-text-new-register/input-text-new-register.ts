import { Component, Input, OnInit, forwardRef } from '@angular/core';
import { FormControl, NG_VALUE_ACCESSOR } from '@angular/forms';

const INPUT_FIELD_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => InputTextNewRegister),
  multi: true
};
@Component({
  selector: '../input-text-new-register',
  templateUrl: '../input-text-new-register/input-text-new-register.html',
  styleUrls: ['../input-text-new-register/input-text-new-register.scss'],
  providers: INPUT_FIELD_VALUE_ACCESSOR
})


export class InputTextNewRegister implements OnInit{
  @Input() type!: string;
  @Input() label!: string;
  @Input() placeholder!: string;
  @Input() password = false;
  @Input() control: any;
  inputType = 'text';


  private innerValue: any;

  ngOnInit() {
    if (this.password) {
      this.inputType = 'password';
    }
  }

  get value() {
    return this.innerValue;
  }

  set value(v: any) {
    if (v !== this.innerValue) {
      this.innerValue = v;
      this.onChangeCb(v);
    }
  }

  onChangeCb: (_: any) => void = () => {};
  onTouchedCb: (_: any) => void = () => {};

  writeValue(v: any): void {
    this.value = v;
  }

  registerOnChange(fn: any): void {
    this.onChangeCb = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouchedCb = fn;
  }

}
