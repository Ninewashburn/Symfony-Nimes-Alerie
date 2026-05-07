import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject, Injector } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '@core/services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const injector = inject(Injector);
  // Break circularity HttpClient -> Interceptor -> AuthService -> HttpClient
  // using lazy retrieval from injector
  const authService = injector.get(AuthService);
  const token = authService.getToken();

  const cloned = token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;

  return next(cloned).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401 || err.status === 403) {
        authService.logout();
      }
      return throwError(() => err);
    }),
  );
};
