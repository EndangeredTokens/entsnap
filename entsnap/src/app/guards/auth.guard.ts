import { Injectable, inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { switchMap, catchError, take } from 'rxjs/operators';
import { Observable, of } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
class AuthGuard {

    constructor(
        private authService: AuthService,
        private router: Router
    ) { }

    canActivate(): Observable<boolean> {
        if (this.authService.offlineMode){
            return of(true)
        }

        const token = localStorage.getItem("auth_token");

        return this.authService.isAuthenticated(token!).pipe(
            take(1),
            switchMap(isAuthenticated => {
                if (isAuthenticated) {
                    return of(true);
                } else {
                    this.router.navigate(['/login']);
                    return of(false);
                }
            }),
            catchError(error => {
                console.error("Error occurred while checking authentication", error);
                this.router.navigate(['/login']);
                return of(false);
            })
        );
    }
}

export const isAuthGuard: CanActivateFn = (): Observable<boolean> => {
  return inject(AuthGuard).canActivate();
}

