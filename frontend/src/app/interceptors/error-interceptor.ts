import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { tap } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const snackBar = inject(MatSnackBar);

  return next(req).pipe(
    tap({
      error: (error: HttpErrorResponse) => {
        let errorMessage = 'Erro desconhecido';

        if (Array.isArray(error.error?.message)) {
          errorMessage = error.error?.message.join('\n');
        }

        snackBar.open(errorMessage, 'Fechar', {
          duration: 3000,
          horizontalPosition: 'end',
          verticalPosition: 'top',
          panelClass: ['error-snackbar'],
        });
      },
    })
  );
};
