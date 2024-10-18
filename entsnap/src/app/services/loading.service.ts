import { Injectable } from '@angular/core';
import { LoadingController } from '@ionic/angular';
import { AlertController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
@Injectable({
    providedIn: 'root',
})
export class LoadingService {
    private _loadingAnimation!: HTMLIonLoadingElement;
    private _alertAnimation!: HTMLIonAlertElement;

    constructor(
        private loadingController: LoadingController,
        private alertController: AlertController,
        private translate: TranslateService
    ) {}

    async show(): Promise<void> {
        this._loadingAnimation = await this.loadingController.create({
            cssClass: 'transparent',
            message: this.translate.instant('loading_service.LOADING'),
            spinner: 'circles',
        });

        return this._loadingAnimation.present();
    }

    async showCustomTextLoadingAnimation(textToShow: string): Promise<void> {
        this.dismiss();
        this._loadingAnimation = await this.loadingController.create({
            cssClass: 'transparent',
            message: textToShow,
            spinner: 'circles',
        });

        return this._loadingAnimation.present();
    }

    async dismiss(): Promise<boolean> {
        return this._loadingAnimation.dismiss();
    }

    async notificationShow(): Promise<void> {
        this._alertAnimation = await this.alertController.create({
            header: this.translate.instant('loading_service.NO_CONNECTION'),
            subHeader: this.translate.instant('loading_service.CHECK_CONNECTION'),
            buttons: ['OK'],
        });

        return this._alertAnimation.present();
    }

    async notificationErrorShow(text?: string): Promise<void> {
        this._alertAnimation = await this.alertController.create({
            header: this.translate.instant('loading_service.ERROR'),
            subHeader: text
                ? text
                : this.translate.instant('loading_service.DEFAULT_ERROR_MESSAGE'),
            buttons: ['OK'],
        });

        return this._alertAnimation.present();
    }

    async showNotificationBadGpsPrecision(): Promise<void> {
        this._alertAnimation = await this.alertController.create({
            cssClass: 'transparent',
            message: this.translate.instant('loading_service.BAD_GPS_PRECISION'),
        });
        return this._alertAnimation.present();
    }

    async dismissNotification(): Promise<boolean> {
        return this._alertAnimation.dismiss();
    }

    async showNotificatinNonIntersection(): Promise<void> {
        this._alertAnimation = await this.alertController.create({
            cssClass: 'transparent',
            message: this.translate.instant('loading_service.OUT_OF_ENT_RANGE'),
        });
        return this._alertAnimation.present();
    }

    async showNotificationReportIntersection(): Promise<void> {
        this._alertAnimation = await this.alertController.create({
            cssClass: 'transparent',
            message: this.translate.instant('loading_service.ENT_REPORT_TOO_CLOSE'),
            buttons: [
                {
                    text: this.translate.instant('loading_service.CONTINUE'),
                    handler: () => {
                        this.dismissNotification();
                    },
                },
            ],
        });
        return this._alertAnimation.present();
    }
}
