import { CanActivateFn, CanDeactivateFn } from '@angular/router';
import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { LocationV2Service } from '../services/location.v2.service';
import { ICanComponentDeactivate } from '../utils/candeactivate.interface';

@Injectable({
    providedIn: 'root'
})
class LocationWatcherGuard {

    constructor(
        private locationService: LocationV2Service
    ) { }

    async canDeactivate(): Promise<boolean> {
        console.log("[locationWatcherGuard.canDeactivate] calling stopPositionWatcher()")
        await this.locationService.stopPositionWatcher().then(() => {
            console.log("[locationWatcherGuard.canDeactivate] watcher stopped")
          })
        return true
    }

    async canActivate(): Promise<boolean> {
        console.log("[locationWatcherGuard.canActivate] calling startPositionWatcher()")
        await this.locationService.startPositionWatcher().then(() => {
            console.log("[locationWatcherGuard.canActivate] watcher started")
          })
        return true
    }
}

export const startLocationWatcherGuard: CanActivateFn = async (route, state): Promise<boolean> => {
    return await inject(LocationWatcherGuard).canActivate();
}

export const stopLocationWatcherGuard: CanDeactivateFn<ICanComponentDeactivate> = async (): Promise<boolean> => {
    return await inject(LocationWatcherGuard).canDeactivate();
}
