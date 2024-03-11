import { HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import Swal from "sweetalert2";
import { TranslateErrorsService } from "./translate-errors-service";

@Injectable({
  providedIn: 'root'
})
export class ExceptionErrorsMessage{
  constructor(private translateErrorService: TranslateErrorsService){}

  exceptionError(exception: HttpErrorResponse):void {
    if (exception.status < 500) {
      const errorsMessages: Array<string> = exception.error.message
      Swal.fire({
        icon: 'error',
        title: `${exception.status}: ${this.translateErrorService.translateCodeError(exception.status)}`,
        html: errorsMessages.join('<br>')
      })
    } else {
      Swal.fire({
        icon: 'error',
        title: `${exception.status}: ${this.translateErrorService.translateCodeError(exception.status)}`,
      })
    }
  }
}
