import { CanActivateFn } from '@angular/router';
import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { VersionsService } from '../services/version.service';
import { AlertController } from '@ionic/angular';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
class VersionVerificationGuard {
    constructor(private versionService: VersionsService, private alertController: AlertController) {}

    canActivate(): Observable<boolean> {
        this.versionService.checkAppVersion().then(
            async (isVersionValid) => {
                if (isVersionValid) console.log("The app version is up-to-date.");
                else {
                    console.log("The app version is outdated.");
                    const header = "Update your app";
                    const message = "You have to update the app.";
                    const alert = await this.alertController.create({
                        header,
                        message,
                        buttons: [
                            {
                                text: 'Update app',
                                handler: () => {
                                    window.open(
                                        this.versionService.appPlatform == "android" ? environment.playStoreAppUrl : environment.appStoreAppUrl,
                                        '_system'
                                    );
                                    
                                    return false;
                                }
                            }
                        ],
                        cssClass: 'outdated-version-alert',
                    });
                    
                    await alert.present();
                }
            },
            (error) => {
                console.log("Error checking app version:", error);
            }
        );
        return of(true);
    }
}

export const VersionVerificationOnActivateGuard: CanActivateFn = (): Observable<boolean> => {
    return inject(VersionVerificationGuard).canActivate();
};
