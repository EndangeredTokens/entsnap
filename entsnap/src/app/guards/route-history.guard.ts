import { CanActivateFn, CanDeactivateFn } from '@angular/router';
import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { RouteHistoryService } from '../services/route-history.service';

@Injectable({
    providedIn: 'root',
})
class RouteHistoryGuard {
    constructor(private routeHistoryService: RouteHistoryService) {}

    canDeactivate(nextUrl: string): Observable<boolean> {
        this.routeHistoryService.addRoute(nextUrl);
        return of(true); // and will always allow to leave the page
    }

    canActivate(nextUrl: string): Observable<boolean> {
        console.log('[route history guard]');
        this.routeHistoryService.addRoute(nextUrl);
        return of(true);
    }
}

export const RouteHistoryOnActivateGuard: CanActivateFn = (
    route,
    state,
): Observable<boolean> => {
    return inject(RouteHistoryGuard).canActivate(state.url);
};
