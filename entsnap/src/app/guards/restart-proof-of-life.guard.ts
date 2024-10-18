import { CanActivateFn, CanDeactivateFn } from '@angular/router';
import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { RouteHistoryService } from '../services/route-history.service';

@Injectable({
    providedIn: 'root',
})
class RestartProofOfLifeGuard {
    constructor() {}

    canActivate(nextUrl: string): Observable<boolean> {
        console.log('[restart proof of life guard]');
        localStorage.removeItem('frontal');
        localStorage.removeItem('leave');
        localStorage.removeItem('trunk');
        localStorage.removeItem('scale');
        return of(true);
    }
}

export const RestartProofOfLifeOnActivateGuard: CanActivateFn = (
    route,
    state,
): Observable<boolean> => {
    return inject(RestartProofOfLifeGuard).canActivate(state.url);
};
